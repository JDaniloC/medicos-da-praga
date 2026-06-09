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
    <div className="mt-8 space-y-3">
      {choices.map((c, idx) => (
        <button
          key={c.id}
          disabled={disabled}
          onClick={() => onChoose(c.id)}
          className="group flex w-full items-start gap-4 rounded-lg border border-edge bg-panel px-5 py-4 text-left text-ink transition hover:border-accent hover:bg-panel-strong disabled:cursor-not-allowed disabled:opacity-50 shadow-sm"
        >
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-edge font-mono text-sm font-bold text-ink-soft group-hover:border-accent group-hover:text-accent">
            {String.fromCharCode(65 + idx)}
          </span>
          <span className="font-semibold leading-relaxed">{c.label}</span>
        </button>
      ))}
    </div>
  );
}
