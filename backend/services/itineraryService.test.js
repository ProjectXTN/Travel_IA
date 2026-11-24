const { test } = require("node:test");
const assert = require("node:assert/strict");
const { once } = require("node:events");
const { Completions } = require("openai/resources/chat/completions");
const app = require("../server");

test("stream the first day before completion, reuse finished plans and discard interrupted streams", async t => {
  const previousKey = process.env.OPENROUTER_API_KEY;
  process.env.OPENROUTER_API_KEY = "test";
  t.after(() => {
    if (previousKey === undefined) delete process.env.OPENROUTER_API_KEY;
    else process.env.OPENROUTER_API_KEY = previousKey;
  });

  let resume;
  const gate = new Promise(resolve => { resume = resolve; });
  t.after(resume);
  let interrupt = false;
  const ai = t.mock.method(Completions.prototype, "create", async function* (request) {
    assert.ok(request.models.every(m => m.endsWith(":free") || m === "openrouter/free"));
    yield { choices: [{ delta: { content: "## Dia 1 — Centro\n" } }] };
    await gate;
    yield { choices: [{ delta: { content: "Visite [[Mus" } }] };
    yield { choices: [{ delta: { content: "ée d’Orsay]].\n## Dia 2 — Marais\nPasseie pelo bairro.\n## Dia 3 — Sena\nCaminhe junto ao rio." }, finish_reason: interrupt ? "length" : "stop" }] };
  });
  const server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
  t.after(() => server.close());
  const post = (trip, accept) => fetch(`http://127.0.0.1:${server.address().port}/plan-trip`, {
    method: "POST", headers: { "content-type": "application/json", Accept: accept }, body: JSON.stringify(trip),
  });
  const trip = { destination: "Paris", days: 3, interests: "Cultura", language: "PT-BR" };
  const response = await post(trip, "application/x-ndjson");
  const reader = response.body.getReader();
  const first = JSON.parse(Buffer.from((await reader.read()).value).toString());
  assert.match(first.text, /Dia 1/);
  resume();
  let tail = "";
  for (;;) {
    const next = await reader.read();
    if (next.done) break;
    tail += Buffer.from(next.value).toString();
  }
  const events = tail.trim().split("\n").map(line => JSON.parse(line));
  assert.equal(events.at(-1).done, true);
  const plan = first.text + events.filter(e => e.text).map(e => e.text).join("");
  assert.match(plan, /www.google.com\/maps\/search/);
  assert.match(plan, /Mus%C3%A9e/);
  const repeat = await post(trip, "application/json");
  assert.equal((await repeat.json()).plan, plan.trim());
  assert.equal(ai.mock.callCount(), 1);
  const other = { ...trip, interests: "Jazz" };
  interrupt = true;
  const broken = await post(other, "application/x-ndjson");
  assert.match(await broken.text(), /"error":502/);
  interrupt = false;
  const retry = await post(other, "application/json");
  assert.equal(retry.status, 200);
  assert.ok((await retry.json()).plan);
  assert.equal(ai.mock.callCount(), 3);
});
