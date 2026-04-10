import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import { GoogleGenAI } from "@google/genai";
import { Article, ICiteResponse } from "./types";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(cors());
  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/icite", async (req, res) => {
    const { pmids } = req.body;
    if (!pmids || !Array.isArray(pmids)) {
      return res.status(400).json({ error: "Invalid PMIDs provided." });
    }

    const ICITE_API_URL = "https://icite.od.nih.gov/api/pubs?pmids=";
    const url = `${ICITE_API_URL}${pmids.join(",")}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          if (errorData && errorData.detail) {
            errorMessage = errorData.detail;
          }
        } catch (e) {}
        return res.status(response.status).json({ error: errorMessage });
      }
      const result: ICiteResponse = await response.json();
      res.json(result.data);
    } catch (error) {
      console.error("Failed to fetch iCite data:", error);
      res.status(500).json({ error: "Failed to fetch data from iCite API." });
    }
  });

  app.post("/api/chat", async (req, res) => {
    const { messages, contextData } = req.body;
    
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server." });
    }

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const systemInstruction = `You are an expert biomedical research assistant. The user has provided the following publication data from the NIH iCite database in JSON format. Your task is to answer questions based *only* on this data. Do not use any external knowledge. If the answer cannot be found in the provided data, state that clearly. Be concise and clear in your answers. Here is the data:\n${JSON.stringify(contextData, null, 2)}`;

      // Map messages to the format expected by generateContent
      // The frontend sends ChatMessage[] which is { role: 'user' | 'model', parts: { text: string }[] }
      // This matches the contents format for generateContent
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: messages,
        config: {
          systemInstruction: systemInstruction,
        },
      });

      res.json({ text: response.text });
    } catch (error) {
      console.error("Gemini API Error:", error);
      res.status(500).json({ error: "Failed to communicate with Gemini API." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
