import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { NodeSchema, StoryActSchema, type StoryAct } from "@/lib/story/schema";
import { validateAct } from "@/lib/story/validate";
import { countReferences, duplicateNode, newNode, renameNodeId, uniqueNodeId } from "./act-utils";

const act1 = StoryActSchema.parse(
  JSON.parse(readFileSync("supabase/seed/act1.json", "utf8"))
);

// Ato mínimo com referências controladas para testes precisos.
const mini: StoryAct = StoryActSchema.parse({
  act: 9,
  title: "T",
  start: "a",
  worldContext: "ctx",
  traits: [],
  nodes: [
    {
      id: "a", kind: "scene", image: "i", narration: "n",
      choices: [
        { id: "c1", label: "L", next: "b" },
        { id: "c2", label: "L", next: [{ when: { flag: "f", value: true }, goto: "b" }, { default: "fim" }] },
      ],
    },
    {
      id: "b", kind: "dice", image: "i", narration: "n", reason: "r",
      difficulty: { base: 10 },
      resolve: { onSuccess: { goto: "fim" }, onFail: { goto: [{ default: "b" }] } },
    },
    { id: "fim", kind: "ending", image: "i", narration: "n", outcome: "o", title: "Fim" },
  ],
});

describe("countReferences", () => {
  it("conta start, next direto, rules goto/default e resolve", () => {
    expect(countReferences(mini, "a")).toBe(1); // só o start
    expect(countReferences(mini, "b")).toBe(3); // next direto, goto condicional, default do onFail
    expect(countReferences(mini, "fim")).toBe(2); // default da choice + goto do onSuccess
  });
});

describe("renameNodeId", () => {
  it("propaga o novo id para todas as referências do ato mínimo", () => {
    const renamed = renameNodeId(mini, "b", "novo_b");
    expect(renamed.nodes.map((n) => n.id)).toEqual(["a", "novo_b", "fim"]);
    expect(countReferences(renamed, "b")).toBe(0);
    expect(countReferences(renamed, "novo_b")).toBe(3);
    expect(validateAct(renamed).ok).toBe(true);
  });

  it("renomeia o start junto", () => {
    const renamed = renameNodeId(mini, "a", "inicio");
    expect(renamed.start).toBe("inicio");
    expect(validateAct(renamed).ok).toBe(true);
  });

  it("round-trip no act1.json real: renomear e voltar restaura o original", () => {
    const there = renameNodeId(act1, "cena2", "cena2_renomeada");
    expect(validateAct(there).ok).toBe(true);
    expect(there.nodes.some((n) => n.id === "cena2")).toBe(false);
    const back = renameNodeId(there, "cena2_renomeada", "cena2");
    expect(back).toEqual(act1);
  });
});

describe("newNode / uniqueNodeId / duplicateNode", () => {
  it("newNode produz nós que passam no NodeSchema para os 3 kinds", () => {
    for (const kind of ["scene", "dice", "ending"] as const) {
      expect(NodeSchema.parse(newNode(kind, "x")).kind).toBe(kind);
    }
  });

  it("uniqueNodeId evita colisões com sufixo incremental", () => {
    expect(uniqueNodeId(mini, "novo_no")).toBe("novo_no");
    expect(uniqueNodeId(mini, "a")).toBe("a_2");
  });

  it("duplicateNode clona fundo com novo id", () => {
    const copy = duplicateNode(mini, mini.nodes[0]);
    expect(copy.id).toBe("a_2");
    expect(copy.kind).toBe("scene");
    if (copy.kind === "scene" && mini.nodes[0].kind === "scene") {
      expect(copy.choices).toEqual(mini.nodes[0].choices);
      expect(copy.choices).not.toBe(mini.nodes[0].choices);
    }
  });
});
