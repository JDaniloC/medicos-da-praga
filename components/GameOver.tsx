// components/GameOver.tsx
"use client";

export function GameOver({
  title, outcome, onRestart,
}: {
  title: string;
  outcome: string;
  onRestart: () => void;
}) {
  const isDeath = outcome === "gameover";
  return (
    <div className="fade-in mt-6 rounded-lg border border-stone-700 bg-stone-900/60 p-6 text-center">
      <p className={`text-xs uppercase tracking-[0.3em] ${isDeath ? "text-[var(--blood)]" : "text-emerald-400"}`}>
        {isDeath ? "Fim de Jogo" : "Fim do Ato 1"}
      </p>
      <h2 className="mt-2 text-2xl font-bold text-[var(--parchment)]">{title}</h2>
      <button
        onClick={onRestart}
        className="mt-6 rounded-lg border border-[var(--parchment)] bg-stone-800 px-6 py-2 font-semibold text-[var(--parchment)] transition hover:bg-stone-700"
      >
        Recomeçar a campanha
      </button>
    </div>
  );
}
