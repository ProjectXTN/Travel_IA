import { itineraryDays, positionMatches, locate, walkingLines, rankedChoices, visitOrder } from "./routeMap";

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

test("maps the four Centro Histórico stops in prose in the original order",async()=>{
  const plan="Dia 1 — Centro Histórico\nManhã: Visitar o Paço Imperial e a Praça XV, pontos centrais da história colonial.\nTarde: Caminhar pelo Largo da Carioca e explorar a Catedral Metropolitana, conhecida por seu design.\nNoite: Jantar no Centro com pratos típicos.\nDia 2 — Descanso";
  const days=itineraryDays(plan,"Rio de Janeiro");
  expect(days[0].stops.map(s=>s.label)).toEqual(["Paço Imperial","Praça XV","Largo da Carioca","Catedral Metropolitana"]);
  const stops=await Promise.all(days[0].stops.map(s=>locate(s,new AbortController().signal)));
  expect(stops.every(s=>s.point)).toBe(true);
  global.fetch=jest.fn().mockRejectedValue(new Error("routing offline"));
  const r=await walkingLines(stops,new AbortController().signal);
  expect(r.features[0].properties.approximate).toBe(true);
  expect(r.features[0].geometry.coordinates).toEqual(stops.map(s=>s.point));
  expect(days[1].stops).toEqual([]);
});

test("ranks an intermediate choice by detour and keeps its original selection ID",()=>{
  const stops=[{point:[0,0]},{choices:[{point:[1,4]},{point:[1,0]}]},{point:[2,0]}];
  expect(rankedChoices(stops,1).map(c=>c.id)).toEqual([1,0]);
});
test("keeps Copacabana first and moves Urca ahead of the fort when walking time improves",async()=>{
  const stops=["Copacabana","Fortaleza","Urca"].map((label,i)=>({label,point:[-43.18+i/100,-22.95]}));
  global.fetch=jest.fn().mockResolvedValue({ok:true,json:async()=>({code:"Ok",durations:[[0,75,45],[75,0,30],[45,30,0]]})});
  const result=await visitOrder(stops,new AbortController().signal);
  expect(result.ordered.map(s=>s.label)).toEqual(["Copacabana","Urca","Fortaleza"]);
  expect(result.approximate).toBe(false);
});
test("falls back to proximity and leaves an unresolved stop in place",async()=>{
  const stops=[{point:[0,0]},{point:[2,0]},{point:[1,0]},{choices:[]},{point:[5,0]}];
  global.fetch=jest.fn().mockRejectedValue(new Error("offline"));
  const result=await visitOrder(stops,new AbortController().signal);
  expect(result.ordered).toEqual([stops[0],stops[2],stops[1],stops[3],stops[4]]);
  expect(result.approximate).toBe(true);
});
