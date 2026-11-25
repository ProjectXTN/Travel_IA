import { useEffect, useMemo, useRef, useState } from "react";
import { FiLayers, FiMapPin } from "react-icons/fi";
import { itineraryDays, locate, walkingLines, visitOrder, rankedChoices } from "../services/routeMap";
import "./TripRouteMap.css";

const copy = {
  "PT-BR": ["Mapa 3D do roteiro","Fechar mapa","Dia","Localizando paradas…","Calculando o percurso a pé…","Percurso a pé","Sem percurso a pé disponível para este trecho.","Localização a confirmar","Escolher local","Consultar no Maps","Nenhuma parada identificável neste dia.","Mapa 3D indisponível neste navegador. As paradas estão listadas abaixo.","Paradas do dia","Rotas por","Ampliar para ver edifícios","São necessárias duas paradas consecutivas localizadas para traçar um percurso."],
  EN: ["3D itinerary map","Close map","Day","Locating stops…","Finding a walking route…","Walking route","Walking directions unavailable for this section.","Location to confirm","Choose a place","Look up on Maps","No identifiable stops for this day.","The 3D map is unavailable in this browser. Stops are listed below.","Stops for the day","Routing by","Zoom in to see buildings","Two consecutive located stops are needed for a route."],
  FR: ["Carte 3D de l’itinéraire","Fermer la carte","Jour","Localisation des étapes…","Calcul du trajet à pied…","Parcours à pied","Trajet à pied indisponible pour ce tronçon.","Emplacement à confirmer","Choisir un lieu","Consulter sur Maps","Aucune étape identifiable ce jour.","La carte 3D est indisponible dans ce navigateur. Les étapes figurent ci-dessous.","Étapes du jour","Itinéraires par","Zoomer pour voir les bâtiments","Deux étapes consécutives localisées sont nécessaires pour tracer un trajet."],
};

let library;
function loadMap() {
  if (!library) library = new Promise((resolve,reject) => {
    const base = "https://cdn.jsdelivr.net/npm/maplibre-gl@5.6.1/dist/maplibre-gl";
    if (!document.querySelector("link[data-travel-map]")) {
      const css = document.createElement("link");
      css.rel="stylesheet"; css.href=base+".css"; css.dataset.travelMap=""; document.head.appendChild(css);
    }
    const script = document.createElement("script");
    script.src=base+".js"; script.crossOrigin="anonymous";
    script.onload=()=>resolve(window.maplibregl);
    script.onerror=()=>{library=null;script.remove();reject(new Error("Map unavailable"));};
    document.head.appendChild(script);
  });
  return library;
}

