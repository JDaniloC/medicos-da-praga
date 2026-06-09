import { describe, it, expect } from "vitest";
import { staleNodeIds } from "./persist";

describe("staleNodeIds", () => {
  it("retorna os ids que existem no banco mas não no ato atual", () => {
    expect(staleNodeIds(["a", "b", "c"], ["a", "c"])).toEqual(["b"]);
  });

  it("retorna vazio quando nada foi removido", () => {
    expect(staleNodeIds(["a", "b"], ["a", "b", "novo"])).toEqual([]);
  });

  it("retorna tudo quando o ato atual não tem nós", () => {
    expect(staleNodeIds(["a", "b"], [])).toEqual(["a", "b"]);
  });
});
