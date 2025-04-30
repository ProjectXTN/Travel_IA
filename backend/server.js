// Load environment variables from .env file
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");

// Enable CORS for all origins and allow GET/POST methods and common headers
const app = express();
app.use(cors({
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// Parse incoming JSON requests
app.use(express.json());

const { getCoordinatesFromPlaces } = require("./services/geocodeService");
const { getPromptByLanguage } = require("./services/promptGenerator");

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const SITE_URL = process.env.SITE_URL || "https://travel-ia.onrender.com";
const SITE_NAME = process.env.SITE_NAME || "AI Viagem Inteligente";


/**
 * Returns a language-specific AI prompt for travel itinerary generation
 * @param {string} language    - The language code (e.g., "PT-BR", "EN", "FR")
 * @param {string} destination - The travel destination
 * @param {number} days        - Number of travel days
 * @param {string} interests   - User travel interests (e.g., museums, food)
 * @returns {string}           - Prompt to be sent to the AI model
 */
app.post("/api/geocode", async (req, res) => {
    const { places } = req.body;
  
    if (!places || !Array.isArray(places)) {
      return res.status(400).json({ error: "Invalid or missing 'places'" });
    }
  
    try {
      const coordinates = await getCoordinatesFromPlaces(places);
      res.json({ coordinates });
    } catch (error) {
      console.error("Error in /api/geocode:", error); // MELHOR LOG
      res.status(500).json({ error: "Failed to get coordinates" });
    }
  });
  

// POST endpoint to generate travel plan
app.post("/plan-trip", async (req, res) => {
    const { destination, days, interests, language } = req.body;

    // Generate the AI prompt based on user input
    const prompt = getPromptByLanguage(language, destination, days, interests);

    try {
        // Send request to OpenRouter AI with the chosen prompt
        const response = await axios.post("https://openrouter.ai/api/v1/chat/completions", {
            model: "deepseek/deepseek-r1-distill-qwen-32b:free", // Chosen model API
            messages: [{
                role: "user",
                content: prompt
            }],
        }, {
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`, // Auth token
                "HTTP-Referer": SITE_URL,
                "X-Title": SITE_NAME,
                "Content-Type": "application/json"
            }
        });

        res.json({ plan: response.data.choices ? response.data.choices[0].message.content : "Error in the AI response" });

    } catch (error) {
        console.error("Error in the OpenRouter API: ", error.response ? error.response.data : error.message);
        res.status(500).json({ error: error.response ? error.response.data : error.message });
    }
});


app.get("/", (req, res) => {
    res.send("Server running with DeepSeek-R1 Distill Qwen 32B via OpenRouter! 🚀");
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));