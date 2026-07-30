// lib/client/api.ts
import type { NarrationInput } from "@/lib/gemini/prompts";

// Sem isto, uma chamada travada (proxy que engole a conexão) ficaria em voo pra
// sempre — e como `requestNarration` reaproveita chamadas em voo, um jogador que
// clicar depois herdaria a mesma espera indefinida.
const NARRATION_TIMEOUT_MS = 30_000;

// Pede a prosa do narrador ao servidor. PROPAGA a falha de propósito: quem chama
// decide o que fazer. Mascarar o erro aqui faria o cache guardar um fallback para
// sempre, sem chance de nova tentativa.
export async function fetchNarrationOrThrow(args: NarrationInput): Promise<string> {
  const res = await fetch("/api/narrate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(args),
    signal: AbortSignal.timeout(NARRATION_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = (await res.json()) as { text?: string };
  const text = json.text?.trim();
  if (!text) throw new Error("O narrador devolveu texto vazio.");
  return text;
}
