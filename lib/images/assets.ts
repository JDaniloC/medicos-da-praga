// lib/images/assets.ts
const BASE = process.env.NEXT_PUBLIC_R2_BASE_URL ?? "";

// Monta a URL pública da imagem estática a partir do caminho (ex.: "scenes/cena1.webp" ou "debriefing/war.png").
// Se R2 não estiver configurado, faz fallback para a pasta estática local (/images/...).
export function imageUrl(path: string): string {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;

  // Remove barra inicial e o prefixo "images/" se presente (ex.: "/images/debriefing/war.png" -> "debriefing/war.png")
  const cleanPath = path.replace(/^\//, "").replace(/^images\//, "");

  if (!BASE) {
    return `/images/${cleanPath}`;
  }

  return `${BASE.replace(/\/$/, "")}/${cleanPath}`;
}

