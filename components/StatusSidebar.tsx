// components/StatusSidebar.tsx
"use client";

import type { GameState } from "@/lib/engine/types";
import { CharacterPortrait } from "./CharacterPortrait";
import { AssetImage } from "./AssetImage";

export function StatusSidebar({
  state, traitName, items, badges, portraitSrc,
}: {
  state: GameState;
  traitName: string;
  items: Record<string, string>;
  badges: Record<string, string>;
  portraitSrc?: string;
}) {
  const activeBadges = Object.entries(badges).filter(([flag]) => state.flags[flag]);
  return (
    <aside className="space-y-4">
      <CharacterPortrait src={portraitSrc} traitName={traitName} />

      <div className="space-y-3">
        <h3 className="px-1 text-xs font-bold uppercase tracking-widest text-ink-soft">
          Inventário
        </h3>
        {state.inventory.length === 0 ? (
          <div className="rounded-lg border border-edge bg-panel p-6 text-center shadow-sm">
            <p className="text-sm text-ink-soft italic opacity-60">Vazio</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {state.inventory.map((i) => (
              <div key={i} className="flex flex-col items-center rounded-xl border border-edge bg-panel p-6 text-center shadow-sm">
                <AssetImage
                  path={`ui/icons/${i}.webp`}
                  className="ink-asset h-20 w-20 shrink-0 object-contain mb-3"
                  fallback={<span className="text-2xl text-accent mb-3">◆</span>}
                />
                <span className="text-base font-bold text-ink leading-tight">
                  {items[i] ?? i}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {activeBadges.map(([flag, label]) => (
        <div
          key={flag}
          className="flex flex-col items-center rounded-xl border-2 border-success bg-success/5 p-6 text-center shadow-sm"
        >
          <AssetImage 
            path={`ui/icons/${flag}.webp`} 
            className="ink-asset h-20 w-20 shrink-0 object-contain mb-3" 
          />
          <span className="text-sm font-bold text-success uppercase tracking-wide">
            Traço adquirido
          </span>
          <span className="text-lg font-black text-success leading-tight">
            {label}
          </span>
        </div>
      ))}
    </aside>
  );
}
