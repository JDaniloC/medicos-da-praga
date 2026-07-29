// lib/client/narration-cache.ts
// Cache de narrações em memória, vivo enquanto durar a partida. A chave é o próprio
// prompt final: assim o texto pré-gerado é, por construção, idêntico ao que sairia ao
// vivo — não há como a pré-geração e o caminho real divergirem.
import { buildNarrationPrompt, type NarrationInput } from "@/lib/gemini/prompts";
import { fetchNarrationOrThrow } from "./api";

interface Entry {
  promise: Promise<string>;
  text?: string; // preenchido quando a promise resolve
}

const cache = new Map<string, Entry>();

function keyOf(input: NarrationInput): string {
  return buildNarrationPrompt(input);
}

// Devolve a narração. Se já houver uma chamada em voo para o mesmo prompt, entra
// nela em vez de disparar outra — é isso que cobre o jogador que escolhe antes da
// pré-geração terminar. Em falha, descarta a entrada para permitir nova tentativa.
export function requestNarration(input: NarrationInput): Promise<string> {
  const key = keyOf(input);
  const hit = cache.get(key);
  if (hit) return hit.promise;

  const promise = fetchNarrationOrThrow(input).then(
    (text) => {
      // Pode ter sido limpo no meio do caminho (Recomeçar): aí não repovoa.
      const entry = cache.get(key);
      if (entry) entry.text = text;
      return text;
    },
    (err) => {
      cache.delete(key);
      throw err;
    }
  );

  cache.set(key, { promise });
  return promise;
}

// Gera em segundo plano. Nunca lança: falhar aqui só significa que o jogador vai
// esperar normalmente se chegar nessa cena.
export function primeNarration(input: NarrationInput): void {
  requestNarration(input).catch(() => {});
}

// Texto pronto, ou null se ainda está pendente (ou nunca foi pedido).
export function peekNarration(input: NarrationInput): string | null {
  return cache.get(keyOf(input))?.text ?? null;
}

export function clearNarrationCache(): void {
  cache.clear();
}
