// components/StatusSidebar.tsx
"use client";

import type { GameState } from "@/lib/engine/types";
import { CharacterPortrait } from "./CharacterPortrait";

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

      <div className="rounded-lg border border-stone-700 bg-stone-900/60 p-4">
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-widest text-stone-400">
          Inventário
        </h3>
        {state.inventory.length === 0 ? (
          <p className="text-sm text-stone-500">Vazio</p>
        ) : (
          <ul className="space-y-1 text-sm text-stone-200">
            {state.inventory.map((i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="text-[var(--parchment)]">◆</span>
                {items[i] ?? i}
              </li>
            ))}
          </ul>
        )}
      </div>

      {activeBadges.map(([flag, label]) => (
        <div key={flag} className="rounded-lg border border-emerald-800 bg-emerald-950/40 p-3 text-sm text-emerald-300">
          Traço adquirido: <strong>{label}</strong>
        </div>
      ))}
    </aside>
  );
}
