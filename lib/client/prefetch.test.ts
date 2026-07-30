import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { StoryActSchema } from "../story/schema";
import { buildGraph } from "../story/graph";
import { createEngine } from "../engine/engine";
import type { GameState } from "../engine/types";
import { primeNextNarrations } from "./prefetch";
import * as narrationCache from "./narration-cache";

const act = StoryActSchema.parse(
  JSON.parse(readFileSync(resolve("supabase/seed/act1.json"), "utf8"))
);
const engine = createEngine(buildGraph(act));

function at(state: GameState, nodeId: string): GameState {
  return { ...state, currentNodeId: nodeId };
}

function okResponse(text: string) {
  return { ok: true, json: async () => ({ text }) } as unknown as Response;
}

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  narrationCache.clearNarrationCache();
  fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("primeNextNarrations", () => {
  it("pré-gera um pedido por futuro imediato de uma cena", async () => {
    fetchMock.mockResolvedValue(okResponse("prosa"));
    const s = engine.createInitialState("soldado");
    const esperadas = engine.getChoices(s).length;
    expect(esperadas).toBeGreaterThan(0);

    primeNextNarrations(engine, s);

    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(esperadas));
  });

  it("não pré-gera nada a partir de um final", async () => {
    fetchMock.mockResolvedValue(okResponse("prosa"));
    const s = at(engine.createInitialState("soldado"), "ending_a_morte");

    primeNextNarrations(engine, s);

    // Dá chance a qualquer microtask pendente de rodar antes de conferir.
    await new Promise((r) => setTimeout(r, 0));
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("não lança e não pré-gera nada quando nextNarrationInputs lança", async () => {
    fetchMock.mockResolvedValue(okResponse("prosa"));
    // Nó inexistente no grafo: engine.getNode (chamado dentro de nextNarrationInputs)
    // lança "Nó desconhecido", sem precisar editar a fixture do Ato 1.
    const s = at(engine.createInitialState("soldado"), "no_existe_no_grafo");

    expect(() => primeNextNarrations(engine, s)).not.toThrow();

    await new Promise((r) => setTimeout(r, 0));
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("um lance ao pré-gerar um irmão não impede a pré-geração dos demais", async () => {
    fetchMock.mockResolvedValue(okResponse("prosa"));
    // cena5 dá 3 escolhas visíveis ao soldado (calar, professor, tática) — garante
    // que sobra mais de um "irmão" além do que vai falhar.
    const s = at(engine.createInitialState("soldado"), "cena5");
    const esperadas = engine.getChoices(s).length;
    expect(esperadas).toBeGreaterThan(1);

    // Simula uma pré-geração individual que lança de forma síncrona — o cenário que
    // o try/catch por item em primeNextNarrations existe para conter. Provocar isso
    // a partir do `primeNarration` real exigiria um input tão malformado que já não
    // seria mais um "estado especulativo válido"; um stub é o jeito direto de testar
    // essa borda sem forçar a mão nos dados reais.
    vi.spyOn(narrationCache, "primeNarration").mockImplementationOnce(() => {
      throw new Error("falha simulada na pré-geração de um irmão");
    });

    expect(() => primeNextNarrations(engine, s)).not.toThrow();

    expect(narrationCache.primeNarration).toHaveBeenCalledTimes(esperadas);
  });
});
