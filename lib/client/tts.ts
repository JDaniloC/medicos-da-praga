// Cliente de TTS: busca o áudio da narração em /api/tts e cacheia por texto
// (object URL em memória) para não re-sintetizar o mesmo trecho na sessão.
const cache = new Map<string, string>();

export async function fetchSpeechUrl(text: string): Promise<string> {
  const cached = cache.get(text);
  if (cached) return cached;
  const res = await fetch("/api/tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error(`TTS HTTP ${res.status}`);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  cache.set(text, url);
  return url;
}
