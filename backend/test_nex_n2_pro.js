const axios = require('axios');

// Pega tu API Key de OpenRouter aquí para probar
const OPENROUTER_API_KEY = "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";

async function testNexN2Pro() {
  console.log("Iniciando prueba con Nex-N2 Pro...");

  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        // El identificador del modelo en OpenRouter (suele ser nex-agi/nex-n2-pro u otro similar según disponibilidad)
        model: "nex-agi/nex-n2-pro",
        messages: [
          {
            role: "system",
            content: "Eres el cerebro de IA del proyecto SaaS. Responde de forma concisa, profesional y asertiva."
          },
          {
            role: "user",
            content: "Hola"
          }
        ],
        max_tokens: 500
      },
      {
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3000", // Opcional
          "X-Title": "SaaS_IA_Test" // Opcional
        }
      }
    );

    console.log("\n====== RESPUESTA DE LA IA ======\n");
    console.log(response.data.choices[0].message.content);
    console.log("\n================================\n");

  } catch (error) {
    console.error("Error al conectar con la API:", error.response ? error.response.data : error.message);
  }
}

testNexN2Pro();
