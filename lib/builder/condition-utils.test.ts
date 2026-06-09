import { describe, it, expect } from "vitest";
import { ConditionSchema, type Condition } from "@/lib/story/schema";
import {
  conditionKind, convertCondition, defaultCondition, unwrapCondition, wrapCondition,
  CONDITION_KINDS, type ConditionKind,
} from "./condition-utils";

describe("conditionKind", () => {
  it("identifica os 7 tipos", () => {
    expect(conditionKind({ trait: "druida" })).toBe("trait");
    expect(conditionKind({ flag: "x", value: true })).toBe("flag");
    expect(conditionKind({ hasItem: "espada" })).toBe("hasItem");
    expect(conditionKind({ treatment: { lanceiro: "sangria" } })).toBe("treatment");
    expect(conditionKind({ anyOf: [] })).toBe("anyOf");
    expect(conditionKind({ allOf: [] })).toBe("allOf");
    expect(conditionKind({ not: { trait: "x" } })).toBe("not");
  });
});

describe("defaultCondition", () => {
  it("produz valores válidos no ConditionSchema para todos os tipos", () => {
    for (const kind of CONDITION_KINDS) {
      expect(() => ConditionSchema.parse(defaultCondition(kind))).not.toThrow();
      expect(conditionKind(defaultCondition(kind))).toBe(kind);
    }
  });
});

describe("convertCondition", () => {
  const children: Condition[] = [{ trait: "druida" }, { hasItem: "espada" }];

  it("anyOf<->allOf preserva os filhos", () => {
    expect(convertCondition({ anyOf: children }, "allOf")).toEqual({ allOf: children });
    expect(convertCondition({ allOf: children }, "anyOf")).toEqual({ anyOf: children });
  });

  it("not -> grupo preserva o filho como único elemento", () => {
    expect(convertCondition({ not: children[0] }, "anyOf")).toEqual({ anyOf: [children[0]] });
  });

  it("grupo -> not usa o primeiro filho", () => {
    expect(convertCondition({ anyOf: children }, "not")).toEqual({ not: children[0] });
  });

  it("tipos folha viram o default do novo tipo", () => {
    expect(convertCondition({ trait: "druida" }, "flag")).toEqual(defaultCondition("flag"));
  });

  it("manter o mesmo tipo devolve a própria condição", () => {
    const c: Condition = { flag: "x", value: false };
    expect(convertCondition(c, "flag")).toBe(c);
  });
});

describe("wrapCondition / unwrapCondition", () => {
  const c: Condition = { trait: "druida" };

  it("envolve em not/anyOf/allOf preservando o filho", () => {
    expect(wrapCondition(c, "not")).toEqual({ not: c });
    expect(wrapCondition(c, "anyOf")).toEqual({ anyOf: [c] });
    expect(wrapCondition(c, "allOf")).toEqual({ allOf: [c] });
  });

  it("desembrulha not e grupos de um elemento; null para o resto", () => {
    expect(unwrapCondition({ not: c })).toEqual(c);
    expect(unwrapCondition({ anyOf: [c] })).toEqual(c);
    expect(unwrapCondition({ allOf: [c] })).toEqual(c);
    expect(unwrapCondition({ anyOf: [c, c] })).toBeNull();
    expect(unwrapCondition(c)).toBeNull();
  });
});
