// lib/gemini/client.ts
import { GoogleGenAI } from "@google/genai";

export const TEXT_MODEL = "gemini-2.5-flash";

let client: GoogleGenAI | null = null;

// Singleton server-side. A chave fica só no servidor (env var), nunca no cliente.
export function getClient(): GoogleGenAI {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY não configurada no ambiente do servidor.");
  }
  if (!client) client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  return client;
}

export async function generateNarration(prompt: string, system: string): Promise<string> {
  const ai = getClient();
  const res = await ai.models.generateContent({
    model: TEXT_MODEL,
    contents: prompt,
    config: { systemInstruction: system, temperature: 1.0, thinkingConfig: { thinkingBudget: 0 } },
  });
  return res.text ?? "";
}
