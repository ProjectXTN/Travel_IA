const mapSearch = /\[([^\]\n]+)\]\(https:\/\/[^)\s]+\)\s*\(\[[^\]\n]+\]\((https:\/\/www\.google\.com\/maps\/search\/\?[^)\s]+)\)\)|\[([^\]\n]+)\]\((https?:\/\/[^)\s]+)\)/g;
const properName = /(?<![\p{L}’'-])[\p{Lu}][\p{L}\p{M}’'-]*(?:\s+(?:(?:de|da|do|dos|das|des|du|la|of|the|del|di|van|von)\s+)*[\p{Lu}][\p{L}\p{M}’'-]*)*/gu;
const genericName = /^(?:Centro|Manhã|Tarde|Noite|Matin|Soir|Morning|Afternoon|Evening|Lunch|Dinner|Petit|Après-midi|Jantar|Almoço|Visita|Visit|Visite)$/i;

function textStops(text, destination) {
  if (!destination) return [];
  const places = [];
  for (const m of text.replace(/\*\*/g,"").matchAll(properName)) {
    const label = m[0];
    if (genericName.test(label) || same(label,destination)) continue;
    // A single capitalized word often starts an instruction. Accept it in place context.
    const before = m.input.slice(0,m.index);
    if (!label.includes(" ") && !/(?:\b(?:em|no|na|ao|a|o|pela?|ou|até|in|at|to|or|à|au|le|la|les|ou|vers)\s+|[’'])$/i.test(before)) continue;
    places.push(makeStop(label, destination));
  }
  return places;
}
function makeStop(label, destination) {
  const query = [label,destination].filter(Boolean).join(", ");
  return {label,destination,query,url:"https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(query)};
}
export function itineraryDays(plan, destination="") {
  const days=[];
  let active;
  for (let line of plan.split(/\r?\n/)) {
    line=line.trim().replace(/<a\s+[^>]*?href=["'](https?:\/\/[^"']+)["'][^>]*>([^<>]*)<\/a>/gi,"[$2]($1)");
    const heading=line.replace(/^#+\s*/, "").replace(/\*\*/g, "").match(/^(?:dia|day|jour)\s+(\d+)\b/i);
    if (heading) { active={number:Number(heading[1]),stops:[]}; days.push(active); continue; }
    const found=[];
    let end=0;
    for(const m of line.matchAll(mapSearch)) {
      found.push(...textStops(line.slice(end,m.index),destination));
      const url=new URL(m[2] || m[4]);
      const query=url.hostname==="www.google.com" ? url.searchParams.get("query") : null;
      const label=m[1] || (query ? query.split(",")[0] : m[3]);
      found.push(query ? {label,query,url:url.href} : makeStop(label,destination));
      end=m.index+m[0].length;
    }
    if(active) found.push(...textStops(line.slice(end),destination));
    if(found.length && !active) {active={number:1,stops:[]};days.push(active);}
    for(const stop of found) if(!same(active.stops.at(-1)?.label,stop.label)) active.stops.push(stop);
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
const rioPoints = new Map([
  ["pacoimperial",[-43.174712,-22.903833]],
  ["pracaxv",[-43.173611,-22.903056]],
  ["pracaxvdenovembro",[-43.173611,-22.903056]],
  ["largodacarioca",[-43.178147,-22.906842]],
  ["catedralmetropolitana",[-43.180701,-22.910828]],
  ["catedralmetropolitanadesaosebastiao",[-43.180701,-22.910828]],
]);
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
  if (stop.destination) {
    const [locality, region] = stop.destination.split(",").map(v=>v.trim());
    return same(p.name,stop.label) && [p.city,p.district,p.county].some(v=>same(v,locality)) &&
      (!region || [...countries,p.state].some(v=>same(v,region)));
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
  const parts=stop.query.split(",").map(names);
  if (parts.slice(1).includes("riodejaneiro") && rioPoints.has(names(stop.label))) return {point:rioPoints.get(names(stop.label))};
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
      await routingSlot(signal);
      try {
        const response = await json("https://routing.openstreetmap.de/routed-foot/route/v1/driving/"+coords+
          "?overview=full&geometries=geojson&steps=false&radiuses="+points.map(()=>"200").join(";"),signal);
        const line = response.routes?.[0]?.geometry;
        if (response.code!=="Ok" || line?.type!=="LineString" || line.coordinates.length<2) throw new Error("No route");
        remember(routes,coords,{type:"Feature",geometry:line,properties:{}});
      } catch (error) { if (signal.aborted) throw error; failed=true;
        features.push({type:"Feature",geometry:{type:"LineString",coordinates:points},properties:{approximate:true}});
        continue; }
    }
    features.push(routes.get(coords));
  }
  return {features,failed};
}

function distanceKm(a,b) {
  const radians=Math.PI/180;
  const lat=(b[1]-a[1])*radians;
  const lon=(b[0]-a[0])*radians;
  const h=Math.sin(lat/2)**2+Math.cos(a[1]*radians)*Math.cos(b[1]*radians)*Math.sin(lon/2)**2;
  return 12742*Math.asin(Math.sqrt(Math.min(1,h)));
}

export function rankedChoices(stops,index) {
  const before=stops.slice(0,index).reverse().find(s=>s.point)?.point;
  const after=stops.slice(index+1).find(s=>s.point)?.point;
  return (stops[index].choices || []).map((choice,id)=>{
    let extra=null;
    if(before && after) extra=Math.max(0,distanceKm(before,choice.point)+distanceKm(choice.point,after)-distanceKm(before,after));
    else if(before || after) extra=distanceKm(before || after,choice.point);
    return {...choice,id,extra};
  }).sort((a,b)=>a.extra-b.extra);
}

const matrices=new Map();
async function routingSlot(signal) {
  const start=Math.max(Date.now(),nextRequest);
  nextRequest=start+1100;
  await new Promise(resolve=>setTimeout(resolve,Math.max(0,start-Date.now())));
  if(signal.aborted) throw new DOMException("Aborted","AbortError");
}

// Keep the start fixed. Compare the entire open route, including the final leg.
function improveOrder(matrix) {
  let order=matrix.map((_,i)=>i);
  const cost=indices=>indices.slice(1).reduce((sum,id,i)=>sum+matrix[indices[i]][id],0);
  let bestCost=cost(order);
  for(let pass=0;pass<order.length;pass++) {
    let best=order;
    for(let from=1;from<order.length;from++) {
      for(let to=1;to<order.length;to++) {
        if(from===to) continue;
        const candidate=order.slice();
        candidate.splice(to,0,candidate.splice(from,1)[0]);
        const score=cost(candidate);
        if(score<bestCost*0.9999) {best=candidate;bestCost=score;}
      }
    }
    if(best===order) break;
    order=best;
  }
  return order;
}

export async function visitOrder(stops,signal) {
  const ordered=stops.slice();
  let approximate=false;
  for(let start=0;start<stops.length;) {
    if(!stops[start].point) {start++;continue;}
    let end=start+1;
    while(end<stops.length && stops[end].point) end++;
    const run=stops.slice(start,end);
    if(run.length>=3 && run.length<=32) {
      const coords=run.map(s=>s.point.join(",")).join(";");
      let matrix=matrices.get(coords);
      if(!matrix) {
        try {
          await routingSlot(signal);
          const result=await json("https://routing.openstreetmap.de/routed-foot/table/v1/driving/"+coords+
            "?annotations=duration&radiuses="+run.map(()=>"200").join(";"),signal);
          if(result.code!=="Ok" || result.durations?.length!==run.length ||
            !result.durations.every(row=>row?.length===run.length && row.every(v=>Number.isFinite(v) && v>=0))) throw new Error("Incomplete matrix");
          matrix=result.durations;
          remember(matrices,coords,matrix);
        } catch(error) {
          if(signal.aborted) throw error;
          approximate=true;
          matrix=run.map(a=>run.map(b=>distanceKm(a.point,b.point)));
        }
      }
      ordered.splice(start,run.length,...improveOrder(matrix).map(i=>run[i]));
    }
    start=end;
  }
  return {ordered,approximate};
}
