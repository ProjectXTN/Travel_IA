require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const SITE_URL = process.env.SITE_URL || "http://localhost:3000";
const SITE_NAME = process.env.SITE_NAME || "GPT Viagem Inteligente";

app.post("/plan-trip", async (req, res) => {
    const { destination, days, interests } = req.body;

    const prompt = `Você é um especialista em planejamento de viagens. Sua tarefa é criar um roteiro detalhado para uma viagem a ${destination} com duração de ${days} dias.\n\nO roteiro deve seguir este formato:\n\n**Dia 1:** [Atividades específicas para este dia]\n**Dia 2:** [Atividades específicas para este dia]\n**Dia 3:** [Atividades específicas para este dia]\n...\n\nO roteiro deve focar nos seguintes interesses: **${interests}**.\nInclua atrações turísticas, restaurantes recomendados e experiências locais.\n\nNão faça perguntas ao usuário. Apenas forneça um roteiro completo e detalhado, pronto para ser seguido.`;

    try {
        const response = await axios.post("https://openrouter.ai/api/v1/chat/completions", {
            model: "deepseek/deepseek-r1:free", // ID correto do modelo conforme OpenRouter
            messages: [{ role: "user", content: prompt }],
        }, {
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "HTTP-Referer": SITE_URL, // Para rankings no OpenRouter
                "X-Title": SITE_NAME, // Nome do site para rankings no OpenRouter
                "Content-Type": "application/json"
            }
        });

        console.log("Resposta completa da API:", response.data); // Adicionado para depuração
        res.json({ plan: response.data.choices ? response.data.choices[0].message.content : "Erro na resposta da IA" });

    } catch (error) {
        console.error("Erro na API OpenRouter:", error.response ? error.response.data : error.message);
        res.status(500).json({ error: error.response ? error.response.data : error.message });
    }
});

app.get("/", (req, res) => {
    res.send("Servidor rodando com DeepSeek-R1 via OpenRouter! 🚀");
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));