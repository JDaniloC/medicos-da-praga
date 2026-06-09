"use client";

import { useState } from "react";
import { rollD20 } from "@/lib/engine/dice";
import { AssetImage } from "./AssetImage";
import { playSfx } from "@/lib/audio/engine";

export function DiceRoller({
  reason,
  onRolled,
  disabled,
  result,
  onConfirm,
}: {
  reason: string;
  onRolled: (value: number) => void;
  disabled?: boolean;
  result?: { roll: number; success: boolean } | null;
  onConfirm?: () => void;
}) {
  const [rolling, setRolling] = useState(false);
  const [value, setValue] = useState<number | null>(null);

  function roll() {
    if (rolling || disabled || result) return;
    playSfx("ui/dice-roll");
    setRolling(true);
    setValue(null);
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
    <div className={`mt-10 rounded-xl border-2 p-8 text-center transition-all duration-500 shadow-md ${
      result 
        ? (result.success ? "border-emerald-800 bg-emerald-50/50" : "border-red-900 bg-red-50/50")
        : "border-edge bg-panel"
    }`}>
      <p className={`text-xs font-bold uppercase tracking-[0.3em] ${
        result 
          ? (result.success ? "text-emerald-700" : "text-red-800")
          : "text-ink-soft opacity-60"
      }`}>
        {result ? "O Destino Decidiu" : "Teste de Habilidade"}
      </p>
      
      <p className={`mt-2 text-lg font-semibold italic ${result ? "text-ink opacity-40" : "text-ink"}`}>
        {reason}
      </p>

      <div className="my-8 flex flex-col items-center justify-center gap-6">
        <div className={`relative flex h-32 w-32 items-center justify-center transition-transform ${rolling ? "dice-rolling scale-110" : "scale-100"}`}>
          <AssetImage
            path="ui/d20.webp"
            className={`ink-asset absolute inset-0 h-full w-full object-contain transition-opacity ${result ? "opacity-20" : "opacity-100"}`}
            fallback={
              <span className="absolute inset-0 rounded-xl border-2 border-edge bg-slate-100" />
            }
          />
          <span className={`relative text-5xl font-black transition-all ${
            result 
              ? (result.success ? "text-emerald-600 scale-125" : "text-red-700 scale-125")
              : "text-ink"
          }`}>
            {result ? result.roll : (value ?? "?")}
          </span>
        </div>

        {result && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-500 text-center">
            <h2 className={`text-3xl font-black uppercase tracking-tighter ${result.success ? "text-emerald-700" : "text-red-800"}`}>
              {result.success ? "Vitória" : "Derrota"}
            </h2>
          </div>
        )}
      </div>

      {!result ? (
        <button
          onClick={roll}
          disabled={rolling || disabled}
          className="w-full max-w-xs rounded-lg border-2 border-accent bg-panel px-8 py-3 text-lg font-bold text-accent transition-all hover:scale-105 hover:bg-panel-strong active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {rolling ? "Rolando…" : "Rolar D20"}
        </button>
      ) : (
        <button
          onClick={onConfirm}
          className={`w-full max-w-xs rounded-lg border-2 px-8 py-3 text-lg font-bold uppercase tracking-widest transition-all hover:scale-105 active:scale-95 ${
            result.success 
              ? "border-emerald-700 bg-emerald-800 text-white hover:bg-emerald-700 shadow-[0_0_15px_rgba(16,185,129,0.3)]" 
              : "border-red-900 bg-red-900 text-white hover:bg-red-800 shadow-[0_0_15px_rgba(185,28,28,0.3)]"
          }`}
        >
          Seguir adiante
        </button>
      )}
    </div>
  );
}
