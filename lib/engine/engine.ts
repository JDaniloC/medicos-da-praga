// lib/engine/engine.ts
import type { GameState } from "./types";
import type { StoryGraph } from "../story/graph";
import { traitDef } from "../story/graph";
import type { StoryNode, Choice } from "../story/schema";
import {
  applyEffects, computeDifficulty, resolveNext, visibleChoices, buildNarration,
} from "../story/interpreter";
import { succeeds, rollD20, type Rng } from "./dice";

export interface DiceOutcome {
  state: GameState; roll: number; difficulty: number; success: boolean;
}

export function createEngine(graph: StoryGraph) {
  function getNode(state: GameState): StoryNode {
    const node = graph.nodes[state.currentNodeId];
    if (!node) throw new Error(`Nó desconhecido: ${state.currentNodeId}`);
    return node;
  }

  function createInitialState(trait: string): GameState {
    return {
      trait,
      inventory: [...traitDef(graph, trait).inventarioInicial],
      currentNodeId: graph.start,
      flags: {}, treatments: {}, patients: {}, rolls: [],
    };
  }

  function getChoices(state: GameState): Choice[] {
    const node = getNode(state);
    return node.kind === "scene" ? visibleChoices(node, state) : [];
  }

  function chooseOption(state: GameState, choiceId: string): GameState {
    const node = getNode(state);
    if (node.kind !== "scene") throw new Error(`O nó atual (${node.id}) não aceita escolhas.`);
    const choice = visibleChoices(node, state).find((c) => c.id === choiceId);
    if (!choice) throw new Error(`Escolha inválida ou indisponível para o estado atual: ${choiceId}`);
    const applied = applyEffects(choice.effects, state);
    return { ...applied, currentNodeId: resolveNext(choice.next, applied) };
  }

  function getDifficulty(state: GameState): number {
    const node = getNode(state);
    if (node.kind !== "dice") throw new Error(`O nó atual (${node.id}) não é um teste de dado.`);
    return computeDifficulty(node.difficulty, state);
  }

  function getReason(state: GameState): string {
    const node = getNode(state);
    if (node.kind !== "dice") throw new Error(`O nó atual (${node.id}) não é um teste de dado.`);
    return node.reason;
  }

  function applyDiceRoll(state: GameState, roll: number): DiceOutcome {
    const node = getNode(state);
    if (node.kind !== "dice") throw new Error(`O nó atual (${node.id}) não é um teste de dado.`);
    const difficulty = computeDifficulty(node.difficulty, state);
    const success = succeeds(roll, difficulty);
    const logged: GameState = {
      ...state, rolls: [...state.rolls, { reason: node.reason, roll, difficulty, success }],
    };
    const branch = success ? node.resolve.onSuccess : node.resolve.onFail;
    const resolved = applyEffects(branch.effects, logged);
    return {
      state: { ...resolved, currentNodeId: resolveNext(branch.goto, resolved) },
      roll, difficulty, success,
    };
  }

  function rollAndApply(state: GameState, rng?: Rng): DiceOutcome {
    return applyDiceRoll(state, rollD20(rng));
  }

  function isEnding(state: GameState): boolean {
    return getNode(state).kind === "ending";
  }

  // Narração final do nó atual (briefing base + trechos condicionais de narrationAppend).
  function getNarration(state: GameState): string {
    return buildNarration(getNode(state), state);
  }

  return {
    graph, getNode, createInitialState, getChoices, chooseOption,
    getDifficulty, getReason, applyDiceRoll, rollAndApply, isEnding, getNarration,
  };
}

export type Engine = ReturnType<typeof createEngine>;
