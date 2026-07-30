// components/StoryLoading.tsx
"use client";

import { AssetImage } from "./AssetImage";
import { SceneImage } from "./SceneImage";
import { CharacterPortrait } from "./CharacterPortrait";

// Tela cheia das duas únicas esperas que sobram: abrir a crônica (busca da história)
// e a primeira narração da partida. As transições seguintes usam os skeletons, que
// preservam o contexto da cena.
export function StoryLoading({
  sceneSrc,
  portraitSrc,
  traitName,
  message = "escrevendo a crônica",
}: {
  sceneSrc?: string;
  portraitSrc?: string;
  traitName?: string;
  message?: string;
}) {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-4 py-16">
      <AssetImage
        path="ui/parchment-texture.webp"
        className="pointer-events-none fixed inset-0 -z-10 h-full w-full scale-[1.05] object-cover opacity-[0.08] mix-blend-multiply"
      />

      {sceneSrc !== undefined && (
        <div className="mb-8 w-full overflow-hidden rounded-xl border border-edge/20 bg-white shadow-sm">
          <SceneImage src={sceneSrc} loading />
        </div>
      )}

      {traitName && (
        <div className="mb-8 w-32">
          <CharacterPortrait src={portraitSrc} traitName={traitName} />
        </div>
      )}

      <p
        role="status"
        aria-live="polite"
        className="flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-ink-soft"
      >
        <span className="flex gap-1">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent [animation-delay:200ms]" />
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent [animation-delay:400ms]" />
        </span>
        {message}
      </p>
    </main>
  );
}
