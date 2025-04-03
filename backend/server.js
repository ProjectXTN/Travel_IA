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
        "PT-BR": `Você é um especialista em planejamento de viagens. Sua tarefa é criar um roteiro detalhado para uma viagem a ${destination} com duração de ${days} dias.

        O roteiro deve seguir este formato:

        **Dia 1:** [Atividades específicas para este dia - com link do Google Maps]
        **Dia 2:** [Atividades específicas para este dia - com link do Google Maps]
        **Dia 3:** [Atividades específicas para este dia - com link do Google Maps]...

        O roteiro deve focar nos seguintes interesses: **${interests}**.
        Inclua atrações turísticas, restaurantes recomendados e experiências locais.

        **Muito importante:** Agrupe as atividades de cada dia de forma geograficamente otimizada. Evite sugerir locais distantes no mesmo dia e tente organizar o roteiro por **regiões próximas**. Por exemplo, se dois pontos turísticos ficam perto um do outro, eles devem ser visitados no mesmo dia, e não espalhados ao longo da viagem.
        Também é essencial considerar o tempo de deslocamento entre cidades ou regiões distantes. Evite incluir duas cidades diferentes e distantes em dias consecutivos (como Rio de Janeiro e Salvador, por exemplo). Se o deslocamento entre elas for necessário, dedique parte do dia ao transporte, como voos ou viagens de ônibus, e ajuste o número de atividades turísticas nesse dia.

        O roteiro deve ser realista, viável e considerar a logística de viagem como parte da experiência.

        Para cada local recomendado, forneça os seguintes links:
        📍 <a href="https://pt.wikipedia.org/wiki/${encodeURIComponent("Nome do Lugar")}" target="_blank" rel="noopener noreferrer">${"Nome do Lugar"}</a> - <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("Endereço Completo do Lugar + paìs")}" target="_blank" rel="noopener noreferrer">Endereço Google Maps</a>

        Evite encurtadores de links como goo.gl. Sempre use os formatos acima.

        Não faça perguntas ao usuário. Apenas forneça um roteiro completo, coeso, organizado por localização, e detalhado, pronto para ser seguido. A RESPOSTA TEM QUE SER EM PORTUGUÊS.`,

        "EN": `You are a travel planning expert. Your task is to create a detailed itinerary for a trip to ${destination} lasting ${days} days.

        The itinerary should follow this format:

        **Day 1:** [Specific activities for this day - with Google Maps link]
        **Day 2:** [Specific activities for this day - with Google Maps link]
        **Day 3:** [Specific activities for this day - with Google Maps link]
        ...

        The itinerary should focus on the following interests: **${interests}**.
        Include tourist attractions, recommended restaurants, and local experiences.

        **Important:** Organize the daily activities based on geographic proximity. Avoid suggesting places that are far apart on the same day. Instead, try to group activities by neighborhood or nearby areas. For example, if two attractions are close to each other, they should be visited on the same day, not several days apart.
        It is also essential to consider the travel time between cities or distant regions. Avoid including two different and far-apart cities on consecutive days (such as Rio de Janeiro and Salvador, for example). If travel between them is necessary, dedicate part of the day to transportation, such as flights or bus rides, and reduce the number of tourist activities planned for that day.

        The itinerary should be realistic, feasible, and take travel logistics into account as part of the overall experience.

        For each recommended place, provide the following links:
        📍 <a href="https://en.wikipedia.org/wiki/${encodeURIComponent("Place Name")}" target="_blank" rel="noopener noreferrer">${"Place Name"}</a> - <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("Place Name + country")}" target="_blank" rel="noopener noreferrer">Google Maps Address</a>

        Avoid URL shorteners like goo.gl. Always use the format above.

        Do not ask questions to the user. Just provide a complete, logically ordered, location-aware, and detailed itinerary ready to be followed. THE RESPONSE MUST BE IN ENGLISH.`,

        "FR": `Vous êtes un expert en planification de voyages. Votre tâche consiste à créer un itinéraire détaillé pour un voyage à ${destination} d'une durée de ${days} jours.

        L'itinéraire doit suivre ce format :

        **Jour 1 :** [Activités spécifiques pour ce jour - avec lien Google Maps]
        **Jour 2 :** [Activités spécifiques pour ce jour - avec lien Google Maps]
        **Jour 3 :** [Activités spécifiques pour ce jour - avec lien Google Maps]
        ...

        L'itinéraire doit se concentrer sur les intérêts suivants : **${interests}**.
        Incluez des attractions touristiques, des restaurants recommandés et des expériences locales.

        **Très important :** Organisez les activités quotidiennes en tenant compte de leur proximité géographique. Évitez de proposer des lieux éloignés les uns des autres le même jour. Essayez de regrouper les visites par quartier ou zone proche. Par exemple, si deux lieux touristiques sont voisins, ils doivent figurer le même jour dans l’itinéraire, et non être répartis sur plusieurs jours.Il est également essentiel de tenir compte du temps de déplacement entre les villes ou les régions éloignées. Évitez d'inclure deux villes différentes et distantes à des jours consécutifs (comme Rio de Janeiro et Salvador, par exemple). Si un déplacement est nécessaire, consacrez une partie de la journée au transport, comme un vol ou un trajet en bus, et réduisez le nombre d’activités touristiques prévues ce jour-là.

        L’itinéraire doit être réaliste, faisable et prendre en compte la logistique du voyage comme faisant partie de l’expérience globale.


        Pour chaque lieu recommandé, fournissez les liens suivants :
        📍 <a href="https://fr.wikipedia.org/wiki/${encodeURIComponent("Nom du Lieu")}" target="_blank" rel="noopener noreferrer">${"Nom du Lieu"}</a> - <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("Nom complète du lieu + Le pays")}" target="_blank" rel="noopener noreferrer">Adresse Google Maps</a>

        Évitez les raccourcisseurs d'URL comme goo.gl. Utilisez toujours le format ci-dessus.

        Ne posez pas de questions à l'utilisateur. Fournissez simplement un itinéraire complet, cohérent, structuré par proximité et prêt à être suivi. LA RÉPONSE DOIT ÊTRE EN FRANÇAIS.`

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