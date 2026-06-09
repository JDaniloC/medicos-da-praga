import { describe, it, expect } from "vitest";
import { replaceAt, removeAt, insertAt, moveItem } from "./immutable";

describe("replaceAt", () => {
  it("substitui o item no índice sem mutar o original", () => {
    const arr = [1, 2, 3];
    expect(replaceAt(arr, 1, 9)).toEqual([1, 9, 3]);
    expect(arr).toEqual([1, 2, 3]);
  });
});

describe("removeAt", () => {
  it("remove o item no índice sem mutar o original", () => {
    const arr = ["a", "b", "c"];
    expect(removeAt(arr, 0)).toEqual(["b", "c"]);
    expect(arr).toEqual(["a", "b", "c"]);
  });
});

describe("insertAt", () => {
  it("insere o item no índice", () => {
    expect(insertAt([1, 3], 1, 2)).toEqual([1, 2, 3]);
  });

  it("insere no fim quando o índice é o tamanho", () => {
    expect(insertAt([1, 2], 2, 3)).toEqual([1, 2, 3]);
  });
});

describe("moveItem", () => {
  it("move um item para frente", () => {
    expect(moveItem(["a", "b", "c"], 0, 2)).toEqual(["b", "c", "a"]);
  });

  it("move um item para trás", () => {
    expect(moveItem(["a", "b", "c"], 2, 0)).toEqual(["c", "a", "b"]);
  });

  it("retorna o array igual quando o destino está fora dos limites", () => {
    expect(moveItem(["a", "b"], 0, -1)).toEqual(["a", "b"]);
    expect(moveItem(["a", "b"], 1, 2)).toEqual(["a", "b"]);
  });
});
