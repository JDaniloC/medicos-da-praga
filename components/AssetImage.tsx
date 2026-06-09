"use client";

import { useState } from "react";
import { imageUrl } from "@/lib/images/assets";

// <img> para assets estáticos do R2 (ícones, selos, decoração). Degrada com elegância:
// se a base não estiver configurada ou a imagem falhar, renderiza o `fallback` (ou nada).
export function AssetImage({
  path,
  alt = "",
  className,
  fallback = null,
}: {
  path: string;
  alt?: string;
  className?: string;
  fallback?: React.ReactNode;
}) {
  const [failed, setFailed] = useState(false);
  const src = imageUrl(path);
  if (!src || failed) return <>{fallback}</>;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} onError={() => setFailed(true)} className={className} />
  );
}
