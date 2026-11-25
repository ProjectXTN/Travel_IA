const kyotoPlaces = [
  // Official access pages: inari.jp/en/access/ and kyotorailwaymuseum.jp/en/access/
  { names: ["Fushimi Inari Taisha", "Fushimi Inari-taisha", "Fushimi Inari Shrine", "Temple Fushimi Inari", "Sanctuaire Fushimi Inari", "伏見稲荷大社"],
    query: "Fushimi Inari Taisha, 68 Fukakusa Yabunouchi-cho, Fushimi-ku, Kyoto 612-0882, Japan" },
  { names: ["Kyoto Railway Museum", "Musée ferroviaire de Kyoto", "Museu Ferroviário de Quioto", "京都鉄道博物館"],
    query: "Kyoto Railway Museum, Kankiji-cho, Shimogyo-ku, Kyoto, Japan" },
  // Kyoto City tourism: kyoto.travel/en/destinations/kyoto-nishiki-food-market/
  { names: ["Nishiki Market", "Marché Nishiki", "Marché de Nishiki", "Mercado Nishiki", "Nishiki Ichiba", "錦市場"],
    query: "Nishiki Market, Nishikikoji Teramachi-Takakura, Nakagyo-ku, Kyoto, Japan" },
];

const normalize = text => text.normalize("NFKD").replace(/\p{M}/gu, "").toLowerCase();
const inKyoto = text => normalize(text).split(",").some(part => /^(?:kyoto|quioto|京都|京都市)$/.test(part.trim()));
const aliases = new Map(kyotoPlaces.flatMap(place => place.names.map(name => [normalize(name), place])));
const names = kyotoPlaces.flatMap(place => place.names).sort((a,b) => b.length-a.length).join("|");
const marks = new RegExp("\\[\\[([^\\[\\]\\n]{1,450})\\]\\]|(?<![\\p{L}\\p{N}])(" + names + ")(?![\\p{L}\\p{N}])", "giu");
const labels = {
  FR: ["fr", "Ouvrir dans Maps", "Rechercher dans Maps"],
  EN: ["en", "Open in Maps", "Search Maps"],
  "PT-BR": ["pt", "Abrir no Maps", "Pesquisar no Maps"],
};
const encode = text => encodeURIComponent(text).replace(/\(/g,"%28").replace(/\)/g,"%29");

function addPlaceLinks(text, {destination, language}) {
  const [wiki, open, search] = labels[language];
  // The model supplies names. Only the application constructs links.
  const plain = text.replace(/\[([^\]\n]+)\]\(https?:\/\/[^\s)]+\)/gi, "$1")
    .replace(/https?:\/\/(?:www\.)?(?:google\.[^/\s]+\/maps|maps\.app\.goo\.gl|maps\.google\.[^/\s]+)\/?[^\s)]*/gi, "");
  return plain.replace(marks, (original, marker, alias) => {
    const [label, official, locality] = marker ? marker.split("|").map(s => s.trim()) : [alias];
    const kyoto = inKyoto(locality || destination);
    const known = kyoto && aliases.get(normalize(official || label));
    if (kyoto && !known && /kyoto station museum|musee de la kyoto station|marche couvert de kyoto/.test(normalize(label + " " + (official || "")))) return label;
    if (/\b(?:de votre choix|de sua escolha|of your choice|au choix|nearby restaurant|restaurant local|restaurante local)\b/i.test(normalize(label + " " + (official || "")))) return label;
    const qualified = official && locality && locality.split(",").filter(s => s.trim()).length >= 2;
    if (!known && !qualified) return label;
    const query = known ? known.query : official + ", " + locality;
    return "[" + label + "](https://" + wiki + ".wikipedia.org/wiki/Special:Search?search=" + encode(official || label) +
      ") ([" + (known ? open : search) + "](https://www.google.com/maps/search/?api=1&query=" + encode(query) + "))";
  });
}

// Receives complete lines, even when a model token splits the echoed JSON.
function createOutputFilter(trip) {
  let inFence = false, depth = 0, quoted = false, escaped = false;
  function cleanLine(line) {
    if (/^\s*~~~json\b|^\s*\x60{3}json\b/i.test(line)) { inFence = true; return ""; }
    if (/^\s*(?:\x60{3}|~~~)\s*$/.test(line)) { inFence = false; return ""; }
    if (inFence) return "";
    const start = depth ? 0 : line.search(/^\s*\{|\{\s*(?:"(?:destination|days|interests|language)"\s*:|$)/i);
    if (start < 0) return addPlaceLinks(line, trip);
    for (const c of line.slice(start)) {
      if (quoted) {
        if (escaped) escaped = false;
        else if (c === "\\") escaped = true;
        else if (c === '"') quoted = false;
      } else if (c === '"') quoted = true;
      else if (c === "{") depth++;
      else if (c === "}" && depth && --depth === 0) break;
    }
    const prefix = line.slice(0,start).trimEnd();
    return prefix ? addPlaceLinks(prefix, trip) + "\n" : "";
  }
  return text => (text.match(/[^\n]*\n|[^\n]+$/g) || []).map(cleanLine).join("");
}

module.exports = { createOutputFilter, addPlaceLinks };
