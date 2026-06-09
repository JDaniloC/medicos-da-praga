// lib/story/graph.ts
import type { StoryAct, StoryNode, TraitDef } from "./schema";

export interface StoryGraph {
  act: number;
  title: string;
  start: string;
  worldContext: string;
  traits: TraitDef[];
  items: Record<string, string>;
  badges: Record<string, string>;
  nodes: Record<string, StoryNode>;
}

export function buildGraph(act: StoryAct): StoryGraph {
  const nodes: Record<string, StoryNode> = {};
  for (const n of act.nodes) {
    if (nodes[n.id]) throw new Error(`Nó duplicado: ${n.id}`);
    nodes[n.id] = n;
  }
  if (!nodes[act.start]) throw new Error(`Nó inicial inexistente: ${act.start}`);
  return {
    act: act.act, title: act.title, start: act.start, worldContext: act.worldContext,
    traits: act.traits, items: act.items ?? {}, badges: act.badges ?? {}, nodes,
  };
}

export function traitDef(graph: StoryGraph, traitId: string): TraitDef {
  const t = graph.traits.find((x) => x.id === traitId);
  if (!t) throw new Error(`Traço desconhecido: ${traitId}`);
  return t;
}
