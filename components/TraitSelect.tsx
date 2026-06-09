// components/TraitSelect.tsx
"use client";

import type { TraitDef } from "@/lib/story/schema";
import { AssetImage } from "./AssetImage";

export function TraitSelect({
  traits, onSelect, disabled,
}: {
  traits: TraitDef[];
  onSelect: (trait: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 fade-in">
      <AssetImage
        path="ui/banner-title.webp"
        className="ink-asset mx-auto mb-2 h-28 w-auto object-contain"
      />
      <h1 className="text-center text-3xl font-bold tracking-wide text-[var(--parchment)]">
        O Cerco de Caffa
      </h1>
      <p className="mt-2 text-center text-sm uppercase tracking-[0.3em] text-stone-400">
        Ato 1 — A Praga da Pradaria Seca
      </p>
      <p className="mx-auto mt-6 max-w-xl text-center text-stone-300">
        Você é um jovem médico de campo, recém-admitido, a caminho do front da guerra entre Anglia e
        Gália. Antes de partir, decida quem você é.
      </p>

      <AssetImage
        path="ui/skull-divider.webp"
        className="ink-asset mx-auto mt-8 h-6 w-auto object-contain opacity-80"
      />

      <h2 className="mt-6 mb-4 text-center text-lg font-semibold text-stone-200">
        Escolha o seu Traço Inicial
      </h2>

      <div className="grid gap-4 sm:grid-cols-2">
        {traits.map((t) => (
          <button
            key={t.id}
            disabled={disabled}
            onClick={() => onSelect(t.id)}
            className="group rounded-lg border border-stone-700 bg-stone-900/60 p-5 text-left transition hover:border-[var(--parchment)] hover:bg-stone-800/80 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="flex items-center gap-3">
              <AssetImage
                path={`ui/traits/${t.id}.webp`}
                className="ink-asset h-12 w-12 shrink-0 object-contain"
              />
              <span className="text-lg font-bold text-[var(--parchment)]">{t.nome}</span>
            </span>
            <span className="mt-2 block text-sm text-stone-300">{t.descricao}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
