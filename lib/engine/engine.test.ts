// lib/engine/engine.test.ts
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { StoryActSchema } from "../story/schema";
import { buildGraph } from "../story/graph";
import { createEngine } from "./engine";
import type { GameState } from "./types";

const act = StoryActSchema.parse(
  JSON.parse(readFileSync(resolve("supabase/seed/act1.json"), "utf8"))
);
const engine = createEngine(buildGraph(act));
const { createInitialState, chooseOption, applyDiceRoll, getChoices, getDifficulty, isEnding } = engine;

function at(state: GameState, nodeId: string): GameState {
  return { ...state, currentNodeId: nodeId };
}
function start(trait: string): GameState {
  return createInitialState(trait);
}

describe("estado inicial e inventário", () => {
  it("druida começa com poções de ervas", () => {
    expect(start("druida").inventory).toContain("pocoes_ervas");
  });
  it("soldado começa com espada curta", () => {
    expect(start("soldado").inventory).toContain("espada_curta");
  });
  it("acadêmico e religioso começam sem itens", () => {
    expect(start("academico").inventory).toEqual([]);
    expect(start("religioso").inventory).toEqual([]);
  });
});

describe("Cena 1 — bisturi de boa qualidade", () => {
  it("ouvir concede o bisturi e vai para cena2", () => {
    const s = chooseOption(start("soldado"), "ouvir");
    expect(s.inventory).toContain("bisturi_boa_qualidade");
    expect(s.currentNodeId).toBe("cena2");
  });
  it("observar não concede bisturi", () => {
    expect(chooseOption(start("soldado"), "observar").inventory).not.toContain("bisturi_boa_qualidade");
  });
});

describe("Cena 2 — traje e opção do druida", () => {
  it("apenas o druida vê repreender", () => {
    expect(getChoices(at(start("druida"), "cena2")).map((c) => c.id)).toContain("repreender");
    expect(getChoices(at(start("soldado"), "cena2")).map((c) => c.id)).not.toContain("repreender");
  });
  it("vestir liga usouTraje", () => {
    expect(chooseOption(at(start("soldado"), "cena2"), "vestir").flags.usouTraje).toBe(true);
  });
  it("repreender deixa sem traje e marca o professor", () => {
    const s = chooseOption(at(start("druida"), "cena2"), "repreender");
    expect(s.flags.usouTraje).toBe(false);
    expect(s.flags.repreendeuProfessor).toBe(true);
  });
});

describe("Cena 3 — roteamento", () => {
  it("druida que repreendeu vai para a punição", () => {
    let s = chooseOption(at(start("druida"), "cena2"), "repreender");
    s = chooseOption(s, "seguir");
    expect(s.currentNodeId).toBe("cena4_punicao");
  });
  it("acadêmico vai para investigação e descobre a praga", () => {
    const s = chooseOption(at(start("academico"), "cena3"), "seguir");
    expect(s.currentNodeId).toBe("cena4_investigacao");
    expect(s.flags.descobriuPraga).toBe(true);
  });
  it("soldado segue a rota padrão (paciente 1)", () => {
    expect(chooseOption(at(start("soldado"), "cena3"), "seguir").currentNodeId).toBe("cena4_p1");
  });
  it("druida que NÃO repreendeu segue a rota padrão", () => {
    let s = chooseOption(at(start("druida"), "cena2"), "vestir");
    s = chooseOption(s, "seguir");
    expect(s.currentNodeId).toBe("cena4_p1");
  });
});

describe("Cena 4 — dificuldades (modificadores ocultos)", () => {
  it("druida com dieta no lanceiro: 7; soldado: 10", () => {
    expect(getDifficulty(chooseOption(at(start("druida"), "cena4_p1"), "dieta"))).toBe(7);
    expect(getDifficulty(chooseOption(at(start("soldado"), "cena4_p1"), "dieta"))).toBe(10);
  });
  it("sangria no lanceiro: 13", () => {
    expect(getDifficulty(chooseOption(at(start("soldado"), "cena4_p1"), "sangria"))).toBe(13);
  });
  it("extração no arqueiro com bisturi + soldado: 7", () => {
    let s = chooseOption(start("soldado"), "ouvir");
    s = chooseOption(at(s, "cena4_p2"), "extracao");
    expect(getDifficulty(s)).toBe(7);
  });
  it("pasta no arqueiro favorece o druida: 9", () => {
    expect(getDifficulty(chooseOption(at(start("druida"), "cena4_p2"), "pasta"))).toBe(9);
  });
  it("religioso pode orar com o cavaleiro: 10", () => {
    expect(getChoices(at(start("religioso"), "cena4_p3")).map((c) => c.id)).toContain("orar");
    expect(getDifficulty(chooseOption(at(start("religioso"), "cena4_p3"), "orar"))).toBe(10);
  });
  it("registra o resultado do paciente após a rolagem", () => {
    const s = chooseOption(at(start("soldado"), "cena4_p1"), "dieta");
    const fail = applyDiceRoll(s, 1);
    expect(fail.success).toBe(false);
    expect(fail.state.patients.lanceiro).toBe("fracasso");
    expect(fail.state.currentNodeId).toBe("cena4_p2");
    expect(applyDiceRoll(s, 20).state.patients.lanceiro).toBe("sucesso");
  });
});

