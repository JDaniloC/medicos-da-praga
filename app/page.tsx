// app/page.tsx
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createEngine } from "@/lib/engine/engine";
import { buildGraph, traitDef, type StoryGraph } from "@/lib/story/graph";
import type { GameState } from "@/lib/engine/types";
import { fetchStory } from "@/lib/client/story";
import { fetchNarration } from "@/lib/client/api";
import { imageUrl } from "@/lib/images/assets";
import { loadSave, writeSave, clearSave } from "@/lib/storage/save";
import { AssetImage } from "@/components/AssetImage";
import { TraitSelect } from "@/components/TraitSelect";
import { StatusSidebar } from "@/components/StatusSidebar";
import { SceneImage } from "@/components/SceneImage";
import { NarrationPanel } from "@/components/NarrationPanel";
import { ChoiceList } from "@/components/ChoiceList";
import { DiceRoller } from "@/components/DiceRoller";
import { GameOver } from "@/components/GameOver";

export default function Page() {
  const [graph, setGraph] = useState<StoryGraph | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [state, setState] = useState<GameState | null>(null);
  const [narration, setNarration] = useState("");
  const [narrating, setNarrating] = useState(false);
  const [busy, setBusy] = useState(false);
  const [lastRoll, setLastRoll] = useState<{ roll: number; success: boolean } | null>(null);
  const [loaded, setLoaded] = useState(false);

  const engine = useMemo(() => (graph ? createEngine(graph) : null), [graph]);

  // Carrega a história e o save uma vez.
  useEffect(() => {
    let alive = true;
    fetchStory(1)
      .then((act) => {
        if (!alive) return;
        setGraph(buildGraph(act));
        const save = loadSave();
        if (save) {
          setState(save.state);
          setNarration(save.narration ?? "");
        }
        setLoaded(true);
      })
      .catch((e) => { if (alive) { setLoadError(String(e.message ?? e)); setLoaded(true); } });
    return () => { alive = false; };
  }, []);

  const loadContent = useCallback(
    async (s: GameState, lastAction?: string) => {
      if (!engine) return;
      const node = engine.getNode(s);
      const td = traitDef(engine.graph, s.trait);
      setBusy(true);
      setNarrating(true);
      setNarration("");
      const narr = await fetchNarration({
        brief: engine.getNarration(s),
        worldContext: engine.graph.worldContext,
        traitNome: td.nome,
        traitDescricao: td.descricao,
        inventory: s.inventory,
        inventoryLabels: engine.graph.items,
        lastAction,
        isDice: node.kind === "dice",
      });
      setNarration(narr);
      setNarrating(false);
      setBusy(false);
      writeSave({ state: s, narration: narr });
    },
    [engine]
  );

  const selectTrait = useCallback(
    async (trait: string) => {
      if (!engine) return;
      const s = engine.createInitialState(trait);
      setState(s);
      setLastRoll(null);
      await loadContent(s);
    },
    [engine, loadContent]
  );

  const handleChoice = useCallback(
    async (choiceId: string) => {
      if (!engine || !state || busy) return;
      const node = engine.getNode(state);
      const label =
        node.kind === "scene"
          ? engine.getChoices(state).find((c) => c.id === choiceId)?.label
          : undefined;
      const next = engine.chooseOption(state, choiceId);
      setState(next);
      setLastRoll(null);
      await loadContent(next, label);
    },
    [engine, state, busy, loadContent]
  );

  const handleRoll = useCallback(
    async (value: number) => {
      if (!engine || !state || busy) return;
      const outcome = engine.applyDiceRoll(state, value);
      setLastRoll({ roll: outcome.roll, success: outcome.success });
      setState(outcome.state);
      await loadContent(
        outcome.state,
        `rolou ${outcome.roll} no D20 — ${outcome.success ? "sucesso" : "fracasso"}`
      );
    },
    [engine, state, busy, loadContent]
  );

  const restart = useCallback(() => {
    clearSave();
    setState(null);
    setNarration("");
    setLastRoll(null);
  }, []);

  if (!loaded) return null;
  if (loadError) {
    return <main className="mx-auto max-w-xl p-8 text-center text-red-300">Erro ao carregar a história: {loadError}</main>;
  }
  if (!engine) return null;

  if (!state) {
    return (
      <main className="flex-1">
        <TraitSelect traits={engine.graph.traits} onSelect={selectTrait} disabled={busy} />
      </main>
    );
  }

  const node = engine.getNode(state);
  const choices = node.kind === "scene" ? engine.getChoices(state) : [];
  const td = traitDef(engine.graph, state.trait);

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
      <AssetImage
        path="ui/parchment-texture.webp"
        className="pointer-events-none fixed inset-0 -z-10 h-full w-full object-cover opacity-[0.1]"
      />
      <header className="mb-4 flex items-center justify-between border-b border-edge pb-3">
        <h1 className="text-lg font-bold tracking-wide text-accent">{engine.graph.title}</h1>
        <button
          onClick={restart}
          className="rounded border border-edge px-3 py-1 text-xs text-ink-soft transition hover:border-accent hover:text-ink"
        >
          Recomeçar
        </button>
      </header>

      <AssetImage
        path="ui/skull-divider.webp"
        className="ink-asset mx-auto mb-10 w-3/4 h-auto object-contain opacity-85"
      />

      <div className="grid gap-6 md:grid-cols-[260px_1fr]">
        <StatusSidebar
          state={state}
          traitName={td.nome}
          items={engine.graph.items}
          badges={engine.graph.badges}
          portraitSrc={imageUrl(td.portrait)}
        />

        <section>
          <div className="relative aspect-video w-full">
            <div className="absolute inset-[11%]">
              <SceneImage src={imageUrl(node.image)} />
            </div>
            <AssetImage
              path="ui/frame-ornament.webp"
              className="ink-asset pointer-events-none absolute inset-0 z-10 h-full w-full object-fill"
            />
          </div>

          {lastRoll && (
            <div
              className={`mt-4 rounded-md border-2 px-4 py-2 text-center text-sm font-bold ${
                lastRoll.success
                  ? "border-success bg-success/10 text-success"
                  : "border-blood bg-blood/10 text-blood"
              }`}
            >
              🎲 Você tirou {lastRoll.roll} — {lastRoll.success ? "Sucesso" : "Fracasso"}
            </div>
          )}

          <div className="mt-4">
            <NarrationPanel text={narration} loading={narrating} />
          </div>

          {node.kind === "scene" && (
            <ChoiceList choices={choices} onChoose={handleChoice} disabled={busy} />
          )}
          {node.kind === "dice" && (
            <DiceRoller reason={node.reason} onRolled={handleRoll} disabled={busy} />
          )}
          {node.kind === "ending" && (
            <GameOver title={node.title} outcome={node.outcome} onRestart={restart} />
          )}
        </section>
      </div>
    </main>
  );
}
