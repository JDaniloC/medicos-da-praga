// lib/images/assets.ts
const BASE = process.env.NEXT_PUBLIC_R2_BASE_URL ?? "";

// Monta a URL pública da imagem estática a partir do caminho (ex.: "scenes/cena1.webp").
// Retorna "" se a base não estiver configurada (UI mostra placeholder).
export function imageUrl(path: string): string {
  if (!BASE || !path) return "";
  return `${BASE.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}
