import { describe, it, expect } from "vitest";
import { ambientValueFromKey, sanitizeAssetName } from "./media-utils";

describe("sanitizeAssetName", () => {
  it("vira snake_case sem acentos nem caracteres especiais", () => {
    expect(sanitizeAssetName("Cena 1 — O Cerco!")).toBe("cena_1_o_cerco");
    expect(sanitizeAssetName("Hospital de Campanha.webp")).toBe("hospital_de_campanha_webp");
    expect(sanitizeAssetName("ção_Ímã")).toBe("cao_ima");
  });

  it("colapsa separadores repetidos e bordas", () => {
    expect(sanitizeAssetName("__a  -- b__")).toBe("a_b");
  });

  it("vazio vira 'arquivo'", () => {
    expect(sanitizeAssetName("!!!")).toBe("arquivo");
  });
});

describe("ambientValueFromKey", () => {
  it("remove o prefixo sfx/ e a extensão (o motor resolve sfx/<valor>.mp3)", () => {
    expect(ambientValueFromKey("sfx/amb/hospital.mp3")).toBe("amb/hospital");
    expect(ambientValueFromKey("sfx/amb/road.mp3")).toBe("amb/road");
  });

  it("é tolerante a key já sem prefixo/extensão", () => {
    expect(ambientValueFromKey("amb/hospital")).toBe("amb/hospital");
  });
});
