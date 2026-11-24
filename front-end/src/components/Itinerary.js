import { useState } from "react";
import { FiDownload, FiMapPin } from "react-icons/fi";

function inlineText(text) {
  // Older servers emit HTML anchors. Convert only the link, then render all text through React.
  const normalized = text.replace(/<a\s+[^>]*?href=["'](https?:\/\/[^"']+)["'][^>]*>([^<>]*)<\/a>/gi, "[$2]($1)");
  const tokens = normalized.split(/(\[[^\]]+\]\(https?:\/\/[^\s)]+\)|\*\*[^*]+\*\*)/g);
  return tokens.map((token, index) => {
    const link = token.match(/^\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)$/);
    if (link) return <a key={index} href={link[2]} target="_blank" rel="noopener noreferrer">{link[1]}</a>;
    if (token.startsWith("**") && token.endsWith("**")) return <strong key={index}>{token.slice(2, -2)}</strong>;
    return token;
  });
}

function planLine(line, index) {
  const clean = line.replace(/^#{1,6}\s+/, "").replace(/\*\*/g, "");
  if (/^(?:dia|day|jour)\s+\d+\b/i.test(clean)) return <h3 key={index}>{clean}</h3>;
  if (/^#{1,6}\s/.test(line)) return <h4 key={index}>{inlineText(line.replace(/^#{1,6}\s+/, ""))}</h4>;
  return <p key={index}>{inlineText(line.replace(/^[-*]\s+/, "• "))}</p>;
}

export default function Itinerary({ trip, t, sectionRef }) {
  const [exporting, setExporting] = useState(false);
  const [failed, setFailed] = useState(false);
  async function download() {
    setExporting(true);
    setFailed(false);
    try {
      const { exportPDF } = await import("../services/pdfService");
      const name = trip.destination.replace(/[^\p{L}\p{N}-]+/gu, "-").slice(0, 80);
      await exportPDF("trip-plan", `Travel-IA-${name}-${trip.days}.pdf`);
    } catch {
      setFailed(true);
    } finally {
      setExporting(false);
    }
  }
  return (
    <section ref={sectionRef} tabIndex="-1" className="result card">
      <div id="trip-plan">
        <span className="kicker"><FiMapPin />{t.result}</span>
        <h2>{trip.destination} <small>· {trip.days} {trip.days === 1 ? t.day : t.days}</small></h2>
        <div className="plan-body">{trip.plan.split(/\r?\n/).map(line => line.trim()).filter(Boolean).map(planLine)}</div>
      </div>
      <button type="button" className="pdf" disabled={exporting} onClick={download}><FiDownload />{exporting ? t.exporting : t.pdf}</button>
      {failed && <p role="alert">{t.pdfError}</p>}
    </section>
  );
}
