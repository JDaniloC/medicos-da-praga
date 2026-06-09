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
    <div className="mt-6 rounded-lg border border-[var(--blood)] bg-stone-900/70 p-5 text-center">
      <p className="text-xs uppercase tracking-widest text-stone-400">Teste de D20</p>
      <p className="mt-1 text-sm text-stone-300">{reason}</p>
      <div className="my-4 flex items-center justify-center">
        <div className={`relative flex h-24 w-24 items-center justify-center ${rolling ? "dice-rolling" : ""}`}>
          <AssetImage
            path="ui/d20.webp"
            className="ink-asset absolute inset-0 h-full w-full object-contain"
            fallback={
              <span className="absolute inset-0 rounded-xl border-2 border-[var(--parchment)] bg-stone-950" />
            }
          />
          <span className="relative text-3xl font-bold text-[var(--parchment)] [text-shadow:0_1px_4px_#000,0_0_8px_#000]">
            {value ?? "?"}
          </span>
        </div>
      </div>
      <button
        onClick={roll}
        disabled={rolling || disabled}
        className="rounded-lg border border-[var(--parchment)] bg-stone-800 px-6 py-2 font-semibold text-[var(--parchment)] transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {rolling ? "Rolando…" : "Rolar D20"}
      </button>
    </div>
  );
}
