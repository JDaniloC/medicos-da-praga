// components/ChoiceList.tsx
"use client";

import type { Choice } from "@/lib/story/schema";

export function ChoiceList({
  choices, onChoose, disabled,
}: {
  choices: Choice[];
  onChoose: (id: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="mt-6 space-y-3">
      {choices.map((c, idx) => (
        <button
          key={c.id}
          disabled={disabled}
          onClick={() => onChoose(c.id)}
          className="flex w-full items-start gap-3 rounded-lg border border-stone-700 bg-stone-900/60 px-4 py-3 text-left text-stone-100 transition hover:border-[var(--parchment)] hover:bg-stone-800/80 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className="mt-0.5 font-mono text-sm text-[var(--parchment)]">
            {String.fromCharCode(65 + idx)}
          </span>
          <span>{c.label}</span>
        </button>
      ))}
    </div>
  );
}
