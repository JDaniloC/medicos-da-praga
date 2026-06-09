"use client";

import { useState } from "react";
import { rollD20 } from "@/lib/engine/dice";
import { AssetImage } from "./AssetImage";

export function DiceRoller({
  reason,
  onRolled,
  disabled,
}: {
  reason: string;
  onRolled: (value: number) => void;
  disabled?: boolean;
}) {
  const [rolling, setRolling] = useState(false);
  const [value, setValue] = useState<number | null>(null);

  function roll() {
    if (rolling || disabled) return;
    setRolling(true);
    setValue(null);
    // pequena animação de "rolagem" antes de fixar o resultado
    let ticks = 0;
    const interval = setInterval(() => {
      setValue(rollD20());
      ticks += 1;
      if (ticks >= 10) {
        clearInterval(interval);
        const final = rollD20();
        setValue(final);
        setRolling(false);
        onRolled(final);
      }
    }, 60);
  }

  return (
    <div className="mt-6 rounded-lg border-2 border-blood bg-panel p-5 text-center shadow-sm">
      <p className="text-xs font-bold uppercase tracking-widest text-blood">Teste de D20</p>
      <p className="mt-1 text-sm text-ink-soft">{reason}</p>
      <div className="my-4 flex items-center justify-center">
        <div className={`relative flex h-28 w-28 items-center justify-center ${rolling ? "dice-rolling" : ""}`}>
          <AssetImage
            path="ui/d20.webp"
            className="ink-asset absolute inset-0 h-full w-full object-contain"
            fallback={
              <span className="absolute inset-0 rounded-xl border-2 border-accent bg-parchment" />
            }
          />
          <span className="relative text-3xl font-bold text-ink [text-shadow:0_0_6px_var(--parchment),0_0_3px_var(--parchment)]">
            {value ?? "?"}
          </span>
        </div>
      </div>
      <button
        onClick={roll}
        disabled={rolling || disabled}
        className="rounded-lg border-2 border-accent bg-panel px-6 py-2 font-semibold text-accent transition hover:bg-panel-strong disabled:cursor-not-allowed disabled:opacity-50"
      >
        {rolling ? "Rolando…" : "Rolar D20"}
      </button>
    </div>
  );
}
