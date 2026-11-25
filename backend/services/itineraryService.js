const OpenAI = require("openai");
const { performance } = require("node:perf_hooks");
const { getPromptByLanguage } = require("./promptGenerator");

const { createOutputFilter } = require("./itineraryOutput");

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

async function streamModel(trip, signal, requestedModel, onLine) {
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

  const stream = await client.chat.completions.create({
    model: requestedModel,
    stream: true,
    provider: { sort: "latency" },
    ...(requestedModel === FREE_MODEL && { reasoning: { enabled: false } }),
    messages: [
      { role: "system", content: getPromptByLanguage(trip.language, trip.destination) },
      { role: "user", content: JSON.stringify(trip) },
    ],
  }, { signal, timeout: requestedModel === FREE_ROUTER ? 30000 : 15000 });

  let pending = "";
  let plan = "";
  let model;
  let firstLineMs;
  let finished = false;
  const filter = createOutputFilter(trip);
  function emit(text) {
    const line = filter(text);
    if (!line) return;
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
  if (!finished || signal.aborted) throw new Error("Interrupted itinerary");
  if (pending) emit(pending);
  if (!plan.trim()) throw new Error("Empty itinerary");
  console.info("Itinerary timing", { model, days: trip.days, firstLineMs, totalMs: Math.round(performance.now() - start) });
  return plan.trim();
}

async function generateItinerary(trip, signal, onLine) {
  const [primary, fallback] = getModels();
  let visible = false;
  const progress = line => {
    if (line.trim()) visible = true;
    onLine(line);
  };
  try {
    return await streamModel(trip, signal, primary, progress);
  } catch (error) {
    if (visible || signal.aborted || [401, 402, 403].includes(error.status)) throw error;
    console.warn("Switching free itinerary model", primary, error.status || error.name);
    return streamModel(trip, signal, fallback, onLine);
  }
}

module.exports = { cachedPlan, remember, generateItinerary, getModels };
