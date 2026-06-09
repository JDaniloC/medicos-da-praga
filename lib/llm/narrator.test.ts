import { describe, it, expect, afterEach } from "vitest";
import { activeProvider } from "./narrator";

const original = process.env.LLM_PROVIDER;
afterEach(() => {
  if (original === undefined) delete process.env.LLM_PROVIDER;
  else process.env.LLM_PROVIDER = original;
});

describe("activeProvider", () => {
  it("padrão é gemini quando LLM_PROVIDER não está definido", () => {
    delete process.env.LLM_PROVIDER;
    expect(activeProvider()).toBe("gemini");
  });
  it("usa ollama quando LLM_PROVIDER=ollama (case-insensitive, com espaços)", () => {
    process.env.LLM_PROVIDER = "  OLLAMA ";
    expect(activeProvider()).toBe("ollama");
  });
  it("valor desconhecido cai em gemini", () => {
    process.env.LLM_PROVIDER = "foo";
    expect(activeProvider()).toBe("gemini");
  });
});
