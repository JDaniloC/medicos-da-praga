import { describe, it, expect } from "vitest";
import { EffectSchema, type Effect } from "@/lib/story/schema";
import { defaultEffect, effectKind, convertEffect, EFFECT_KINDS } from "./effect-utils";

describe("effectKind", () => {
  it("identifica os 4 tipos", () => {
    expect(effectKind({ setFlag: "x", value: true })).toBe("setFlag");
    expect(effectKind({ grantItem: "espada" })).toBe("grantItem");
    expect(effectKind({ setTreatment: "lanceiro", value: "sangria" })).toBe("setTreatment");
    expect(effectKind({ setPatient: "lanceiro", value: "sucesso" })).toBe("setPatient");
  });
});

describe("defaultEffect", () => {
  it("produz valores válidos no EffectSchema para todos os tipos", () => {
    for (const kind of EFFECT_KINDS) {
      expect(() => EffectSchema.parse(defaultEffect(kind))).not.toThrow();
      expect(effectKind(defaultEffect(kind))).toBe(kind);
    }
  });
});

describe("convertEffect", () => {
  it("troca de tipo preserva o when", () => {
    const e: Effect = { setFlag: "x", value: true, when: { trait: "druida" } };
    expect(convertEffect(e, "grantItem")).toEqual({ grantItem: "", when: { trait: "druida" } });
  });

  it("manter o mesmo tipo devolve o próprio effect", () => {
    const e: Effect = { grantItem: "espada" };
    expect(convertEffect(e, "grantItem")).toBe(e);
  });
});
