import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { StoryActSchema } from "../story/schema";
import { buildGraph } from "../story/graph";
import { createEngine } from "./engine";
import type { GameState } from "./types";
import { buildNarrationPrompt } from "../gemini/prompts";
import { diceActionLabel, narrationInputFor, nextNarrationInputs } from "./lookahead";

const act = StoryActSchema.parse(
  JSON.parse(readFileSync(resolve("supabase/seed/act1.json"), "utf8"))
);
const engine = createEngine(buildGraph(act));

function at(state: GameState, nodeId: string): GameState {
  return { ...state, currentNodeId: nodeId };
}

describe("narrationInputFor", () => {
  it("monta o input a partir do grafo e do estado", () => {
    const s = engine.createInitialState("soldado");
    const input = narrationInputFor(engine, s, "abriu a porta");

    expect(input.brief).toBe(engine.getNarration(s));
    expect(input.worldContext).toBe(engine.graph.worldContext);
    expect(input.traitNome).toBe("Soldado");
    expect(input.inventory).toEqual(s.inventory);
    expect(input.inventoryLabels).toBe(engine.graph.items);
    expect(input.lastAction).toBe("abriu a porta");
    expect(input.isDice).toBe(false);
  });

  it("marca isDice em nós de teste de dado", () => {
    const s = at(engine.createInitialState("soldado"), "cena5_duelo");
    expect(narrationInputFor(engine, s).isDice).toBe(true);
  });

  it("deixa lastAction indefinido quando não há ação anterior", () => {
    const s = engine.createInitialState("soldado");
    expect(narrationInputFor(engine, s).lastAction).toBeUndefined();
  });
});

describe("nextNarrationInputs em cenas", () => {
  it("gera um input por escolha visível, com o rótulo da escolha", () => {
    const s = engine.createInitialState("soldado");
    const inputs = nextNarrationInputs(engine, s);
    const visiveis = engine.getChoices(s);

    expect(inputs).toHaveLength(visiveis.length);
    expect(inputs.map((i) => i.lastAction)).toEqual(visiveis.map((c) => c.label));
  });

  it("não pré-gera escolhas que o traço não enxerga", () => {
    // `cena5` tem 4 escolhas, mas `sacerdote` exige o traço religioso e `tatica`
    // exige o soldado. Pré-gerar caminhos impossíveis seria dinheiro no lixo.
    const soldado = at(engine.createInitialState("soldado"), "cena5");
    const academico = at(engine.createInitialState("academico"), "cena5");

    const rotulosSoldado = nextNarrationInputs(engine, soldado).map((i) => i.lastAction);
    const rotulosAcademico = nextNarrationInputs(engine, academico).map((i) => i.lastAction);

    expect(rotulosSoldado).toHaveLength(3); // calar, professor, tatica
    expect(rotulosAcademico).toHaveLength(2); // calar, professor
    expect(rotulosSoldado).toEqual(engine.getChoices(soldado).map((c) => c.label));
  });

  it("usa o briefing do nó de destino, não o do nó atual", () => {
    const s = engine.createInitialState("soldado");
    const primeira = engine.getChoices(s)[0];
    const destino = engine.chooseOption(s, primeira.id);

    expect(nextNarrationInputs(engine, s)[0].brief).toBe(engine.getNarration(destino));
  });
});

describe("nextNarrationInputs em testes de dado", () => {
  it("gera exatamente os dois ramos, sem citar o valor rolado", () => {
    const s = at(engine.createInitialState("soldado"), "cena5_duelo");
    const inputs = nextNarrationInputs(engine, s);

    expect(inputs).toHaveLength(2);
    expect(inputs.map((i) => i.lastAction)).toEqual([
      diceActionLabel(true),
      diceActionLabel(false),
    ]);
    for (const i of inputs) expect(i.lastAction).not.toMatch(/\d/);
  });

  it("gera briefings distintos quando os ramos divergem de nó", () => {
    // rama_sobrevivencia: sucesso -> ending_a_imune, fracasso -> ending_a_morte.
    const s = at(engine.createInitialState("druida"), "rama_sobrevivencia");
    const [sucesso, fracasso] = nextNarrationInputs(engine, s);
    expect(sucesso.brief).not.toBe(fracasso.brief);
  });

  it("gera inputs distintos mesmo quando os ramos convergem para o mesmo nó", () => {
    // cena5_duelo manda os dois lados para rama_intro; o que separa os inputs é o
    // rótulo da ação e a recompensa (espada_inferior só no sucesso).
    const s = at(engine.createInitialState("soldado"), "cena5_duelo");
    const [sucesso, fracasso] = nextNarrationInputs(engine, s);

    expect(sucesso.brief).toBe(fracasso.brief);
    expect(sucesso.inventory).toContain("espada_inferior");
    expect(fracasso.inventory).not.toContain("espada_inferior");
    expect(buildNarrationPrompt(sucesso)).not.toBe(buildNarrationPrompt(fracasso));
  });

  it("funciona mesmo no teste mais difícil do ato (dificuldade 19)", () => {
    const s = at(engine.createInitialState("druida"), "rama_sobrevivencia");
    const inputs = nextNarrationInputs(engine, s);

    expect(inputs).toHaveLength(2);
    expect(inputs[0].lastAction).toBe(diceActionLabel(true));
    expect(inputs[1].lastAction).toBe(diceActionLabel(false));
  });
});

describe("nextNarrationInputs em finais", () => {
  it("não gera nada, encerrando a pré-geração", () => {
    const s = at(engine.createInitialState("soldado"), "ending_a_morte");
    expect(nextNarrationInputs(engine, s)).toEqual([]);
  });
});
