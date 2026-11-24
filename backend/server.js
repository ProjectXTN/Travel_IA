const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const express = require("express");
const cors = require("cors");
const { cachedPlan, remember, generateItinerary, getModels } = require("./services/itineraryService");
const { getCoordinatesFromPlaces } = require("./services/geocodeService");


const app = express();
app.use(cors({ methods: ["GET", "POST"], allowedHeaders: ["Content-Type", "Authorization"] }));
app.use(express.json({ limit: "32kb" }));

app.post("/api/geocode", async (req, res) => {
  const places = req.body?.places;
  if (!Array.isArray(places) || places.length > 100 ||
      places.some(place => typeof place !== "string" || !place.trim() || place.length > 400)) {
    return res.status(400).json({ error: "Invalid places" });
  }
  if (!places.length) return res.json({ coordinates: [] });
  if (!process.env.GOOGLE_MAPS_API_KEY) return res.status(503).json({ error: "Geocoding unavailable" });
  try {
    const coordinates = await getCoordinatesFromPlaces(places.map(place => place.trim()));
    res.json({ coordinates });
  } catch {
    res.status(502).json({ error: "Geocoding unavailable" });
  }
});

function readTrip(body = {}) {
  const { destination, days, interests = "", language = "PT-BR" } = body;
  const duration = typeof days === "number" || typeof days === "string" ? Number(days) : NaN;
  const preferences = Array.isArray(interests) && interests.every(item => typeof item === "string")
    ? interests.join(", ") : interests;
  if (typeof destination !== "string" || !destination.trim() || destination.trim().length > 150 ||
      !Number.isInteger(duration) || duration < 1 || duration > 30 ||
      typeof preferences !== "string" || preferences.length > 2000 ||
      !["PT-BR", "FR", "EN"].includes(language)) return null;
  return { destination: destination.trim(), days: duration, interests: preferences.trim(), language };
}

app.post("/plan-trip", async (req, res) => {
  const trip = readTrip(req.body);
  if (!trip) return res.status(400).json({ error: "Invalid trip details" });
  const key = JSON.stringify([getModels(), trip]);
  const hit = cachedPlan(key);
  if (hit) return res.set("Cache-Control", "no-store").json({ plan: hit });
  if (!process.env.OPENROUTER_API_KEY) return res.status(503).json({ error: "Planner unavailable" });

  const streaming = req.get("Accept")?.includes("application/x-ndjson");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5 * 60 * 1000);
  const disconnect = () => controller.abort();
  res.once("close", disconnect);
  res.set("Cache-Control", "no-store, no-transform");
  function sendLine(text) {
    if (!streaming || res.destroyed) return;
    if (!res.headersSent) res.set({ "Content-Type": "application/x-ndjson; charset=utf-8", "X-Accel-Buffering": "no" });
    res.write(JSON.stringify({ text }) + "\n");
  }
  try {
    const plan = await generateItinerary(trip, controller.signal, sendLine);
    if (res.destroyed || controller.signal.aborted) return;
    remember(key, plan);
    if (streaming) return res.end(JSON.stringify({ done: true }) + "\n");
    res.json({ plan });
  } catch (error) {
    if (res.destroyed) return;
    let status = 502;
    if (controller.signal.aborted || error.status === 504 || error.name === "APIConnectionTimeoutError") status = 504;
    if (error.status === 429) status = 429;
    console.error("Itinerary generation failed", error.status || error.name);
    if (res.headersSent) return res.end(JSON.stringify({ error: status }) + "\n");
    const providerStatus = Number.isInteger(error.status) ? error.status : undefined;
    const kind = providerStatus ? "provider_http" : error.name === "APIConnectionError" ? "provider_connection" : "provider_stream";
    res.status(status).json({ error: "Planner unavailable", kind, providerStatus });
  } finally {
    clearTimeout(timeout);
    res.removeListener("close", disconnect);
  }
});

app.get("/", (_req, res) => res.send("Travel IA API"));
if (require.main === module) {
  const port = Number(process.env.PORT) || 5000;
  app.listen(port, () => console.log(`Travel IA API listening on port ${port}`));
}
module.exports = app;
