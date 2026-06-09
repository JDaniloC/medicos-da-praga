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

      <div className="rounded-lg border border-edge bg-panel p-4 shadow-sm">
        <h3 className="mb-2 text-xs font-bold uppercase tracking-widest text-ink-soft">
          Inventário
        </h3>
        {state.inventory.length === 0 ? (
          <p className="text-sm text-ink-soft italic opacity-60">Vazio</p>
        ) : (
          <ul className="space-y-2 text-sm text-ink font-medium">
            {state.inventory.map((i) => (
              <li key={i} className="flex items-center gap-2">
                <AssetImage
                  path={`ui/icons/${i}.webp`}
                  className="ink-asset h-7 w-7 shrink-0 object-contain"
                  fallback={<span className="w-7 text-center text-accent">◆</span>}
                />
                {items[i] ?? i}
              </li>
            ))}
          </ul>
        )}
      </div>

      {activeBadges.map(([flag, label]) => (
        <div
          key={flag}
          className="flex items-center gap-2 rounded-lg border-2 border-success bg-success/5 p-3 text-sm text-success font-bold"
        >
          <AssetImage 
            path={`ui/icons/${flag}.webp`} 
            className="ink-asset h-8 w-8 shrink-0 object-contain" 
          />
          <span>
            Traço adquirido: <strong>{label}</strong>
          </span>
        </div>
      ))}
    </aside>
  );
}
