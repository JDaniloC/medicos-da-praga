// lib/client/api.ts
import type { NarrationInput } from "@/lib/gemini/prompts";

// Retorna a prosa do narrador. Em falha (ex.: sem API key), devolve o briefing como fallback.
export async function fetchNarration(args: NarrationInput): Promise<string> {
  try {
    const res = await fetch("/api/narrate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(args),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = (await res.json()) as { text?: string };
    return json.text?.trim() || args.brief;
  } catch {
    return args.brief;
  }
}
