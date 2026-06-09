// lib/builder/media-utils.ts
// Helpers puros de mídia (sem dependência do AWS SDK — usáveis no cliente e em testes).

// Nome de arquivo seguro para key R2: minúsculo, sem acento, snake_case.
export function sanitizeAssetName(name: string): string {
  const out = name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return out || "arquivo";
}

// O motor de áudio resolve `sfx/<valor>.mp3` (lib/audio/engine.ts); o campo ambient
// guarda a key sem o prefixo sfx/ e sem extensão.
export function ambientValueFromKey(key: string): string {
  return key.replace(/^sfx\//, "").replace(/\.(mp3|ogg|wav)$/i, "");
}
