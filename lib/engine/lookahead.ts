// lib/engine/lookahead.ts
// Enumera os futuros imediatos (N+1) de um estado como entradas de narração prontas
// para pré-geração. Puro: não toca em rede e não muta nada — só reusa a engine.
import type { Engine } from "./engine";
import type { GameState } from "./types";
import { traitDef } from "../story/graph";
import type { NarrationInput } from "../gemini/prompts";

// Rótulo da ação de um teste de dado, sem o valor rolado: ele só existe depois da
// rolagem e tornaria a chave do cache impossível de prever. Nada se perde — o
// narrador já é proibido de citar números (regra 2 do NARRATOR_SYSTEM).
// Fonte única: a UI usa esta mesma função ao confirmar a rolagem.
export function diceActionLabel(success: boolean): string {
  return success ? "teve sucesso no teste" : "fracassou no teste";
}

// Monta a entrada de narração de um estado. Usada tanto pela UI quanto pela
// pré-geração, para que as duas produzam exatamente o mesmo prompt.
export function narrationInputFor(
  engine: Engine,
  state: GameState,
  lastAction?: string
): NarrationInput {
  const td = traitDef(engine.graph, state.trait);
  return {
    brief: engine.getNarration(state),
    worldContext: engine.graph.worldContext,
    traitNome: td.nome,
    traitDescricao: td.descricao,
    inventory: state.inventory,
    inventoryLabels: engine.graph.items,
    lastAction,
    isDice: engine.getNode(state).kind === "dice",
  };
}

// Todos os futuros imediatos do estado. Finais devolvem lista vazia: é o que impede
// a pré-geração de descer a árvore inteira da história.
export function nextNarrationInputs(engine: Engine, state: GameState): NarrationInput[] {
  const node = engine.getNode(state);

  if (node.kind === "scene") {
    return engine
      .getChoices(state)
      .map((c) => narrationInputFor(engine, engine.chooseOption(state, c.id), c.label));
  }

  if (node.kind === "dice") {
    // clampDifficulty trava a dificuldade em 2..20, então 20 sempre passa e 1 sempre
    // falha — os dois ramos possíveis, sem depender do valor que o jogador vai tirar.
    return [20, 1].map((roll) => {
      const outcome = engine.applyDiceRoll(state, roll);
      return narrationInputFor(engine, outcome.state, diceActionLabel(outcome.success));
    });
  }

  return [];
}
