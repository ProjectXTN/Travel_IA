import { distanceKm } from "./routeMap";

const cache=new Map();
const radius=1000;

function networkQuery(points) {
  const circles=points.map(([lon,lat])=>"nwr(around:"+radius+","+lat+","+lon+")[public_transport];node(around:"+radius+","+lat+","+lon+")[highway=bus_stop];").join("");
  return '[out:json][timeout:18];('+circles+')->.near;rel(bn.near)["route"~"^(bus|subway|tram|light_rail|train)$"]->.a;rel(bw.near)["route"~"^(bus|subway|tram|light_rail|train)$"]->.b;(.a;.b;)->.lines;.lines out body; (node(r.lines:"stop");node(r.lines:"platform");node(r.lines:"stop_entry_only");node(r.lines:"stop_exit_only");node(r.lines:"platform_entry_only");node(r.lines:"platform_exit_only");way(r.lines:"platform"););out center;';
}

export function readLines(elements) {
  const objects=new Map(elements.map(e=>[e.type+e.id,e]));
  const lines=[];
  for(const r of elements.filter(e=>e.type==="relation")) {
    const stops=[];
    for(const m of r.members || []) {
      if(!/^(stop|platform)(?:_(entry|exit)_only)?$/.test(m.role)) continue;
      const e=objects.get(m.type+m.ref), pos=e?.center || e;
      if(!e?.tags?.name || !Number.isFinite(pos.lon) || !Number.isFinite(pos.lat)) continue;
      const stop={name:e.tags.name,point:[pos.lon,pos.lat],board:!m.role.endsWith("exit_only"),exit:!m.role.endsWith("entry_only")};
      const prev=stops[stops.length-1];
      if(prev?.name===stop.name && distanceKm(prev.point,stop.point)<0.2) continue;
      stops.push(stop);
    }
    if(stops.length<2 || !(r.tags?.ref || r.tags?.name) || !r.tags?.to) continue;
    const first=stops[0].name, last=stops[stops.length-1].name;
    const reversed=first===r.tags.to && last===r.tags.from;
    if(first===r.tags.to && !reversed && first!==last) continue;
    lines.push({id:r.id,name:r.tags.ref || r.tags.name,mode:r.tags.route,direction:reversed?last:r.tags.to,stops});
  }
  return lines;
}

export function planLeg(lines,from,to) {
  if(!from || !to) return null;
  function nearby(point,field) {
    return lines.flatMap(line=>line.stops.flatMap((stop,i)=>{
      const km=distanceKm(point,stop.point);
      return stop[field] && km<=radius/1000 ? [{line,i,km}] : [];
    })).sort((a,b)=>a.km-b.km).slice(0,60);
  }
  const starts=nearby(from,"board"), ends=nearby(to,"exit");
  let best=null, score=Infinity;
  const ride=(line,a,b)=>({name:line.name,mode:line.mode,direction:line.direction,stops:line.stops.slice(a,b+1)});
  for(const a of starts) for(const b of ends) {
    const walk=(a.km+b.km)*12;
    if(walk>=score) continue;
    if(a.line===b.line && a.i<b.i) {
      const cost=walk+b.i-a.i;
      if(cost<score){score=cost;best=[ride(a.line,a.i,b.i)];}
    }
  }
  // A transfer uses the same named stop, nearby platforms, and forward travel on both lines.
  const boardings=new Map();
  for(const b of ends) for(let j=0;j<b.i;j++) {
    const stop=b.line.stops[j];
    if(!stop.board) continue;
    if(!boardings.has(stop.name)) boardings.set(stop.name,[]);
    boardings.get(stop.name).push({b,j,stop});
  }
  for(const a of starts) for(let i=a.i+1;i<a.line.stops.length;i++) {
    const stop=a.line.stops[i];
    if(!stop.exit) continue;
    for(const {b,j,stop:next} of boardings.get(stop.name) || []) {
      if(a.line.id===b.line.id || distanceKm(stop.point,next.point)>0.15) continue;
      const cost=(a.km+b.km)*12+i-a.i+b.i-j+8;
      if(cost<score){score=cost;best=[ride(a.line,a.i,i),ride(b.line,j,b.i)];}
    }
  }
  return best;
}

export async function transitRoute(stops,signal) {
  const points=stops.filter(s=>s.point).map(s=>s.point);
  const legs=new Array(Math.max(0,stops.length-1)).fill(null);
  const features=[];
  if(points.length<2)return {legs,features};
  const key=JSON.stringify(points);
  let lines=cache.get(key);
  if(!lines) {
    const local=new AbortController(), abort=()=>local.abort();
    if(signal.aborted) return {legs,features};
    signal.addEventListener("abort",abort,{once:true});
    const timer=setTimeout(abort,22000);
    try {
      const url="https://maps.mail.ru/osm/tools/overpass/api/interpreter?data="+encodeURIComponent(networkQuery(points));
      const response=await fetch(url,{signal:local.signal});
      if(!response.ok) throw new Error("Transit unavailable");
      const data=await response.json();
      if(data.remark || !Array.isArray(data.elements)) throw new Error("Incomplete network");
      lines=readLines(data.elements);
      if(cache.size>=12) cache.delete(cache.keys().next().value);
      cache.set(key,lines);
    } catch {return {legs,features};}
    finally {clearTimeout(timer);signal.removeEventListener("abort",abort);}
  }
  for(let i=0;i<legs.length;i++){
    const rides=planLeg(lines,stops[i].point,stops[i+1].point);
    legs[i]=rides;
    if(rides) {
      const coordinates=[stops[i].point,...rides.flatMap(r=>r.stops.map(s=>s.point)),stops[i+1].point];
      features.push({type:"Feature",properties:{approximate:true},geometry:{type:"LineString",coordinates}});
    }
  }
  return {legs,features};
}

export function transitLink(from,to) {
  const latLon=([lon,lat])=>lat+","+lon;
  return "https://www.google.com/maps/dir/?"+new URLSearchParams({api:"1",origin:latLon(from),destination:latLon(to),travelmode:"transit"});
}
