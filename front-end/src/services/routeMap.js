const mapSearch = /\[([^\]\n]+)\]\(https:\/\/[^)\s]+\)\s*\(\[[^\]\n]+\]\((https:\/\/www\.google\.com\/maps\/search\/\?[^)\s]+)\)\)/g;
export function itineraryDays(plan) {
  const days = [];
  let active;
  for (const line of plan.split(/\r?\n/)) {
    const heading = line.replace(/^#+\s*/, "").replace(/\*\*/g, "").match(/^(?:dia|day|jour)\s+(\d+)\b/i);
    if (heading) { active = { number: Number(heading[1]), stops: [] }; days.push(active); }
    for (const match of line.matchAll(mapSearch)) {
      const query = new URL(match[2]).searchParams.get("query");
      if (!query) continue;
      if (!active) { active = { number: 1, stops: [] }; days.push(active); }
      if (active.stops.at(-1)?.query !== query) active.stops.push({ label: match[1], query, url: match[2] });
    }
  }
  return days;
}

const fixed = new Map([
  // Wikidata Q714828, Kyoto Railway Museum coordinates, and Nishiki Market (OSM).
  ["Fushimi Inari Taisha, 68 Fukakusa Yabunouchi-cho, Fushimi-ku, Kyoto 612-0882, Japan", [135.77339,34.96719]],
  ["Kyoto Railway Museum, Kankiji-cho, Shimogyo-ku, Kyoto, Japan",[135.74250,34.98722]],
  ["Nishiki Market, Nishikikoji Teramachi-Takakura, Nakagyo-ku, Kyoto, Japan",[135.7656,35.0050]],
]);
const names = s => String(s || "").normalize("NFKD").replace(/\p{M}/gu,"").toLowerCase().replace(/[^\p{L}\p{N}]/gu,"");
const same = (a,b) => Boolean(a && b && names(a) === names(b));
const known = new Map();
const routes = new Map();
function remember(cache, key, data) {
  if (cache.size >= 200) cache.delete(cache.keys().next().value);
  cache.set(key, data);
}
export function positionMatches(feature, stop) {
  const p = feature.properties || {};
  const values = stop.query.split(",").map(s => s.trim());
  const country = values.pop(), city = values.pop(), official = values.join(", ");
  const countries = [p.country, p.countrycode];
  if (/^[a-z]{2}$/i.test(p.countrycode)) {
    for (const lang of ["en","fr","pt"]) countries.push(new Intl.DisplayNames([lang],{type:"region"}).of(p.countrycode.toUpperCase()));
  }
  return [official,stop.label].some(n => same(n,p.name)) &&
    [p.city,p.district,p.county,p.state].some(n => same(n,city)) && countries.some(n => same(n,country));
}
async function json(url, signal) {
  const request = new AbortController();
  const abort = () => request.abort();
  if (signal.aborted) throw new DOMException("Aborted","AbortError");
  signal.addEventListener("abort",abort,{ once:true });
  const timer = setTimeout(abort,7000);
  try {
    const r = await fetch(url,{signal:request.signal});
    if (!r.ok) throw new Error("Map service unavailable");
    return await r.json();
  } finally { clearTimeout(timer); signal.removeEventListener("abort",abort); }
}
export async function locate(stop, signal) {
  if (fixed.has(stop.query)) return {point:fixed.get(stop.query)};
  if (known.has(stop.query)) return known.get(stop.query);
  const data = await json("https://photon.komoot.io/api/?limit=5&q="+encodeURIComponent(stop.query),signal);
  const features = (data.features || []).filter(f=> f.geometry?.type==="Point" && f.geometry.coordinates.length===2 && f.geometry.coordinates.every(Number.isFinite));
  const matches = features.filter(f=>positionMatches(f,stop));
  const result = matches.length===1 ? {point:matches[0].geometry.coordinates} : {choices:features.map(f=>({
    point:f.geometry.coordinates, name:[f.properties.name,f.properties.street,f.properties.city,f.properties.country].filter(Boolean).join(", ")
  }))};
  if (result.point || result.choices?.length) remember(known,stop.query,result);
  return result;
}

let nextRequest = 0;
export async function walkingLines(stops, signal) {
  const runs = [];
  let run = [];
  for (const stop of [...stops,{}]) {
    if (stop.point) run.push(stop.point);
    else { if (run.length>1) runs.push(run); run=[]; }
  }
  const features = [];
  let failed = false;
  for (const points of runs) {
    const coords = points.map(p=>p.join(",")).join(";");
    if (!routes.has(coords)) {
      const start = Math.max(Date.now(),nextRequest);
      nextRequest = start + 1100;
      await new Promise(resolve=>setTimeout(resolve,Math.max(0,start-Date.now())));
      try {
        const response = await json("https://routing.openstreetmap.de/routed-foot/route/v1/driving/"+coords+
          "?overview=full&geometries=geojson&steps=false&radiuses="+points.map(()=>"200").join(";"),signal);
        const line = response.routes?.[0]?.geometry;
        if (response.code!=="Ok" || line?.type!=="LineString" || line.coordinates.length<2) throw new Error("No route");
        remember(routes,coords,{type:"Feature",geometry:line,properties:{}});
      } catch (error) { if (signal.aborted) throw error; failed=true; continue; }
    }
    features.push(routes.get(coords));
  }
  return {features,failed};
}
