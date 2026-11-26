import { readLines, planLeg, transitLink } from "./transitRoute";
import { walkingLines } from "./routeMap";

test("follows station order through a transfer and corrects reversed terminal tags",()=>{
  const stations=["North","Central","South"].map((name,i)=>({type:"node",id:i+1,tags:{name},lon:i,lat:0}));
  const relation=(id,ref,from,to,ids)=>({type:"relation",id,tags:{route:"subway",ref,from,to},members:ids.map(n=>({type:"node",ref:n,role:"stop"}))});
  const lines=readLines([...stations,relation(10,"A","Central","North",[1,2]),relation(11,"B","Central","South",[2,3])]);
  const rides=planLeg(lines,[0,0],[2,0]);
  expect(rides.map(r=>[r.name,r.direction,r.stops[0].name,r.stops.at(-1).name])).toEqual([["A","Central","North","Central"],["B","South","Central","South"]]);
  expect(planLeg(lines,[2,0],[0,0])).toBeNull();
  expect(new URL(transitLink([-43,-22],[-44,-23])).searchParams.get("origin")).toBe("-22,-43");
});
test("keeps car geometry separate from the pedestrian cache",async()=>{
  const points=[{point:[5,0]},{point:[6,0]}];
  global.fetch=jest.fn().mockResolvedValue({ok:true,json:async()=>({code:"Ok",routes:[{geometry:{type:"LineString",coordinates:[[5,0],[6,0]]}}]})});
  try {
    for(const mode of ["walk","car"]) await walkingLines(points,new AbortController().signal,mode);
    expect(global.fetch.mock.calls.map(([url])=>new URL(url).pathname.split("/")[1])).toEqual(["routed-foot","routed-car"]);
  } finally {delete global.fetch;}
});
