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
import { AudioToggle } from "@/components/AudioToggle";
import { setAmbient, playSfx, playMusic } from "@/lib/audio/engine";

export default function Page() {
  const [graph, setGraph] = useState<StoryGraph | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [state, setState] = useState<GameState | null>(null);
  const [narration, setNarration] = useState("");
  const [narrating, setNarrating] = useState(false);
  const [busy, setBusy] = useState(false);
  const [lastRoll, setLastRoll] = useState<{ roll: number; success: boolean; nextState?: GameState } | null>(null);
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
        } else {
          // Se não houver save, toca a música tema de abertura
          playMusic("title-theme");
        }
        setLoaded(true);
      })
      .catch((e) => {
        if (alive) {
          setLoadError(String(e.message ?? e));
          setLoaded(true);
        }
      });
    return () => {
      alive = false;
    };
  }, []);

  const loadContent = useCallback(
    async (s: GameState, lastAction?: string) => {
      if (!engine || !s) return;
      const node = engine.getNode(s);
      const td = traitDef(engine.graph, s.trait);
      
      // Áudio ambiente da cena
      if (node.kind === "ending") {
        setAmbient(null);
        const death = node.outcome === "gameover";
        playSfx(death ? "ui/game-over" : "ui/ending-survive");
        playMusic(death ? "death-theme" : "triumph-theme");
      } else {
        setAmbient(node.ambient ?? null);
        
        // Stingers de Evento baseados no ID da cena
        const nodeId = s.currentNodeId || "";
        if (nodeId === "ramb_combate") playSfx("event/combat");
        if (nodeId === "rama_intro") playSfx("event/catapult");
        if (nodeId && nodeId.startsWith("cena4") && nodeId.endsWith("_dado")) {
          playSfx("event/surgery");
        }
      }
      
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
      playSfx("ui/trait-select");
      const s = engine.createInitialState(trait);
      setState(s);
      setLastRoll(null);
      await loadContent(s);
    },
    [engine, loadContent]
  );

  const confirmRoll = useCallback(async () => {
    if (!lastRoll?.nextState) return;
    const next = lastRoll.nextState;
    const rollDesc = `rolou ${lastRoll.roll} no D20 — ${lastRoll.success ? "sucesso" : "fracasso"}`;
    playSfx("ui/scene-transition");
    if (state && next.inventory.length > state.inventory.length) playSfx("ui/item-get");
    setLastRoll(null);
    setState(next);
    await loadContent(next, rollDesc);
  }, [lastRoll, loadContent, state]);

  const handleChoice = useCallback(
    async (choiceId: string) => {
      if (!engine || !state || busy) return;
      const node = engine.getNode(state);
      const label =
        node.kind === "scene"
          ? engine.getChoices(state).find((c) => c.id === choiceId)?.label
          : undefined;
      const next = engine.chooseOption(state, choiceId);
      playSfx("ui/choice-select");
      if (next.inventory.length > state.inventory.length) playSfx("ui/item-get");
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
      playSfx(outcome.success ? "ui/dice-success" : "ui/dice-failure");
      setLastRoll({ roll: outcome.roll, success: outcome.success, nextState: outcome.state });
    },
    [engine, state, busy]
  );

  const restart = useCallback(() => {
    clearSave();
    setAmbient(null);
    setState(null);
    setNarration("");
    setLastRoll(null);
  }, []);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!loaded) return null;
  if (loadError) {
    return (
      <main className="mx-auto max-w-xl p-8 text-center text-red-300">
        Erro ao carregar a história: {loadError}
      </main>
    );
  }
  if (!engine) return null;

  if (!state) {
    return (
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 pt-24 pb-32">
        <AssetImage
          path="ui/parchment-texture.webp"
          className="pointer-events-none fixed inset-0 -z-10 h-full w-full scale-[1.05] object-cover opacity-[0.08] mix-blend-multiply"
        />
        <TraitSelect traits={engine.graph.traits} onSelect={selectTrait} disabled={busy} />
      </main>
    );
  }

  const node = engine.getNode(state);
  const choices = node.kind === "scene" ? engine.getChoices(state) : [];
  const td = traitDef(engine.graph, state.trait);

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 pt-24 pb-32">
      <AssetImage
        path="ui/parchment-texture.webp"
        className="pointer-events-none fixed inset-0 -z-10 h-full w-full scale-[1.05] object-cover opacity-[0.08] mix-blend-multiply"
      />
      <header className="fixed top-0 left-0 right-0 z-40 border-b border-edge bg-background/80 backdrop-blur-sm px-4 py-3">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-edge bg-panel transition-colors hover:bg-panel-strong md:hidden"
              onClick={() => {
                playSfx("ui/click-soft");
                setSidebarOpen(true);
              }}
              aria-label="Ver Personagem"
            >
              <div className="space-y-1">
                <div className="h-0.5 w-5 bg-ink"></div>
                <div className="h-0.5 w-5 bg-ink"></div>
                <div className="h-0.5 w-5 bg-ink"></div>
              </div>
            </button>
            <h1 className="text-lg font-bold tracking-wide text-accent">{engine.graph.title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <AudioToggle />
            <button
              onClick={() => {
                playSfx("ui/click-soft");
                restart();
              }}
              className="rounded border border-edge bg-panel px-3 py-1 text-xs text-ink-soft transition hover:border-accent hover:text-ink"
            >
              Recomeçar
            </button>
          </div>
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-[260px_1fr]">
        <div
          className={`fixed inset-0 z-50 transition-all md:relative md:inset-auto md:z-0 md:block ${
            sidebarOpen ? "visible opacity-100" : "invisible opacity-0 md:visible md:opacity-100"
          }`}
        >
          <div
            className="absolute inset-0 bg-black/40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <div
            className={`absolute left-0 h-full w-[280px] overflow-y-auto bg-background p-6 transition-transform md:h-auto md:w-full md:translate-x-0 md:bg-transparent md:p-0 ${
              sidebarOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <div className="mb-6 flex items-center justify-between md:hidden">
              <h2 className="text-xl font-bold text-accent">Status</h2>
              <button onClick={() => setSidebarOpen(false)} className="text-2xl text-ink">
                ✕
              </button>
            </div>
            <StatusSidebar
              state={state}
              traitName={td.nome}
              items={engine.graph.items}
              badges={engine.graph.badges}
              portraitSrc={imageUrl(td.portrait)}
            />
          </div>
        </div>

        <section>
          <div className="relative overflow-hidden rounded-xl border border-edge/20 shadow-sm bg-white mb-10">
            <div className="scale-[1.5] transition-transform duration-700 grayscale-[0.3] brightness-[1.05] contrast-[1.1]">
              <SceneImage src={imageUrl(node.image)} />
            </div>
          </div>

          <div className="mt-4">
            <NarrationPanel text={narration} loading={narrating} />
          </div>

          {node.kind === "scene" && (
            <ChoiceList
              choices={choices}
              onChoose={handleChoice}
              disabled={busy}
              loading={narrating}
            />
          )}
          {node.kind === "dice" && (
            <DiceRoller
              reason={node.reason}
              onRolled={handleRoll}
              disabled={busy}
              result={lastRoll}
              onConfirm={confirmRoll}
            />
          )}
          {node.kind === "ending" && (
            <GameOver title={node.title} outcome={node.outcome} onRestart={restart} />
          )}
        </section>
      </div>
    </main>
  );
}
