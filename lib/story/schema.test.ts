import { describe, it, expect } from "vitest";
import { StoryActSchema, NodeSchema } from "./schema";

describe("StoryActSchema", () => {
  it("aceita um ato mínimo válido", () => {
    const act = {
      act: 1,
      title: "T",
      start: "a",
      worldContext: "ctx",
      traits: [{ id: "soldado", nome: "Soldado", descricao: "d", portrait: "portraits/soldado.webp", inventarioInicial: ["espada_curta"] }],
      nodes: [
        { id: "a", kind: "scene", image: "scenes/a.webp", narration: "n",
          choices: [{ id: "go", label: "Ir", next: "b" }] },
        { id: "b", kind: "ending", image: "scenes/b.webp", narration: "n", outcome: "saudavel", title: "Fim" },
      ],
    };
    expect(StoryActSchema.parse(act).nodes).toHaveLength(2);
  });

  it("valida um nó de dado com difficulty e resolve", () => {
    const node = {
      id: "d", kind: "dice", image: "scenes/d.webp", narration: "n", reason: "teste",
      difficulty: { base: 10, rules: [{ when: { trait: "druida" }, delta: -3 }] },
      resolve: { onSuccess: { goto: "x" }, onFail: { goto: "y" } },
    };
    expect(NodeSchema.parse(node).kind).toBe("dice");
  });

  it("rejeita nó com kind inválido", () => {
    expect(() => NodeSchema.parse({ id: "z", kind: "wat", image: "i", narration: "n" })).toThrow();
  });
});
