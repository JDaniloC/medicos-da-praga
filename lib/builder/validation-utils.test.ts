import { describe, it, expect } from "vitest";
import { errorNodeIndex } from "./validation-utils";

describe("errorNodeIndex", () => {
  it("extrai o índice do nó de um erro Zod com path nodes.<i>", () => {
    expect(errorNodeIndex("nodes.3.choices.0.next: regra inválida")).toBe(3);
    expect(errorNodeIndex("nodes.0.narration: obrigatório")).toBe(0);
  });

  it("retorna null para erros sem path de nó", () => {
    expect(errorNodeIndex("Referência órfã: cena_99")).toBeNull();
    expect(errorNodeIndex("title: obrigatório")).toBeNull();
    expect(errorNodeIndex("Nó inicial inexistente: x")).toBeNull();
  });
});
