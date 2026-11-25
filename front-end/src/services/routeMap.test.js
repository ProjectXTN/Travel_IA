import { itineraryDays, positionMatches, locate, walkingLines } from "./routeMap";

const tripLine = (name,city) => "["+name+"](https://en.wikipedia.org/wiki/Example) ([Search Maps](https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(name+", "+city)+"))";
afterEach(()=>{ delete global.fetch; });

test("groups POIs in visiting order and keeps days without a map link",()=>{
  const days=itineraryDays("### Jour 1 — Centre\n"+tripLine("A","Kyoto, Japan")+"\n"+tripLine("B","Uji, Japan")+"\n## Jour 2 — Repos\nDîner libre.");
  expect(days.map(d=>d.number)).toEqual([1,2]);
  expect(days[0].stops.map(s=>s.label)).toEqual(["A","B"]);
  expect(days[1].stops).toEqual([]);
});
test("requires a matching name, local area and country before automatically pinning",()=>{
  const stop={query:"Musée du Louvre, Paris, France",label:"Musée du Louvre"};
  const properties={name:"Musée du Louvre",city:"Paris",country:"France"};
  expect(positionMatches({properties},stop)).toBe(true);
  expect(positionMatches({properties:{...properties,city:"Lens"}},stop)).toBe(false);
  expect(positionMatches({properties:{...properties,name:"Louvre Hotel"}},stop)).toBe(false);
});
test("uses verified Kyoto coordinates without querying a geocoder",async()=>{
  const result=await locate({query:"Fushimi Inari Taisha, 68 Fukakusa Yabunouchi-cho, Fushimi-ku, Kyoto 612-0882, Japan"},new AbortController().signal);
  expect(result.point).toEqual([135.77339,34.96719]);
});
test("requests a pedestrian route only between consecutive located stops",async()=>{
  const line={type:"LineString",coordinates:[[1,2],[2,3]]};
  global.fetch=jest.fn().mockResolvedValue({ok:true,json:async()=>({code:"Ok",routes:[{geometry:line}]})});
  const r=await walkingLines([{point:[1,2]},{point:[2,3]},{},{point:[3,4]}],new AbortController().signal);
  expect(r.features[0].geometry).toEqual(line);
  expect(global.fetch.mock.calls[0][0]).toContain("/routed-foot/route/v1/driving/1,2;2,3?");
  expect(global.fetch).toHaveBeenCalledTimes(1);
});
