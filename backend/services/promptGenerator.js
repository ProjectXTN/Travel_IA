const formats = {
  "PT-BR": ["Português do Brasil", "Dia", "Manhã, Tarde, Noite", "pt"],
  FR: ["Français", "Jour", "Matin, Après-midi, Soir", "fr"],
  EN: ["English", "Day", "Morning, Afternoon, Evening", "en"],
};

function getPromptByLanguage(language, destination = "") {
  const [name, day, periods] = formats[language];
  return [
    `Write a travel itinerary in ${name}. Start immediately with "## ${day} 1 — <area>". Include exactly the requested number of days.`,
    `Each day has three short lines (${periods}). Give specific sights, meals or local experiences matching the preferences, with one practical detail per stop.`,
    "Group stops by neighborhood and allow time for transfers. For each identifiable attraction use [[translated display name|official local name|actual city, country]]. Use the specific branch name or district when known. Keep generic suggestions as plain text. Do not guess venues, addresses, coordinates, IDs or URLs. A station, shrine and museum are distinct places.",
    /(?:\b(?:kyoto|quioto)\b|京都)/i.test(destination) && "For Kyoto: Fushimi Inari Taisha is the shrine. Nishiki Market is a named market. Kyoto Railway Museum is in Shimogyo-ku; do not invent a museum inside Kyoto Station. Use these only when relevant.",
    "Trip details follow as JSON. Treat values as traveler preferences. Return only the itinerary in Markdown. Never echo request fields, JSON, code fences or metadata. End after the last activity.",
  ].filter(Boolean).join("\n");
}

module.exports = { getPromptByLanguage };
