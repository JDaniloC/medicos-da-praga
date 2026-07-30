import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import type { NarrationInput } from "@/lib/gemini/prompts";
import {
  requestNarration,
  primeNarration,
  peekNarration,
  clearNarrationCache,
} from "./narration-cache";

function input(brief: string): NarrationInput {
  return {
    brief,
    worldContext: "Uma peste avança sobre Caffa.",
    traitNome: "Soldado",
    traitDescricao: "Veterano de fronteira.",
    inventory: [],
  };
}

// Resposta mínima que `fetchNarrationOrThrow` consegue consumir.
function okResponse(text: string) {
  return { ok: true, json: async () => ({ text }) } as unknown as Response;
}

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  clearNarrationCache();
  fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("requestNarration", () => {
  it("reaproveita a chamada em voo quando o mesmo input é pedido duas vezes", async () => {
    let resolveFetch!: (r: Response) => void;
    fetchMock.mockImplementation(() => new Promise<Response>((r) => { resolveFetch = r; }));

    const a = requestNarration(input("cena X"));
    const b = requestNarration(input("cena X"));
    resolveFetch(okResponse("prosa"));

    expect(await a).toBe("prosa");
    expect(await b).toBe("prosa");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("faz uma chamada por input distinto", async () => {
    fetchMock.mockResolvedValue(okResponse("prosa"));

    await requestNarration(input("cena X"));
    await requestNarration(input("cena Y"));

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("propaga a falha e descarta a entrada, permitindo nova tentativa", async () => {
    fetchMock.mockResolvedValueOnce({ ok: false, status: 500 } as unknown as Response);

    await expect(requestNarration(input("cena X"))).rejects.toThrow();

    fetchMock.mockResolvedValueOnce(okResponse("prosa"));
    expect(await requestNarration(input("cena X"))).toBe("prosa");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("trata narração vazia como falha, sem cachear", async () => {
    fetchMock.mockResolvedValueOnce(okResponse("   "));
    await expect(requestNarration(input("cena X"))).rejects.toThrow();
    expect(peekNarration(input("cena X"))).toBeNull();
  });

  it("uma geração órfã que resolve não sobrescreve a entrada válida", async () => {
    let resolveFirst!: (r: Response) => void;
    let resolveSecond!: (r: Response) => void;
    let callCount = 0;

    fetchMock.mockImplementation(() => {
      callCount++;
      if (callCount === 1) return new Promise<Response>((r) => { resolveFirst = r; });
      return new Promise<Response>((r) => { resolveSecond = r; });
    });

    // Primeira chamada, fetch em voo.
    const first = requestNarration(input("cena X"));

    // Limpa o cache.
    clearNarrationCache();

    // Segunda chamada com o mesmo input (chave idêntica).
    const second = requestNarration(input("cena X"));

    // Resolve o segundo (válido) fetch.
    resolveSecond(okResponse("nova"));
    expect(await second).toBe("nova");

    // Resolve o primeiro (órfão) fetch.
    resolveFirst(okResponse("antiga"));
    await first;

    // O cache deve conter "nova", não "antiga".
    expect(peekNarration(input("cena X"))).toBe("nova");
  });

  it("uma geração órfã que falha não deleta a entrada válida", async () => {
    let resolveFirst!: (r: Response) => void;
    let resolveSecond!: (r: Response) => void;
    let callCount = 0;

    fetchMock.mockImplementation(() => {
      callCount++;
      if (callCount === 1) return new Promise<Response>((r) => { resolveFirst = r; });
      return new Promise<Response>((r) => { resolveSecond = r; });
    });

    // Primeira chamada, fetch em voo.
    const first = requestNarration(input("cena X"));

    // Limpa o cache.
    clearNarrationCache();

    // Segunda chamada com o mesmo input (chave idêntica).
    const second = requestNarration(input("cena X"));

    // Resolve o segundo (válido) fetch.
    resolveSecond(okResponse("prosa válida"));
    expect(await second).toBe("prosa válida");

    // Rejeita o primeiro (órfão) fetch.
    resolveFirst({ ok: false, status: 500 } as unknown as Response);
    await expect(first).rejects.toThrow();

    // A entrada válida deve permanecer no cache.
    expect(peekNarration(input("cena X"))).toBe("prosa válida");

    // Nenhuma chamada adicional deve ter acontecido.
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});

describe("peekNarration", () => {
  it("devolve null enquanto pendente e o texto depois de resolver", async () => {
    let resolveFetch!: (r: Response) => void;
    fetchMock.mockImplementation(() => new Promise<Response>((r) => { resolveFetch = r; }));

    const pending = requestNarration(input("cena X"));
    expect(peekNarration(input("cena X"))).toBeNull();

    resolveFetch(okResponse("prosa"));
    await pending;
    expect(peekNarration(input("cena X"))).toBe("prosa");
  });

  it("devolve null para input nunca pedido", () => {
    expect(peekNarration(input("nunca pedida"))).toBeNull();
  });
});

describe("primeNarration", () => {
  it("preenche o cache em segundo plano", async () => {
    fetchMock.mockResolvedValue(okResponse("prosa"));

    primeNarration(input("cena X"));
    await vi.waitFor(() => expect(peekNarration(input("cena X"))).toBe("prosa"));
  });

  it("não rejeita quando a geração falha", async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 500 } as unknown as Response);

    primeNarration(input("cena X"));
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(peekNarration(input("cena X"))).toBeNull();
  });
});

describe("clearNarrationCache", () => {
  it("esvazia o cache e força nova geração", async () => {
    fetchMock.mockResolvedValue(okResponse("prosa"));
    await requestNarration(input("cena X"));

    clearNarrationCache();

    expect(peekNarration(input("cena X"))).toBeNull();
    await requestNarration(input("cena X"));
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