const routeLabels = {
  "PT-BR":["Partida","Chegada","Ver percurso completo","Linha pontilhada: ligação aproximada entre paradas. O caminho pelas ruas está indisponível.","Reduzir deslocamentos","Ordem ajustada pelo tempo a pé.","Ordem ajustada pela distância aproximada.","desvio estimado em linha reta"],
  EN:["Start","Finish","Show full route","Dotted line: approximate connection between stops. Street directions are unavailable.","Reduce travel time","Visit order adjusted by walking time.","Visit order adjusted by approximate distance.","estimated extra straight-line distance"],
  FR:["Départ","Arrivée","Voir tout le parcours","Pointillés : liaison approximative entre les étapes. Le trajet par les rues est indisponible.","Réduire les déplacements","Ordre ajusté selon le temps de marche.","Ordre ajusté selon la distance approximative.","détour estimé à vol d’oiseau"]
};
function MapView({ stops, features, labels, focus }) {
  const host = useRef(null);
  const [view,setView] = useState(null);
  const [failed,setFailed] = useState(false);
  useEffect(()=>{
    let active=true, map;
    const timer=setTimeout(()=>{if(active && !map?.isStyleLoaded()) setFailed(true);},20000);
    loadMap().then(gl=>{
      if(!active) return;
      map=new gl.Map({container:host.current,style:"https://tiles.openfreemap.org/styles/liberty",center:[0,20],zoom:2,pitch:52,bearing:-18});
      map.addControl(new gl.NavigationControl({visualizePitch:true}));
      map.once("load",()=>{
        if(!active) return;
        clearTimeout(timer); setFailed(false);
        const style=map.getStyle();
        if (!style.layers.some(l=>l.type==="fill-extrusion")) {
          const building=style.layers.find(l=>l["source-layer"]==="building");
          if(building) map.addLayer({id:"trip-buildings",type:"fill-extrusion",source:building.source,"source-layer":"building",minzoom:13,
            paint:{"fill-extrusion-color":"#b7beb0","fill-extrusion-height":["coalesce",["get","render_height"],5],"fill-extrusion-base":["coalesce",["get","render_min_height"],0],"fill-extrusion-opacity":0.82}});
        }
        map.addSource("trip-route",{type:"geojson",data:{type:"FeatureCollection",features:[]}});
        map.addLayer({id:"trip-walk",type:"line",source:"trip-route",layout:{"line-join":"round","line-cap":"round"},paint:{"line-width":5,"line-color":"#af4323"}});
        map.setFilter("trip-walk",["!",["has","approximate"]]);
        map.addLayer({id:"trip-approximate",type:"line",source:"trip-route",filter:["has","approximate"],
          paint:{"line-color":"#a85430","line-width":4,"line-dasharray":[1,2]}});
        setView({map,gl});
      });
    }).catch(()=>{if(active)setFailed(true);});
    return ()=>{active=false; clearTimeout(timer);map?.remove();};
  },[]);
  useEffect(()=>{
    if(!view) return;
    const markers=[];

    stops.forEach((s,i)=>{
      if(!s.point)return;

      const el=document.createElement("button");
      el.type="button";el.className="route-pin";el.textContent=String(i+1);el.setAttribute("aria-label",s.label);
      const marker=new view.gl.Marker({element:el}).setLngLat(s.point)
        .setPopup(new view.gl.Popup({offset:16}).setText(s.label)).addTo(view.map);
      markers.push(marker);
    });

    return ()=>markers.forEach(m=>m.remove());
  },[stops,view]);
  useEffect(()=>{view?.map.getSource("trip-route")?.setData({type:"FeatureCollection",features});},[view,features]);
  useEffect(()=>{
    if(!view) return;
    if(focus) {view.map.easeTo({center:focus.point,zoom:16.5,pitch:60,duration:450});return;}
    const bounds=new view.gl.LngLatBounds();
    stops.forEach(stop=>{if(stop.point)bounds.extend(stop.point);});
    features.forEach(line=>line.geometry.coordinates.forEach(point=>bounds.extend(point)));
    if(!bounds.isEmpty()) view.map.fitBounds(bounds,{padding:48,pitch:40,maxZoom:16,duration:0});
  },[view,focus,stops,features]);
  return <>{failed && <p role="status">{labels[11]}</p>}<div ref={host} className="route-map-canvas" hidden={failed} aria-label={labels[0]} /></>;
}
function DayMap({day,labels,details}) {
  const [stops,setStops]=useState(day.stops);
  const [optimize,setOptimize]=useState(true);
  const [finding,setFinding]=useState(true);
  const [routing,setRouting]=useState(false);
  const [route,setRoute]=useState({features:[],failed:false});
  const [focus,setFocus]=useState(null);
  useEffect(()=>{
    const controller=new AbortController();
    (async()=>{
      for(const [i,s] of day.stops.entries()) {
        let match;
        try { match=await locate(s,controller.signal); } catch { match={}; }
        if(controller.signal.aborted)return;
        setStops(prev=>prev.map((p,k)=>k===i?{...p,...match,checked:true}:p));
      }
      setFinding(false);
    })();
    return ()=>controller.abort();
  },[day]);
  useEffect(()=>{
    if(finding)return;
    const controller=new AbortController();
    setRouting(true);setRoute({features:[],failed:false});
    (async()=>{
      const result=optimize ? await visitOrder(stops,controller.signal) : {ordered:stops,approximate:false};
      const lines=await walkingLines(result.ordered,controller.signal);
      if(!controller.signal.aborted) setRoute({...lines,...result,input:stops,optimized:optimize});
    })().catch(()=>{if(!controller.signal.aborted)setRoute({features:[],failed:true});})
      .finally(()=>{if(!controller.signal.aborted)setRouting(false);});
    return ()=>controller.abort();
  },[stops,finding,optimize]);
  const current=route.input===stops && optimize===route.optimized;
  const ordered=current ? route.ordered : stops;
  const changed=ordered.some((s,i)=>s!==stops[i]);
  if(!stops.length)return <p>{labels[10]}</p>;
  return <>
    {stops.filter(s=>s.point).length>=3 && <label><input type="checkbox" checked={optimize} onChange={e=>{setOptimize(e.target.checked);setFocus(null);}}/> {details[4]}</label>}
    {changed && <p>{details[route.approximate?6:5]}</p>}
    {stops.some(s=>s.point) && <MapView stops={ordered} features={current?route.features:[]} focus={focus} labels={labels}/>}
    {focus && <button type="button" className="route-toggle" onClick={()=>setFocus(null)}>{details[2]}</button>}
    <p role="status">{finding ? labels[3] : routing ? labels[4] : route.failed ? details[3] : route.features.length ? labels[5] : labels[15]}</p>
    <ol className="route-stops" aria-label={labels[12]}>{ordered.map((s,i)=><li key={stops.indexOf(s)}>
      {stops.length>1 && (i===0 || i===stops.length-1) && <small>{details[i===0?0:1]}</small>}
      {s.point ? <button type="button" className="route-focus" onClick={()=>setFocus({point:s.point})}><FiMapPin/>{s.label}</button> : <strong>{s.label}</strong>}
      {s.checked && <>{!s.point && <small>{labels[7]}</small>}{s.choices?.length>0 && <select aria-label={labels[8]+" · "+s.label} value={s.choiceId ?? ""} onChange={e=>{
        const choice=s.choices[Number(e.target.value)]; if(choice){setFocus(null);setStops(prev=>prev.map(p=>p===s?{...p,point:choice.point,choiceId:Number(e.target.value)}:p));}
      }}><option value="" disabled>{labels[8]}</option>{rankedChoices(stops,stops.indexOf(s)).map(c=><option key={c.id} value={c.id}>{c.name}{c.extra!==null && " · +"+c.extra.toFixed(1)+" km ("+details[7]+")"}</option>)}</select>}</>}
      <a href={s.choiceId!=null ? "https://www.google.com/maps/search/?api=1&query="+[s.point[1],s.point[0]].join(",") : s.url} target="_blank" rel="noreferrer">{labels[9]}</a>
    </li>)}</ol>
    <small>{labels[13]} <a href="https://routing.openstreetmap.de/" target="_blank" rel="noreferrer">FOSSGIS / OSRM</a> · © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a></small>
  </>;
}
export default function TripRouteMap({trip}) {
  const labels=copy[trip.language] || copy["PT-BR"];
  const days=useMemo(()=>itineraryDays(trip.plan,trip.destination),[trip.plan,trip.destination]);
  const [open,setOpen]=useState(false),[index,setIndex]=useState(0);
  const active=days[index];
  return <section className="route-panel">
    <button type="button" className="route-toggle" aria-expanded={open} onClick={()=>setOpen(!open)}><FiLayers/>{open?labels[1]:labels[0]}</button>
    {open && <div className="route-content"><div className="route-days">{days.map((d,i)=><button type="button" key={i} aria-pressed={index===i} onClick={()=>setIndex(i)}>{labels[2]} {d.number}</button>)}</div>
      {active?<DayMap key={index} day={active} labels={labels} details={routeLabels[trip.language] || routeLabels["PT-BR"]}/>:<p>{labels[10]}</p>}</div>}
  </section>;
}
