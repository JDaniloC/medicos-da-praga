import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { StoryActSchema } from "../story/schema";
import { buildGraph } from "../story/graph";
import { createEngine } from "./engine";
import type { GameState } from "./types";
import { buildNarrationPrompt, type NarrationInput } from "../gemini/prompts";
import { diceActionLabel, narrationInputFor, nextNarrationInputs } from "./lookahead";

const act = StoryActSchema.parse(
  JSON.parse(readFileSync(resolve("supabase/seed/act1.json"), "utf8"))
);
const engine = createEngine(buildGraph(act));

// A chave real do cache: o próprio prompt final.
const key = (input: NarrationInput) => buildNarrationPrompt(input);

// Identidade do estado para o BFS. Ignora `rolls` de propósito: ele cresce a cada
// rolagem (o BFS nunca terminaria) e não entra no prompt. As chaves dos Records são
// ordenadas porque a ordem de inserção varia conforme o caminho percorrido.
function stateKey(s: GameState): string {
  // JSON.stringify em vez de juntar `chave=valor` com vírgula: um flag ou tratamento
  // cujo nome contivesse "," ou "=" colidiria dois estados distintos nessa chave e
  // encolheria silenciosamente a cobertura do BFS — a falha errada para o único
  // teste que garante o design inteiro.
  const flat = (o: Record<string, string | boolean>) =>
    JSON.stringify(Object.entries(o).sort());
  return [
    s.trait,
    s.currentNodeId,
    [...s.inventory].sort().join(","),
    flat(s.flags),
    flat(s.treatments),
    flat(s.patients),
  ].join("|");
}

// Rede de segurança contra BFS que não termina. O Ato 1 tem ~8,7 mil estados alcançáveis
// (os 3 pacientes em série multiplicam tratamento × desfecho), então o teto é generoso de
// propósito: ele existe para pegar explosão por ordens de magnitude — o caso de `rolls`
// voltar à identidade do estado — e não para policiar o crescimento normal do conteúdo.
const MAX_ESTADOS = 50000;

// Percorre todos os estados alcançáveis a partir dos 4 traços.
function varrerGrafo(visitar: (s: GameState) => void): number {
  const vistos = new Set<string>();
  const fila: GameState[] = engine.graph.traits.map((t) => engine.createInitialState(t.id));
  for (const s of fila) vistos.add(stateKey(s));

  let processados = 0;
  while (fila.length) {
    const s = fila.shift()!;
    processados++;
    expect(processados).toBeLessThan(MAX_ESTADOS);

    visitar(s);

    const node = engine.getNode(s);
    const sucessores: GameState[] =
      node.kind === "scene"
        ? engine.getChoices(s).map((c) => engine.chooseOption(s, c.id))
        : node.kind === "dice"
          // Todas as rolagens possíveis, não só 1 e 20.
          ? Array.from({ length: 20 }, (_, i) => engine.applyDiceRoll(s, i + 1).state)
          : [];

    for (const prox of sucessores) {
      const k = stateKey(prox);
      if (vistos.has(k)) continue;
      vistos.add(k);
      fila.push(prox);
    }
  }
  return processados;
}

describe("consistência entre pré-geração e transição real", () => {
  // Estes dois testes percorrem ~8,7 mil estados e ~59 mil transições. Sozinhos
  // rodam em ~1s, mas sob a carga paralela da suíte inteira numa máquina ocupada
  // podem passar dos 5s padrão do Vitest. O timeout generoso reflete o trabalho
  // que o teste genuinamente faz — não está mascarando um caminho lento.
  it("toda transição alcançável do Ato 1 já foi pré-gerada", { timeout: 30_000 }, () => {
    let transicoesVerificadas = 0;

    const estadosVisitados = varrerGrafo((s) => {
      const previstas = new Set(nextNarrationInputs(engine, s).map(key));
      const node = engine.getNode(s);

      if (node.kind === "scene") {
        for (const c of engine.getChoices(s)) {
          // Exatamente o que `handleChoice` faz em app/page.tsx.
          const real = narrationInputFor(engine, engine.chooseOption(s, c.id), c.label);
          expect(previstas.has(key(real))).toBe(true);
          transicoesVerificadas++;
        }
      }

      if (node.kind === "dice") {
        // Qualquer valor que o jogador tire tem de cair numa das 2 chaves previstas.
        for (let roll = 1; roll <= 20; roll++) {
          const outcome = engine.applyDiceRoll(s, roll);
          // Exatamente o que `confirmRoll` faz em app/page.tsx.
          const real = narrationInputFor(
            engine,
            outcome.state,
            diceActionLabel(outcome.success)
          );
          expect(previstas.has(key(real))).toBe(true);
          transicoesVerificadas++;
        }
      }
    });

    // Guarda contra um teste que passa por não ter percorrido nada. Os valores reais do
    // Ato 1 são ~8,7 mil estados e ~59 mil transições; estes pisos ficam uma ordem de
    // magnitude abaixo para tolerar edição de conteúdo, mas pegam um BFS que degenerou.
    expect(estadosVisitados).toBeGreaterThan(1000);
    expect(transicoesVerificadas).toBeGreaterThan(10000);
  });

  it("finais encerram a pré-geração", { timeout: 30_000 }, () => {
    let finais = 0;
    varrerGrafo((s) => {
      if (engine.getNode(s).kind !== "ending") return;
      finais++;
      expect(nextNarrationInputs(engine, s)).toEqual([]);
    });
    expect(finais).toBeGreaterThan(0);
  });
});
