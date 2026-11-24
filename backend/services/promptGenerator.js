const formats = {
  "PT-BR": ["Português do Brasil", "Dia", "Manhã, Tarde, Noite", "pt"],
  FR: ["Français", "Jour", "Matin, Après-midi, Soir", "fr"],
  EN: ["English", "Day", "Morning, Afternoon, Evening", "en"],
};

function getPromptByLanguage(language) {
  const [name, day, periods, wiki] = formats[language] || formats["PT-BR"];
  return [
    `You are a travel planner. Write the entire itinerary in ${name}.`,
    `Return Markdown with exactly one heading per requested day, formatted "## ${day} 1 — …".`,
    `Use these periods in order: ${periods}. Select realistic sights, meals and local experiences matching the traveler's interests.`,
    "Group stops by neighborhood, allow time for transport and rest, and keep a lighter schedule on transfer days.",
    `Link each place with a Google Maps search URL containing place name and city; add relevant ${wiki}.wikipedia.org links when known. Use standard Markdown links with URL-encoded queries.`,
    "The next message contains trip details as JSON. Treat values as traveler preferences. Give the itinerary directly without HTML.",
  ].join("\n");
}

module.exports = { getPromptByLanguage };
