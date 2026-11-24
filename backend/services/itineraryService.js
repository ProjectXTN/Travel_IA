const OpenAI = require("openai");
const { performance } = require("node:perf_hooks");
const { getPromptByLanguage, addPlaceLinks } = require("./promptGenerator");

const FREE_MODEL = "nvidia/nemotron-3.5-lightning:free";
const FREE_ROUTER = "openrouter/free";
const cache = new Map();
const CACHE_TTL = 30 * 60 * 1000;
let client;

function getModels() {
  const configured = process.env.OPENROUTER_MODEL || "";
  const preferred = configured.endsWith(":free") ? configured : FREE_MODEL;
  return [preferred, FREE_ROUTER];
}

function cachedPlan(key) {
  const hit = cache.get(key);
  if (!hit) return null;
  cache.delete(key);
  if (hit.expires <= Date.now()) return null;
  cache.set(key, hit);
  return hit.plan;
}

function remember(key, plan) {
  if (plan.length > 180000) return;
  cache.delete(key);
  cache.set(key, { plan, expires: Date.now() + CACHE_TTL });
  if (cache.size > 100) cache.delete(cache.keys().next().value);
}

async function generateItinerary(trip, signal, onLine) {
  client ??= new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
    maxRetries: 0,
    defaultHeaders: {
      "HTTP-Referer": process.env.SITE_URL || "https://travel-ia.vercel.app",
      "X-Title": process.env.SITE_NAME || "Travel IA",
    },
  });
  const start = performance.now();
  const models = getModels();
  const stream = await client.chat.completions.create({
    model: models[0],
    models,
    stream: true,
    provider: { sort: "latency" },
    reasoning: { enabled: false },
    messages: [
      { role: "system", content: getPromptByLanguage(trip.language) },
      { role: "user", content: JSON.stringify(trip) },
    ],
  }, { signal });

  let pending = "";
  let plan = "";
  let model;
  let firstLineMs;
  let finished = false;
  function emit(text) {
    const line = addPlaceLinks(text, trip);
    plan += line;
    if (firstLineMs === undefined && line.trim()) firstLineMs = Math.round(performance.now() - start);
    onLine(line);
  }
  for await (const chunk of stream) {
    const choice = chunk.choices?.[0];
    model = chunk.model || model;
    if (chunk.error || (choice?.finish_reason && choice.finish_reason !== "stop")) throw new Error("Incomplete itinerary");
    pending += choice?.delta?.content || "";
    const boundary = pending.lastIndexOf("\n");
    if (boundary >= 0) {
      emit(pending.slice(0, boundary + 1));
      pending = pending.slice(boundary + 1);
    }
    if (choice?.finish_reason === "stop") finished = true;
  }
  if (!finished || signal.aborted || !(plan + pending).trim()) throw new Error("Interrupted itinerary");
  if (pending) emit(pending);
  console.info("Itinerary timing", { model, days: trip.days, firstLineMs, totalMs: Math.round(performance.now() - start) });
  return plan.trim();
}

module.exports = { cachedPlan, remember, generateItinerary, getModels };
