import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { validateAct } from "../lib/story/validate";

describe("validateAct", () => {
  it("aceita o Ato 1 real", () => {
    const json = JSON.parse(readFileSync(resolve("supabase/seed/act1.json"), "utf8"));
    const r = validateAct(json);
    expect(r.ok).toBe(true);
  });
  it("rejeita referência órfã", () => {
    const r = validateAct({
      act: 9, title: "T", start: "a", worldContext: "", traits: [],
      nodes: [{ id: "a", kind: "scene", image: "i", narration: "n", choices: [{ id: "x", label: "X", next: "naoexiste" }] }],
    });
    expect(r.ok).toBe(false);
  });
  it("rejeita start inexistente", () => {
    const r = validateAct({
      act: 9, title: "T", start: "zzz", worldContext: "", traits: [],
      nodes: [{ id: "a", kind: "ending", image: "i", narration: "n", outcome: "fim", title: "Fim" }],
    });
    expect(r.ok).toBe(false);
  });
});
