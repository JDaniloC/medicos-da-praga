// Seletor de provedor de LLM para a narração. Definido por LLM_PROVIDER (padrão: gemini).
// Mantém a mesma assinatura `generateNarration(prompt, system)` independente do provedor.
import { generateNarration as geminiNarration } from "../gemini/client";
import { generateNarration as ollamaNarration } from "../ollama/client";

export type LlmProvider = "gemini" | "ollama";

export function activeProvider(): LlmProvider {
  return (process.env.LLM_PROVIDER ?? "gemini").trim().toLowerCase() === "ollama"
    ? "ollama"
    : "gemini";
}

export function generateNarration(prompt: string, system: string): Promise<string> {
  return activeProvider() === "ollama"
    ? ollamaNarration(prompt, system)
    : geminiNarration(prompt, system);
}
