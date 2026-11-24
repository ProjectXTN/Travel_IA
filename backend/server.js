const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const { getCoordinatesFromPlaces } = require("./services/geocodeService");
const { getPromptByLanguage } = require("./services/promptGenerator");

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
  if (!process.env.OPENROUTER_API_KEY) return res.status(503).json({ error: "Planner unavailable" });

  const controller = new AbortController();
  res.once("close", () => controller.abort());
  try {
    const response = await axios.post("https://openrouter.ai/api/v1/chat/completions", {
      model: process.env.OPENROUTER_MODEL || "openrouter/free",
      messages: [
        { role: "system", content: getPromptByLanguage(trip.language) },
        { role: "user", content: JSON.stringify(trip) },
      ],
    }, {
      timeout: 90000,
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": process.env.SITE_URL || "https://travel-ia.vercel.app",
        "X-Title": process.env.SITE_NAME || "Travel IA",
      },
    });
    const choice = response.data?.choices?.[0];
    const plan = choice?.message?.content;
    if (typeof plan !== "string" || !plan.trim() || choice.finish_reason === "length") {
      return res.status(502).json({ error: "Incomplete itinerary" });
    }
    res.json({ plan: plan.trim() });
  } catch (error) {
    if (controller.signal.aborted) return;
    const status = error.response?.status;
    if (status === 429) return res.status(429).json({ error: "Planner busy" });
    if (status === 504 || error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
      return res.status(504).json({ error: "Planner timed out" });
    }
    console.error("OpenRouter request failed", status || error.code || "unknown");
    res.status(502).json({ error: "Planner unavailable" });
  }
});

app.get("/", (_req, res) => res.send("Travel IA API"));
if (require.main === module) {
  const port = Number(process.env.PORT) || 5000;
  app.listen(port, () => console.log(`Travel IA API listening on port ${port}`));
}
module.exports = app;
