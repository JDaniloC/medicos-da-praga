import { describe, it, expect } from "vitest";
import { recordToPairs, pairsToRecord, duplicateKeys } from "./record-utils";

describe("recordToPairs / pairsToRecord", () => {
  it("faz round-trip preservando ordem de inserção", () => {
    const record = { espada_curta: "Espada curta", pocoes_ervas: "Poções de ervas" };
    const pairs = recordToPairs(record);
    expect(pairs).toEqual([
      { key: "espada_curta", label: "Espada curta" },
      { key: "pocoes_ervas", label: "Poções de ervas" },
    ]);
    expect(pairsToRecord(pairs)).toEqual(record);
  });

  it("trata record indefinido como lista vazia", () => {
    expect(recordToPairs(undefined)).toEqual([]);
  });

  it("pairsToRecord ignora chaves vazias e a última duplicada vence", () => {
    expect(
      pairsToRecord([
        { key: "", label: "x" },
        { key: "a", label: "1" },
        { key: "a", label: "2" },
      ])
    ).toEqual({ a: "2" });
  });
});

describe("duplicateKeys", () => {
  it("aponta chaves repetidas não vazias", () => {
    expect(
      duplicateKeys([
        { key: "a", label: "" },
        { key: "b", label: "" },
        { key: "a", label: "" },
        { key: "", label: "" },
        { key: "", label: "" },
      ])
    ).toEqual(["a"]);
  });
});
