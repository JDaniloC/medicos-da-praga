import { describe, it, expect } from "vitest";
import { evalCondition, applyEffects, computeDifficulty, resolveNext, visibleChoices } from "./interpreter";
import type { GameState } from "../engine/types";
import type { SceneNode } from "./schema";

function baseState(over: Partial<GameState> = {}): GameState {
  return { trait: "soldado", inventory: [], currentNodeId: "x", flags: {}, treatments: {}, patients: {}, rolls: [], ...over };
}

describe("evalCondition", () => {
  it("trait, flag (ausente=false), hasItem", () => {
    const s = baseState({ inventory: ["espada_curta"], flags: { usouTraje: true } });
    expect(evalCondition({ trait: "soldado" }, s)).toBe(true);
    expect(evalCondition({ trait: "druida" }, s)).toBe(false);
    expect(evalCondition({ flag: "usouTraje", value: true }, s)).toBe(true);
    expect(evalCondition({ flag: "naoExiste", value: false }, s)).toBe(true);
    expect(evalCondition({ hasItem: "espada_curta" }, s)).toBe(true);
  });
  it("treatment, anyOf, allOf, not", () => {
    const s = baseState({ treatments: { lanceiro: "dieta" } });
    expect(evalCondition({ treatment: { lanceiro: "dieta" } }, s)).toBe(true);
    expect(evalCondition({ treatment: { lanceiro: "sangria" } }, s)).toBe(false);
    expect(evalCondition({ anyOf: [{ trait: "druida" }, { trait: "soldado" }] }, s)).toBe(true);
    expect(evalCondition({ allOf: [{ trait: "soldado" }, { treatment: { lanceiro: "dieta" } }] }, s)).toBe(true);
    expect(evalCondition({ not: { trait: "druida" } }, s)).toBe(true);
  });
});

describe("applyEffects", () => {
  it("aplica setFlag/grantItem/setTreatment/setPatient com when", () => {
    let s = baseState();
    s = applyEffects([{ setFlag: "usouTraje", value: true }], s);
    expect(s.flags.usouTraje).toBe(true);
    s = applyEffects([{ grantItem: "bisturi_boa_qualidade" }], s);
    expect(s.inventory).toContain("bisturi_boa_qualidade");
    s = applyEffects([{ setTreatment: "lanceiro", value: "dieta" }], s);
    expect(s.treatments.lanceiro).toBe("dieta");
    s = applyEffects([{ setPatient: "lanceiro", value: "sucesso" }], s);
    expect(s.patients.lanceiro).toBe("sucesso");
    s = applyEffects([{ setFlag: "x", value: true, when: { trait: "druida" } }], s);
    expect(s.flags.x).toBeUndefined();
    s = applyEffects([{ grantItem: "bisturi_boa_qualidade" }], s);
    expect(s.inventory.filter((i) => i === "bisturi_boa_qualidade")).toHaveLength(1);
  });
});

describe("computeDifficulty", () => {
  it("base + regras em ordem (set substitui, delta soma) com clamp", () => {
    const s = baseState({ trait: "druida", treatments: { lanceiro: "dieta" } });
    const d = computeDifficulty(
      { base: 10, rules: [
        { when: { treatment: { lanceiro: "sangria" } }, set: 13 },
        { when: { allOf: [{ trait: "druida" }, { treatment: { lanceiro: "dieta" } }] }, delta: -3 },
      ] }, s);
    expect(d).toBe(7);
  });
  it("regra posterior (set) vence a anterior", () => {
    const s = baseState({ trait: "soldado", inventory: ["espada_curta", "bisturi_boa_qualidade"] });
    const d = computeDifficulty(
      { base: 19, rules: [
        { when: { hasItem: "bisturi_boa_qualidade" }, set: 12 },
        { when: { anyOf: [{ trait: "soldado" }, { hasItem: "espada_curta" }] }, set: 5 },
      ] }, s);
    expect(d).toBe(5);
  });
});

describe("resolveNext / visibleChoices", () => {
  it("resolveNext: string direta, regra com when, default", () => {
    const s = baseState({ trait: "academico" });
    expect(resolveNext("cena2", s)).toBe("cena2");
    expect(resolveNext([{ when: { trait: "academico" }, goto: "inv" }, { default: "pad" }], s)).toBe("inv");
    expect(resolveNext([{ when: { trait: "druida" }, goto: "x" }, { default: "pad" }], s)).toBe("pad");
  });
  it("visibleChoices filtra por requiresTrait e when", () => {
    const node = { id: "n", kind: "scene", image: "i", narration: "x", choices: [
      { id: "a", label: "A", next: "z" },
      { id: "b", label: "B", requiresTrait: "druida", next: "z" },
      { id: "c", label: "C", when: { hasItem: "espada_curta" }, next: "z" },
    ] } as SceneNode;
    const s = baseState({ trait: "soldado", inventory: ["espada_curta"] });
    expect(visibleChoices(node, s).map((c) => c.id)).toEqual(["a", "c"]);
  });
});
