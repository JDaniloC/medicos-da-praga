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
    <div className="fade-in mt-6 rounded-lg border-2 border-edge bg-panel p-6 text-center shadow-sm">
      <p className={`text-xs font-bold uppercase tracking-[0.3em] ${isDeath ? "text-blood" : "text-success"}`}>
        {isDeath ? "Fim de Jogo" : "Fim do Ato 1"}
      </p>
      <h2 className="mt-2 text-2xl font-bold text-accent">{title}</h2>
      <button
        onClick={onRestart}
        className="mt-6 rounded-lg border-2 border-accent bg-panel px-6 py-2 font-semibold text-accent transition hover:bg-panel-strong"
      >
        Recomeçar a campanha
      </button>
    </div>
  );
}
