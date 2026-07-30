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

// Fila da pré-geração: encadeia as chamadas de `primeNarration` para que rodem uma de
// cada vez, nunca em paralelo. O jogador tem o tempo de leitura inteiro para a fila
// drenar, então não há ganho em paralelizar — só risco de estourar o rate limit e
// atrasar a chamada em primeiro plano que o jogador está de fato esperando.
let chain: Promise<unknown> = Promise.resolve();

// Bumped por `clearNarrationCache`: cada turno da fila confere se ainda pertence à
// mesma geração antes de disparar, senão desiste. É o que impede um "Recomeçar" de
// deixar prefetches da partida abandonada consumindo cota em segundo plano.
let generation = 0;

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
      // Só mexe na entrada se ela ainda for a desta chamada. Um "Recomeçar" no meio
      // de uma geração deixa a antiga órfã: ela não pode sobrescrever a nova.
      const entry = cache.get(key);
      if (entry?.promise === promise) entry.text = text;
      return text;
    },
    (err) => {
      // Mesma razão: uma geração órfã que falha não pode apagar a entrada válida.
      const entry = cache.get(key);
      if (entry?.promise === promise) cache.delete(key);
      throw err;
    }
  );

  cache.set(key, { promise });
  return promise;
}

// Gera em segundo plano, uma pré-geração de cada vez (ver `chain` acima). Nunca
// lança: falhar aqui só significa que o jogador vai esperar normalmente se chegar
// nessa cena. Não participa do dedupe eager de `requestNarration` — quem clica no
// meio da fila chama `requestNarration` direto e entra na entrada em voo, sem
// esperar a vez na fila.
export function primeNarration(input: NarrationInput): void {
  const geracaoDoPedido = generation;
  chain = chain
    .then(() => {
      if (geracaoDoPedido !== generation) return;
      return requestNarration(input);
    })
    // O catch fica no fim da corrente, não colado ao `requestNarration`: assim ele
    // absorve também uma falha *sincrônica* (montar a chave é a única parte que roda
    // fora de promise). Sem isso, um throw sincrônico deixaria `chain` rejeitada para
    // sempre e todo turno seguinte seria pulado — a pré-geração se desligaria pelo
    // resto da sessão, sem nenhum sinal.
    .catch(() => {});
}

// Texto pronto, ou null se ainda está pendente (ou nunca foi pedido).
export function peekNarration(input: NarrationInput): string | null {
  return cache.get(keyOf(input))?.text ?? null;
}

export function clearNarrationCache(): void {
  cache.clear();
  generation++;
  // Solta a cabeça da fila. A pré-geração que já está em voo não tem como ser
  // cancelada, mas o resultado dela é descartado pela identidade da promise em
  // `requestNarration`; o que não pode acontecer é a partida nova ficar esperando
  // atrás dela (até 30s, o teto do timeout) para começar a pré-gerar.
  chain = Promise.resolve();
}
