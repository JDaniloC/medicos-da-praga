import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { StoryActSchema } from "@/lib/story/schema";
import {
  flagNames, itemIds, nodeIds, patientIds, traitIds, treatmentValues,
} from "./harvest";

const act = StoryActSchema.parse(
  JSON.parse(readFileSync("supabase/seed/act1.json", "utf8"))
);

describe("harvest (sobre o act1.json real)", () => {
  it("nodeIds preserva a ordem do documento", () => {
    expect(nodeIds(act)).toEqual(act.nodes.map((n) => n.id));
    expect(nodeIds(act)).toContain("cena1");
    expect(nodeIds(act)).toHaveLength(23);
  });

  it("traitIds vem da lista de traits", () => {
    expect(traitIds(act)).toEqual(["druida", "academico", "soldado", "religioso"]);
  });

  it("itemIds vem das chaves do record items", () => {
    expect(itemIds(act)).toEqual([
      "bisturi_boa_qualidade", "espada_curta", "pocoes_ervas", "espada_inferior",
    ]);
  });

  it("flagNames varre effects setFlag e condições flag (único + ordenado)", () => {
    expect(flagNames(act)).toEqual([
      "amizadeCanato", "descobriuPraga", "imunizado",
      "repreendeuProfessor", "rotaPunicao", "taticaAceita", "usouTraje",
    ]);
  });

  it("patientIds varre setTreatment/setPatient e condições treatment", () => {
    expect(patientIds(act)).toEqual(["arqueiro", "cavaleiro", "lanceiro"]);
  });

  it("treatmentValues varre valores de setTreatment e de condições treatment", () => {
    expect(treatmentValues(act)).toEqual([
      "amputar", "dieta", "extracao", "orar_talas", "pasta", "sangria", "talas",
    ]);
  });
});
