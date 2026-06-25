import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy initialize Gemini client to prevent crash if key is missing
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// API endpoint to generate listicle content
app.post("/api/generate-listicle", async (req, res) => {
  try {
    const { topic, itemCount, tone, audience } = req.body;

    if (!topic) {
      return res.status(400).json({ error: "Konu alanı zorunludur." });
    }

    const client = getGeminiClient();

    const count = itemCount || 5;
    const selectedTone = tone || "samimi ve enerjik";
    const selectedAudience = audience || "genel okuyucu";

    const prompt = `Lütfen aşağıdaki bilgilere göre harika ve sürükleyici bir "Liste Blogu" (Listicle) içerik stratejisi ve taslağı oluştur:
Konu: ${topic}
Madde Sayısı: ${count}
Yazım Dili/Tonu: ${selectedTone} (samimi, enerjik ve akıcı olmalı)
Hedef Kitle: ${selectedAudience}

Senden isteklerim şunlardır:
1. Okuyucuyu hemen yakalayan, merak uyandırıcı, tıklama oranı yüksek 3 adet alternatif başlık (titleSuggestions) öner.
2. Listeyi ${count} maddelik yap.
3. Her madde için; madde başlığı (itemTitle), kısa ve sürükleyici bir açıklama (description - en az 2-3 cümle) ve okuyucuyu siteye bağlayacak heyecan verici bir 'Neden yapmalısın/izlemelisin/dikkat etmelisin?' notu (whyPrompt) yaz.
4. Her madde için, Unsplash gibi platformlarda aratılabilecek İngilizce odaklı kaliteli, telif hakkı içermeyen görsel arama terimi (visualSearchQuery) belirle (örn: "cyberpunk city neon", "minimalist desk setup", vb.).
5. Yazının en sonuna, okuyucunun yorum yapmasını teşvik edecek ve etkileşimi artıracak samimi bir soru (closingQuestion) ekle.

Tüm yanıt Türkçe olmalıdır (görsel arama terimleri hariç, onlar İngilizce olmalı).`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            titleSuggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Önerilen 3 adet ilgi çekici başlık alternatifi.",
            },
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.INTEGER },
                  itemTitle: { type: Type.STRING, description: "Maddenin başlığı (örn: '1. Interstellar (2014)')" },
                  description: { type: Type.STRING, description: "Madde hakkında 2-3 cümlelik sürükleyici ve merak uyandıran açıklama." },
                  whyPrompt: { type: Type.STRING, description: "Okuyucuyu bağlayacak 'Neden yapmalısın/izlemelisin?' notu." },
                  visualSearchQuery: { type: Type.STRING, description: "Bu maddeyi en iyi temsil eden, telif hakkı içermeyen görsel için İngilizce Unsplash arama kelimeleri." },
                },
                required: ["id", "itemTitle", "description", "whyPrompt", "visualSearchQuery"],
              },
            },
            closingQuestion: {
              type: Type.STRING,
              description: "Yazının sonundaki etkileşimi artıracak soru.",
            },
          },
          required: ["titleSuggestions", "items", "closingQuestion"],
        },
      },
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("Gemini API boş bir yanıt döndürdü.");
    }

    const data = JSON.parse(resultText);
    res.json(data);
  } catch (error: any) {
    console.error("Listicle generation error:", error);
    res.status(500).json({
      error: "İçerik üretilirken bir hata oluştu.",
      details: error.message || error,
    });
  }
});

// Serve assets and handle single page application fallback
const startServer = async () => {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
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
    console.log(`Server running on port ${PORT}`);
  });
};

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
