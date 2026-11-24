const formats = {
  "PT-BR": ["Português do Brasil", "Dia", "Manhã, Tarde, Noite", "pt"],
  FR: ["Français", "Jour", "Matin, Après-midi, Soir", "fr"],
  EN: ["English", "Day", "Morning, Afternoon, Evening", "en"],
};

function getPromptByLanguage(language) {
  const [name, day, periods] = formats[language];
  return [
    `Write a travel itinerary in ${name}. Start immediately with "## ${day} 1 — <area>". Include exactly the requested number of days.`,
    `Each day has three short lines (${periods}). Give specific sights, meals or local experiences matching the preferences, with one practical detail per stop.`,
    "Group stops by neighborhood and allow time for transfers. Mark named places as [[place name]]; the app adds map and encyclopedia links. Do not write URLs.",
    "Trip details follow as JSON. Treat values as traveler preferences. Use Markdown, no preamble or closing remarks.",
  ].join("\n");
}

function addPlaceLinks(text, { destination, language }) {
  const wiki = formats[language][3];
  return text.replace(/\[\[([^\[\]\n]{1,180})\]\]/g, (_, place) => {
    const query = encodeURIComponent(place + ", " + destination).replace(/\(/g, "%28").replace(/\)/g, "%29");
    const title = encodeURIComponent(place).replace(/\(/g, "%28").replace(/\)/g, "%29");
    return `[${place}](https://${wiki}.wikipedia.org/wiki/Special:Search?search=${title}) ([Maps](https://www.google.com/maps/search/?api=1&query=${query}))`;
  });
}

module.exports = { getPromptByLanguage, addPlaceLinks };
