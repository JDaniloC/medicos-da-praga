import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { StoryActSchema, type Next } from "@/lib/story/schema";
import { buildNext, parseNext } from "./next-utils";

const act1 = StoryActSchema.parse(
  JSON.parse(readFileSync("supabase/seed/act1.json", "utf8"))
);

function allNexts(act: typeof act1): Next[] {
  const out: Next[] = [];
  for (const n of act.nodes) {
    if (n.kind === "scene") n.choices.forEach((c) => out.push(c.next));
    if (n.kind === "dice") out.push(n.resolve.onSuccess.goto, n.resolve.onFail.goto);
  }
  return out;
}

describe("parseNext", () => {
  it("string vira modo direto", () => {
    expect(parseNext("cena2")).toEqual({ mode: "direct", target: "cena2" });
  });

  it("array vira modo condicional com default separado", () => {
    const next: Next = [
      { when: { flag: "x", value: true }, goto: "a" },
      { default: "b" },
    ];
    expect(parseNext(next)).toEqual({
      mode: "conditional",
      rules: [{ when: { flag: "x", value: true }, goto: "a" }],
      defaultTarget: "b",
    });
  });

  it("array sem default vira defaultTarget vazio (inválido até o autor escolher)", () => {
    expect(parseNext([{ when: { trait: "t" }, goto: "a" }])).toEqual({
      mode: "conditional",
      rules: [{ when: { trait: "t" }, goto: "a" }],
      defaultTarget: "",
    });
  });
});

describe("buildNext", () => {
  it("modo direto vira string", () => {
    expect(buildNext({ mode: "direct", target: "x" })).toBe("x");
  });

  it("modo condicional vira rules + default no fim", () => {
    expect(
      buildNext({ mode: "conditional", rules: [{ when: { trait: "t" }, goto: "a" }], defaultTarget: "b" })
    ).toEqual([{ when: { trait: "t" }, goto: "a" }, { default: "b" }]);
  });

  it("condicional sem regras vira só o default", () => {
    expect(buildNext({ mode: "conditional", rules: [], defaultTarget: "b" })).toEqual([
      { default: "b" },
    ]);
  });
});

describe("round-trip sobre todos os next do act1.json", () => {
  it("buildNext(parseNext(next)) preserva cada next do ato real", () => {
    const nexts = allNexts(act1);
    expect(nexts.length).toBeGreaterThan(20);
    for (const next of nexts) {
      expect(buildNext(parseNext(next))).toEqual(next);
    }
  });
});