describe("Cena 5 — conselho", () => {
  it("opções por traço", () => {
    expect(getChoices(at(start("soldado"), "cena5")).map((c) => c.id)).toContain("tatica");
    expect(getChoices(at(start("religioso"), "cena5")).map((c) => c.id)).toContain("sacerdote");
    expect(getChoices(at(start("academico"), "cena5")).map((c) => c.id)).not.toContain("tatica");
  });
  it("apoiar a tática leva ao duelo e marca flags", () => {
    const s = chooseOption(at(start("soldado"), "cena5"), "tatica");
    expect(s.currentNodeId).toBe("cena5_duelo");
    expect(s.flags.taticaAceita).toBe(true);
    expect(s.flags.amizadeCanato).toBe(true);
  });
  it("calar/apoiar professor levam à ramificação B", () => {
    expect(chooseOption(at(start("soldado"), "cena5"), "calar").currentNodeId).toBe("ramb_intro");
    expect(chooseOption(at(start("religioso"), "cena5"), "professor").currentNodeId).toBe("ramb_intro");
  });
});

describe("Duelo — recompensa", () => {
  it("vencer concede espada inferior; ambos vão para rama_intro", () => {
    const s = chooseOption(at(start("soldado"), "cena5"), "tatica");
    const win = applyDiceRoll(s, 20);
    expect(win.state.inventory).toContain("espada_inferior");
    expect(win.state.currentNodeId).toBe("rama_intro");
    const lose = applyDiceRoll(s, 1);
    expect(lose.state.inventory).not.toContain("espada_inferior");
    expect(lose.state.currentNodeId).toBe("rama_intro");
  });
});

describe("Ramificação A", () => {
  it("alto risco (sem traje): 18", () => {
    expect(getDifficulty(at(start("soldado"), "rama_infeccao"))).toBe(18);
  });
  it("baixo risco (com traje): 6", () => {
    let s = chooseOption(at(start("soldado"), "cena2"), "vestir");
    s = at(s, "rama_infeccao");
    expect(getDifficulty(s)).toBe(6);
  });
  it("passar leva ao final saudável", () => {
    expect(applyDiceRoll(at(start("soldado"), "rama_infeccao"), 18).state.currentNodeId).toBe("ending_a_saudavel");
  });
  it("falhar leva à sobrevivência", () => {
    expect(applyDiceRoll(at(start("soldado"), "rama_infeccao"), 5).state.currentNodeId).toBe("rama_sobrevivencia");
  });
  it("sobrevivência: 19+ imuniza, abaixo é morte", () => {
    const s = at(start("soldado"), "rama_sobrevivencia");
    expect(getDifficulty(s)).toBe(19);
    const live = applyDiceRoll(s, 19);
    expect(live.state.flags.imunizado).toBe(true);
    expect(live.state.currentNodeId).toBe("ending_a_imune");
    expect(applyDiceRoll(s, 18).state.currentNodeId).toBe("ending_a_morte");
  });
});

describe("Ramificação B — combate por inventário", () => {
  it("soldado (com espada): 5", () => {
    expect(getDifficulty(at(start("soldado"), "ramb_combate"))).toBe(5);
  });
  it("só com bisturi: 12", () => {
    let s = chooseOption(start("academico"), "ouvir");
    s = at(s, "ramb_combate");
    expect(getDifficulty(s)).toBe(12);
  });
  it("de mãos nuas: 19", () => {
    expect(getDifficulty(at(start("academico"), "ramb_combate"))).toBe(19);
  });
  it("vencer/perder levam aos finais B", () => {
    const s = at(start("soldado"), "ramb_combate");
    expect(applyDiceRoll(s, 20).state.currentNodeId).toBe("ending_b_sobrevive");
    expect(applyDiceRoll(s, 1).state.currentNodeId).toBe("ending_b_morte");
  });
});

describe("Integração — playthrough do soldado (Ramificação A)", () => {
  it("vai da estrada até um final", () => {
    let s = start("soldado");
    s = chooseOption(s, "ouvir");
    s = chooseOption(s, "vestir");
    s = chooseOption(s, "seguir");
    s = chooseOption(s, "dieta");
    s = applyDiceRoll(s, 15).state;
    s = chooseOption(s, "extracao");
    s = applyDiceRoll(s, 15).state;
    s = chooseOption(s, "talas");
    s = applyDiceRoll(s, 15).state;
    expect(s.currentNodeId).toBe("cena5");
    s = chooseOption(s, "tatica");
    s = applyDiceRoll(s, 20).state;
    s = chooseOption(s, "marchar");
    s = applyDiceRoll(s, 20).state;
    expect(s.currentNodeId).toBe("ending_a_saudavel");
    expect(isEnding(s)).toBe(true);
  });
});
