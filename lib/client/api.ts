// lib/client/api.ts
import type { NarrationInput } from "@/lib/gemini/prompts";

// Pede a prosa do narrador ao servidor. PROPAGA a falha de propósito: quem chama
// decide o que fazer. Mascarar o erro aqui faria o cache guardar um fallback para
// sempre, sem chance de nova tentativa.
export async function fetchNarrationOrThrow(args: NarrationInput): Promise<string> {
  const res = await fetch("/api/narrate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(args),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = (await res.json()) as { text?: string };
  const text = json.text?.trim();
  if (!text) throw new Error("O narrador devolveu texto vazio.");
  return text;
}

// Retorna a prosa do narrador. Em falha (ex.: sem API key), devolve o briefing como fallback.
export async function fetchNarration(args: NarrationInput): Promise<string> {
  try {
    return await fetchNarrationOrThrow(args);
  } catch {
    return args.brief;
  }
}
