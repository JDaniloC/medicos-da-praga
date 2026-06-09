// components/SceneImage.tsx
"use client";

import { useState } from "react";

export function SceneImage({ src, loading }: { src?: string; loading?: boolean }) {
  const [failed, setFailed] = useState(false);
  const show = src && !failed;
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-md border-2 border-edge bg-panel shadow-sm">
      {show ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt="Cena"
          onError={() => setFailed(true)}
          className="fade-in h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <span className="animate-pulse text-sm text-ink-soft">
            {loading ? "Carregando a cena…" : "Sem imagem"}
          </span>
        </div>
      )}
    </div>
  );
}
