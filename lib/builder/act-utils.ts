// lib/builder/act-utils.ts
// Operações estruturais sobre o ato: renomear nó propagando referências,
// contagem de referências, templates de nó novo e duplicação.
import type { Next, StoryAct, StoryNode } from "@/lib/story/schema";

function mapNext(next: Next, fn: (target: string) => string): Next {
  if (typeof next === "string") return fn(next);
  return next.map((r) => ({
    ...r,
    ...(r.goto !== undefined ? { goto: fn(r.goto) } : {}),
    ...(r.default !== undefined ? { default: fn(r.default) } : {}),
  }));
}

function mapNodeTargets(node: StoryNode, fn: (target: string) => string): StoryNode {
  if (node.kind === "scene") {
    return { ...node, choices: node.choices.map((c) => ({ ...c, next: mapNext(c.next, fn) })) };
  }
  if (node.kind === "dice") {
    return {
      ...node,
      resolve: {
        onSuccess: { ...node.resolve.onSuccess, goto: mapNext(node.resolve.onSuccess.goto, fn) },
        onFail: { ...node.resolve.onFail, goto: mapNext(node.resolve.onFail.goto, fn) },
      },
    };
  }
  return node;
}

export function countReferences(act: StoryAct, nodeId: string): number {
  let count = act.start === nodeId ? 1 : 0;
  const tally = (target: string) => {
    if (target === nodeId) count += 1;
    return target;
  };
  for (const n of act.nodes) mapNodeTargets(n, tally);
  return count;
}

export function renameNodeId(act: StoryAct, oldId: string, newId: string): StoryAct {
  const swap = (target: string) => (target === oldId ? newId : target);
  return {
    ...act,
    start: swap(act.start),
    nodes: act.nodes.map((n) =>
      mapNodeTargets(n.id === oldId ? { ...n, id: newId } : n, swap)
    ),
  };
}

export type NodeKind = StoryNode["kind"];

export function newNode(kind: NodeKind, id: string): StoryNode {
  const base = { id, image: "", narration: "" };
  switch (kind) {
    case "scene":
      return { ...base, kind: "scene", choices: [] };
    case "dice":
      return {
        ...base,
        kind: "dice",
        reason: "",
        difficulty: { base: 10 },
        resolve: { onSuccess: { goto: "" }, onFail: { goto: "" } },
      };
    case "ending":
      return { ...base, kind: "ending", outcome: "", title: "" };
  }
}

export function uniqueNodeId(act: StoryAct, base: string): string {
  const ids = new Set(act.nodes.map((n) => n.id));
  if (!ids.has(base)) return base;
  let i = 2;
  while (ids.has(`${base}_${i}`)) i += 1;
  return `${base}_${i}`;
}

export function duplicateNode(act: StoryAct, node: StoryNode): StoryNode {
  return { ...structuredClone(node), id: uniqueNodeId(act, node.id) };
}
