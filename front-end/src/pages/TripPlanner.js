import { useEffect, useRef, useState } from "react";
import { FiArrowRight, FiArrowUpRight, FiBookOpen, FiCamera, FiCalendar, FiCoffee, FiCompass, FiFeather, FiFlag, FiMap, FiMapPin, FiMinus, FiPlus, FiSun, FiSunrise, FiX } from "react-icons/fi";
import { LuSparkles } from "react-icons/lu";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Itinerary from "../components/Itinerary";
import { requestPlan, warmPlanner } from "../services/planTripService";
import { copy } from "./plannerCopy";

const themeIcons = [FiCamera, FiCoffee, FiCompass, FiSun, FiBookOpen, FiFeather, FiFlag, FiSunrise];
const ideaImages = ["rio", "kyoto", "paris"];
const pics = (process.env.PUBLIC_URL || "") + "/img/";

export default function TripPlanner({ language }) {
  const t = copy[language];
  const [destination, setDestination] = useState("");
  const [days, setDays] = useState("3");
  const [themes, setThemes] = useState([]);
  const [extra, setExtra] = useState([]);
  const [draft, setDraft] = useState("");
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [trip, setTrip] = useState(null);
  const resultRef = useRef(null);
  const sequence = useRef(0);
  const visibleId = trip?.id;
  const destinationRef = useRef(null);
  const request = useRef(null);
  useEffect(() => () => request.current?.abort(), []);
  useEffect(() => {
    document.documentElement.lang = language === "PT-BR" ? "pt-BR" : language.toLowerCase();
    document.title = "Travel IA · " + t.title;
  }, [language, t]);
  useEffect(() => {
    if (visibleId) {
      resultRef.current?.focus({ preventScroll: true });
      resultRef.current?.scrollIntoView?.({ block: "start" });
    }
  }, [visibleId]);

  function addInterest() {
    const interest = draft.trim();
    if (interest && !extra.includes(interest)) setExtra([...extra, interest]);
    setDraft("");
    setEditing(false);
  }

  async function generate(event) {
    event.preventDefault();
    if (request.current) return;
    if (!destination.trim()) {
      setError("invalid");
      destinationRef.current.focus();
      return;
    }
    const controller = new AbortController();
    request.current = controller;
    let timer;
    function extendDeadline() {
      clearTimeout(timer);
      timer = setTimeout(() => controller.abort(), 120000);
    }
    extendDeadline();
    const id = ++sequence.current;
    const interests = [...new Set([...themes.map(i => t.choices[i]), ...extra, draft.trim()].filter(Boolean))].join(", ");
    const inputs = { destination: destination.trim(), days: Number(days), interests, language };
    setLoading(true);
    setError("");
    try {
      const plan = await requestPlan(inputs, controller.signal, partial => {
        extendDeadline();
        setTrip({ ...inputs, id, plan: partial, complete: false });
      });
      setTrip({ ...inputs, id, plan, complete: true });
    } catch (err) {
      setError(err.name === "AbortError" ? "timeout" : ["invalid", "busy", "timeout"].includes(err.message) ? err.message : "offline");
    } finally {
      clearTimeout(timer);
      request.current = null;
      setLoading(false);
    }
  }

  function chooseCity(city) {
    setDestination(city);
    setError("");
    destinationRef.current.focus();
    destinationRef.current.scrollIntoView?.({ block: "center" });
  }

  return (
    <div id="top">
      <Header t={t} language={language} loading={loading} />
      <main className="shell">
        <section className="hero">
          <img className="hero-photo" src={pics + "dolomites.jpg"} alt="" fetchpriority="high" />
          <div className="hero-content">
            <span className="hero-tag"><LuSparkles />{t.eyebrow}</span>
            <h1>{t.hero[0]}<br /><em>{t.hero[1]}</em></h1>
            <p>{t.intro}</p>
          </div>
          <div className="photo-location"><FiMapPin />{t.photo}</div>
        </section>
        <div className="workspace">
          <section id="planner" className="card planner">
            <div className="section-heading"><span className="section-icon"><FiMap /></span>
              <div><h2>{t.form}</h2><p>{t.formIntro}</p></div>
            </div>
            <form onSubmit={generate} onFocus={warmPlanner}>
              <fieldset disabled={loading} className="form-fields">
                <div className="trip-fields">
                  <div><label htmlFor="destination">{t.destination}</label>
                    <div className="input-box"><FiMapPin /><input ref={destinationRef} id="destination" required maxLength="150"
                      value={destination} onChange={e => setDestination(e.target.value)} placeholder={t.placeholder} /></div>
                  </div>
                  <div><label htmlFor="days">{t.duration}</label>
                    <div className="stepper">
                      <button type="button" aria-label={t.less} disabled={Number(days) <= 1} onClick={() => setDays(String(Number(days) - 1))}><FiMinus /></button>
                      <div className="day-value"><FiCalendar /><input id="days" type="number" required min="1" max="30" value={days} onChange={e => setDays(e.target.value)} style={{width: Math.max(days.length, 1) + "ch"}} />
                        <label htmlFor="days">{Number(days) === 1 ? t.day : t.days}</label></div>
                      <button type="button" aria-label={t.more} disabled={Number(days) >= 30} onClick={() => setDays(String(Number(days) + 1))}><FiPlus /></button>
                    </div>
                  </div>
                </div>
                <fieldset className="themes"><legend>{t.interests} <small>{t.optional}</small></legend>
                  <div className="chips">
                    {t.choices.map((name, i) => {
                      const Icon = themeIcons[i];
                      return <button type="button" key={i} aria-pressed={themes.includes(i)} onClick={() => setThemes(themes.includes(i) ? themes.filter(v => v !== i) : [...themes, i])}><Icon />{name}</button>;
                    })}
                    {extra.map(name => <button type="button" key={name} aria-label={t.remove + " " + name} className="chosen" onClick={() => setExtra(extra.filter(v => v !== name))}>{name}<FiX /></button>)}
                  </div>
                </fieldset>
                {editing ? <div className="custom-field"><input autoFocus maxLength="100" aria-label={t.custom} placeholder={t.customHint} value={draft} onChange={e => setDraft(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addInterest(); } }} />
                  <button type="button" onClick={addInterest}>{t.add}</button></div>
                  : <button type="button" className="custom-toggle" onClick={() => setEditing(true)}><FiPlus />{t.custom}</button>}
                {error && <p className="error" role="alert">{t[error]}</p>}
                <button className="generate" type="submit"><LuSparkles />{loading ? t.loading : t.create}<FiArrowRight /></button>
              </fieldset>
              <span className="sr-only" role="status">{loading ? t.loading : ""}</span>
            </form>
          </section>
          <aside id="inspiration" className="inspiration card">
            <span className="kicker"><FiCompass />{t.ideas}</span><h2>{t.ideasTitle}</h2><p>{t.ideasIntro}</p>
            <div className="ideas-list">{ideaImages.map((image, i) => <button type="button" key={image} disabled={loading}
              onClick={() => chooseCity(t.cities[i])} aria-label={t.choose + " " + t.cities[i]}>
              <img src={pics + image + ".jpg"} alt="" /><span className="city-text"><small>{t.countries[i]}</small><strong>{t.cities[i]}</strong></span>
              <span className="city-arrow"><FiArrowUpRight /></span></button>)}</div>
          </aside>
        </div>
        {trip && <Itinerary trip={trip} t={copy[trip.language]} error={error} sectionRef={resultRef} />}
      </main>
      <Footer />
    </div>
  );
}
