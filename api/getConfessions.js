import fetch from "node-fetch";

const ZERO_SHEETS_URL = "https://api.zerosheets.com/v1/dwv";
const ZERO_SHEETS_TOKEN = process.env.ZERO_SHEETS_TOKEN;

export default async function handler(req, res) {
    try {
        if (!ZERO_SHEETS_TOKEN) {
            throw new Error("ZERO_SHEETS_TOKEN não está configurada.");
        }

        const response = await fetch(ZERO_SHEETS_URL, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${ZERO_SHEETS_TOKEN}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Erro da API Zero Sheets: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Dados retornados da API Zero Sheets:", data);

        res.status(200).json(data);
    } catch (error) {
        console.error("Erro na função serverless:", error.message);
        res.status(500).json({ error: error.message });
    }
}
