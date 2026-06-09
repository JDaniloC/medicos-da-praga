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
      <h1 className="text-center text-3xl font-bold tracking-wide text-ink">
        O Cerco de Caffa
      </h1>
      <p className="mt-2 text-center text-sm uppercase tracking-[0.3em] text-ink-soft">
        Ato 1 — A Praga da Pradaria Seca
      </p>
      <p className="mx-auto mt-6 max-w-xl text-center text-ink font-medium">
        Você é um jovem médico de campo, recém-admitido, a caminho do front da guerra entre Anglia e
        Gália. Antes de partir, decida quem você é.
      </p>

      <AssetImage
        path="ui/skull-divider.webp"
        className="ink-asset mx-auto mt-12 mb-4 w-4/5 h-auto object-contain opacity-95"
      />

      <h2 className="mt-6 mb-6 text-center text-xl font-bold text-accent uppercase tracking-wider">
        Escolha o seu Traço Inicial
      </h2>

      <div className="grid gap-6 sm:grid-cols-2">
        {traits.map((t) => (
          <button
            key={t.id}
            disabled={disabled}
            onClick={() => onSelect(t.id)}
            className="group relative overflow-hidden rounded-xl border border-edge bg-panel p-8 text-center transition-all hover:scale-[1.02] hover:border-accent hover:bg-panel-strong hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
          >
            <div className="flex flex-col items-center">
              <div className="relative h-32 w-32 shrink-0 mb-3 transition-transform group-hover:rotate-3 group-hover:scale-110">
                <AssetImage
                  path={`ui/traits/${t.id}.webp`}
                  className="ink-asset h-full w-full object-contain"
                />
              </div>
              <span className="text-2xl font-black text-ink block mb-1 group-hover:text-accent transition-colors leading-tight">
                {t.nome}
              </span>
              <span className="block text-sm leading-relaxed text-ink-soft font-medium px-2">
                {t.descricao}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
