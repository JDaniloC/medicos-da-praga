// components/TraitSelect.tsx
"use client";

import type { TraitDef } from "@/lib/story/schema";

export function TraitSelect({
  traits, onSelect, disabled,
}: {
  traits: TraitDef[];
  onSelect: (trait: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 fade-in">
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

      <h2 className="mt-10 mb-4 text-center text-lg font-semibold text-stone-200">
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
            <span className="block text-lg font-bold text-[var(--parchment)]">{t.nome}</span>
            <span className="mt-2 block text-sm text-stone-300">{t.descricao}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
