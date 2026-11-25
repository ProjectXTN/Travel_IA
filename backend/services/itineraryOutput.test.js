const { test } = require("node:test");
const assert = require("node:assert/strict");
const { createOutputFilter, addPlaceLinks } = require("./itineraryOutput");
const trip = { destination: "Kyoto", language: "FR" };
test("echoed request metadata never enters streamed or completed text", () => {
  const clean = createOutputFilter(trip);
  const body = "### Jour 5 — Sud de Kyoto\n**Soir :** Dernier dîner.\n";
  assert.equal(clean(body + "{\n") + clean('\n"destination": "Kyoto",\n"days": 5,\n') +
    clean('"interests": "Culture, Gastronomie, Histoire",\n"language": "FR"\n}\n'), body);
  assert.equal(clean('~~~json\n{"days":5}\n~~~\n') + clean("Jour suivant\n"), "Jour suivant\n");
  assert.equal(clean('Fin. {"days":5}'), "Fin.\n");
  assert.equal(clean('Le café {historique} est ouvert.'), 'Le café {historique} est ouvert.');
});
test("Kyoto shrine uses its official address; similar and generic names remain distinct", () => {
  const shrine = decodeURIComponent(addPlaceLinks("Temple Fushimi Inari et ses torii.", trip));
  assert.match(shrine, /68 Fukakusa Yabunouchi-cho, Fushimi-ku, Kyoto/);
  for (const line of ["Fushimi Inari Station", "Musée de la Kyoto Station", "marché couvert de Kyoto", "[[Musée de la Kyoto Station|Kyoto Station Museum|Kyoto, Japan]]",
    "[[restaurant de votre choix|restaurant local|Kyoto, Japan]]"]) {
    assert.doesNotMatch(addPlaceLinks(line, trip), /https:/);
  }
  assert.doesNotMatch(addPlaceLinks("Temple Fushimi Inari", { ...trip, destination: "Tokyo" }), /Fukakusa/);
});
test("each stop uses its own city, and unverified places are labeled as searches", () => {
  const plan = addPlaceLinks("[[Musée du Prado|Museo Nacional del Prado|Madrid, España]]", { destination: "Portugal et Espagne", language: "FR" });
  assert.match(decodeURIComponent(plan), /Rechercher dans Maps.*query=Museo Nacional del Prado, Madrid, España/);
  assert.doesNotMatch(plan, /Portugal|query_place_id/);
  const railway = addPlaceLinks("[[Musée ferroviaire de Kyoto|Kyoto Railway Museum|Kyoto, Japan]]", trip);
  assert.match(decodeURIComponent(railway), /Kankiji-cho, Shimogyo-ku/);
});
