// components/CharacterPortrait.tsx
"use client";

import { useState } from "react";

export function CharacterPortrait({
  src, traitName,
}: { src?: string; traitName: string }) {
  const [failed, setFailed] = useState(false);
  const show = src && !failed;
  return (
    <div className="overflow-hidden rounded-lg border border-edge bg-panel shadow-sm">
      <div className="relative aspect-[3/4] w-full bg-slate-100">
        {show ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={`Retrato — ${traitName}`}
            onError={() => setFailed(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-400">—</div>
        )}
      </div>
      <div className="px-3 py-2 text-center text-sm font-bold text-accent uppercase tracking-wider">
        {traitName}
      </div>
    </div>
  );
}
