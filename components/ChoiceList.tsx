// components/ChoiceList.tsx
"use client";

import type { Choice } from "@/lib/story/schema";
import { playSfx } from "@/lib/audio/engine";

export function ChoiceList({
  choices, onChoose, disabled, loading,
}: {
  choices: Choice[];
  onChoose: (id: string) => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <div className="mt-16 space-y-6 px-2 pb-20">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex w-full items-start gap-4 rounded-xl border border-edge/50 bg-slate-50/50 px-6 py-5 shadow-sm">
            <div className="mt-0.5 h-7 w-7 shrink-0 animate-pulse rounded-full bg-slate-200" />
            <div className="mt-1.5 h-4 w-3/4 animate-pulse rounded-full bg-slate-200" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="mt-16 space-y-6 px-2 pb-20">
      {choices.map((c, idx) => (
        <button
          key={c.id}
          disabled={disabled}
          onMouseEnter={() => playSfx("ui/paper-hover")}
          onClick={() => onChoose(c.id)}
          className="group flex w-full items-start gap-4 rounded-xl border border-edge bg-panel px-6 py-5 text-left text-ink transition-all hover:scale-[1.01] hover:border-accent hover:bg-panel-strong hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 shadow-md"
        >
          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-edge bg-slate-50 font-mono text-sm font-bold text-ink-soft group-hover:border-accent group-hover:text-accent group-hover:bg-white shadow-sm transition-colors">
            {String.fromCharCode(65 + idx)}
          </span>
          <span className="font-semibold leading-relaxed">{c.label}</span>
        </button>
      ))}
    </div>
  );
}
