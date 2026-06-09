// Cliente de narração via Ollama (servidor local ou hospedado).
// Usado quando LLM_PROVIDER=ollama. A chave (se houver) fica só no servidor.

export const DEFAULT_OLLAMA_URL = "http://localhost:11434";

// Gera a prosa narrativa via Ollama. O system prompt vai como mensagem de sistema.
// `OLLAMA_MODEL` é obrigatório; `OLLAMA_API_KEY` é opcional (Bearer) para endpoints autenticados.
export async function generateNarration(prompt: string, system: string): Promise<string> {
  const base = (process.env.OLLAMA_BASE_URL ?? DEFAULT_OLLAMA_URL).replace(/\/+$/, "");
  const model = process.env.OLLAMA_MODEL;
  if (!model) {
    throw new Error("OLLAMA_MODEL não configurado no ambiente do servidor.");
  }

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (process.env.OLLAMA_API_KEY) {
    headers.Authorization = `Bearer ${process.env.OLLAMA_API_KEY}`;
  }

  const res = await fetch(`${base}/api/chat`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model,
      stream: false,
      messages: [
        { role: "system", content: system },
        { role: "user", content: prompt },
      ],
      options: { temperature: 1.0 },
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Ollama HTTP ${res.status}${detail ? `: ${detail}` : ""}`);
  }
  const json = (await res.json()) as { message?: { content?: string } };
  return json.message?.content?.trim() ?? "";
}
