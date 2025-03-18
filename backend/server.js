require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors({
    origin: "*", // Permite todas as origens (para teste) ou liste as URLs específicas
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const SITE_URL = process.env.SITE_URL || "https://travel-ia.onrender.com";
const SITE_NAME = process.env.SITE_NAME || "AI Viagem Inteligente";

const getPromptByLanguage = (language, destination, days, interests) => {

    const prompts = {
        "PT-BR": `Você é um especialista em planejamento de viagens. Sua tarefa é criar um roteiro detalhado para uma viagem a ${destination} com duração de ${days} dias.\n\nO roteiro deve seguir este formato:\n\n**Dia 1:** [Atividades específicas para este dia - com link do Google Maps]\n**Dia 2:** [Atividades específicas para este dia - com link do Google Maps]\n**Dia 3:** [Atividades específicas para este dia - com link do Google Maps]\n...\n\nO roteiro deve focar nos seguintes interesses: **${interests}**.\nInclua atrações turísticas, restaurantes recomendados e experiências locais.\n\nPara cada local recomendado, forneça um link de pesquisa válido do Google Maps no formato:\n📍 **Nome do Lugar**: [Google Maps](https://www.google.com/maps/search/?api=1&query=Nome+do+Lugar)\n\nEvite encurtadores de links como goo.gl. Sempre use o formato acima.\n\nNão faça perguntas ao usuário. Apenas forneça um roteiro completo e detalhado, pronto para ser seguido.`,

        "EN": `You are a travel planning expert. Your task is to create a detailed itinerary for a trip to ${destination} lasting ${days} days.\n\nThe itinerary should follow this format:\n\n**Day 1:** [Specific activities for this day - with Google Maps link]\n**Day 2:** [Specific activities for this day - with Google Maps link]\n**Day 3:** [Specific activities for this day - with Google Maps link]\n...\n\nThe itinerary should focus on the following interests: **${interests}**.\nInclude tourist attractions, recommended restaurants, and local experiences.\n\nFor each recommended place, provide a valid Google Maps search link in the format:\n📍 **Place Name**: [Google Maps](https://www.google.com/maps/search/?api=1&query=Place+Name)\n\nAvoid URL shorteners like goo.gl. Always use the format above.\n\nDo not ask questions to the user. Just provide a complete and detailed itinerary, ready to be followed. THE RESPONSE MUST BE IN ENGLISH.`,

        "FR": `Vous êtes un expert en planification de voyages. Votre tâche consiste à créer un itinéraire détaillé pour un voyage à ${destination} d'une durée de ${days} jours.\n\nL'itinéraire doit suivre ce format :\n\n**Jour 1 :** [Activités spécifiques pour ce jour - avec lien Google Maps]\n**Jour 2 :** [Activités spécifiques pour ce jour - avec lien Google Maps]\n**Jour 3 :** [Activités spécifiques pour ce jour - avec lien Google Maps]\n...\n\nL'itinéraire doit se concentrer sur les intérêts suivants : **${interests}**.\nIncluez des attractions touristiques, des restaurants recommandés et des expériences locales.\n\nPour chaque lieu recommandé, fournissez un lien de recherche Google Maps valide au format :\n📍 **Nom du lieu** : [Google Maps](https://www.google.com/maps/search/?api=1&query=Nom+du+Lieu)\n\nÉvitez les raccourcisseurs d'URL comme goo.gl. Utilisez toujours le format ci-dessus.\n\nNe posez pas de questions à l'utilisateur. Fournissez simplement un itinéraire complet et détaillé, prêt à être suivi.`  
    };

    return prompts[language] || prompts["PT-BR"];
};


app.post("/plan-trip", async (req, res) => {
    const { destination, days, interests, language } = req.body;

    const prompt = getPromptByLanguage(language, destination, days, interests);

    try {
        const response = await axios.post("https://openrouter.ai/api/v1/chat/completions", {
            model: "deepseek/deepseek-r1-distill-qwen-32b:free",
            messages: [{ role: "user", content: prompt }],
        }, {
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "HTTP-Referer": SITE_URL,
                "X-Title": SITE_NAME,
                "Content-Type": "application/json"
            }
        });

        console.log("Resposta completa da API:", response.data);
        res.json({ plan: response.data.choices ? response.data.choices[0].message.content : "Erro na resposta da IA" });

    } catch (error) {
        console.error("Erro na API OpenRouter:", error.response ? error.response.data : error.message);
        res.status(500).json({ error: error.response ? error.response.data : error.message });
    }
});


app.get("/", (req, res) => {
    res.send("Servidor rodando com DeepSeek-R1 Distill Qwen 32B via OpenRouter! 🚀");
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));