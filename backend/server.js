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
const getPromptByLanguage = (language, destination, days, interests) => {

    const prompts = {
        "PT-BR": `Você é um especialista em planejamento de viagens. Sua tarefa é criar um roteiro detalhado para uma viagem a ${destination} com duração de ${days} dias.\n\nO roteiro deve seguir este formato:\n\n**Dia 1:** [Atividades específicas para este dia - com link do Google Maps]\n**Dia 2:** [Atividades específicas para este dia - com link do Google Maps]\n**Dia 3:** [Atividades específicas para este dia - com link do Google Maps]\n...\n\nO roteiro deve focar nos seguintes interesses: **${interests}**.\nInclua atrações turísticas, restaurantes recomendados e experiências locais.\n\nPara cada local recomendado, forneça os seguintes links:\n📍 <a href="https://pt.wikipedia.org/wiki/${encodeURIComponent("Nome do Lugar")}" target="_blank" rel="noopener noreferrer">${"Nome do Lugar"}</a> - <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("Endereço Completo do Lugar + paìs")}" target="_blank" rel="noopener noreferrer">Endereço Google Maps</a>\n\nEvite encurtadores de links como goo.gl. Sempre use os formatos acima.\n\nNão faça perguntas ao usuário. Apenas forneça um roteiro completo e detalhado, pronto para ser seguido. A RESPOSTA TEM QUE SER EM PORTUGUES`,

        "EN": `You are a travel planning expert. Your task is to create a detailed itinerary for a trip to ${destination} lasting ${days} days.\n\nThe itinerary should follow this format:\n\n**Day 1:** [Specific activities for this day - with Google Maps link]\n**Day 2:** [Specific activities for this day - with Google Maps link]\n**Day 3:** [Specific activities for this day - with Google Maps link]\n...\n\nThe itinerary should focus on the following interests: **${interests}**.\nInclude tourist attractions, recommended restaurants, and local experiences.\n\nFor each recommended place, provide the following links:\n📍 <a href="https://fr.wikipedia.org/wiki/${encodeURIComponent("Place Name")}" target="_blank" rel="noopener noreferrer">${"Place Name"}</a> - <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("Place Name + country")}" target="_blank" rel="noopener noreferrer">Google Maps Address</a>\n\nAvoid URL shorteners like goo.gl. Always use the format above.\n\nDo not ask questions to the user. Just provide a complete and detailed itinerary, ready to be followed. THE RESPONSE MUST BE IN ENGLISH.`,

        "FR": `Vous êtes un expert en planification de voyages. Votre tâche consiste à créer un itinéraire détaillé pour un voyage à ${destination} d'une durée de ${days} jours.\n\nL'itinéraire doit suivre ce format :\n\n**Jour 1 :** [Activités spécifiques pour ce jour - avec lien Google Maps]\n**Jour 2 :** [Activités spécifiques pour ce jour - avec lien Google Maps]\n**Jour 3 :** [Activités spécifiques pour ce jour - avec lien Google Maps]\n...\n\nL'itinéraire doit se concentrer sur les intérêts suivants : **${interests}**.\nIncluez des attractions touristiques, des restaurants recommandés et des expériences locales.\n\nPour chaque lieu recommandé, fournissez les liens suivants :\n📍 <a href="https://fr.wikipedia.org/wiki/${encodeURIComponent("Nom du Lieu")}" target="_blank" rel="noopener noreferrer">${"Nom du Lieu"}</a> - <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("Nom complète du lieu + Le pays")}" target="_blank" rel="noopener noreferrer">Adresse Google Maps</a>\n\nÉvitez les raccourcisseurs d'URL comme goo.gl. Utilisez toujours le format ci-dessus.\n\nNe posez pas de questions à l'utilisateur. Fournissez simplement un itinéraire complet et détaillé, prêt à être suivi. LA RÉPONSE DOIT ÊTRE EN FRANÇAIS`
    };

    // Return selected prompt, fallback to Portuguese if language not supported
    return prompts[language] || prompts["PT-BR"];
};

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