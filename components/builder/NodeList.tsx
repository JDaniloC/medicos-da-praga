// components/builder/NodeList.tsx
// Sidebar de nós: busca, seleção, criar (escolhendo o kind), duplicar e excluir.
"use client";

import { useState } from "react";
import type { StoryAct, StoryNode } from "@/lib/story/schema";
import { duplicateNode, newNode, uniqueNodeId, type NodeKind } from "@/lib/builder/act-utils";
import { Badge, ConfirmDialog, TextInput } from "./ui";

const KIND_LABEL: Record<NodeKind, string> = { scene: "Cena", dice: "Dado", ending: "Final" };
const KIND_TONE: Record<NodeKind, "neutral" | "accent" | "success"> = {
  scene: "neutral", dice: "accent", ending: "success",
};

export function NodeList({
  act, selectedId, errorCounts, onSelect, onChange,
}: {
  act: StoryAct;
  selectedId: string | null;
  errorCounts: Map<string, number>;
  onSelect: (id: string) => void;
  onChange: (act: StoryAct) => void;
}) {
  const [query, setQuery] = useState("");
  const [toDelete, setToDelete] = useState<StoryNode | null>(null);

  const visible = act.nodes.filter((n) =>
    n.id.toLowerCase().includes(query.trim().toLowerCase())
  );

  const addNode = (kind: NodeKind) => {
    const id = uniqueNodeId(act, `novo_${KIND_LABEL[kind].toLowerCase()}`);
    onChange({ ...act, nodes: [...act.nodes, newNode(kind, id)] });
    onSelect(id);
  };

  const duplicate = (node: StoryNode) => {
    const copy = duplicateNode(act, node);
    const at = act.nodes.findIndex((n) => n.id === node.id);
    const nodes = [...act.nodes.slice(0, at + 1), copy, ...act.nodes.slice(at + 1)];
    onChange({ ...act, nodes });
    onSelect(copy.id);
  };

  const remove = (node: StoryNode) => {
    onChange({ ...act, nodes: act.nodes.filter((n) => n.id !== node.id) });
    setToDelete(null);
  };

  return (
    <div>
      <div className="px-1 pb-2">
        <TextInput
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar nó…"
        />
      </div>
      <ul className="space-y-0.5">
        {visible.map((n) => {
          const errors = errorCounts.get(n.id) ?? 0;
          const active = n.id === selectedId;
          return (
            <li key={n.id} className="group relative">
              <button
                onClick={() => onSelect(n.id)}
                className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition-colors ${
                  active ? "bg-accent text-white" : "text-ink hover:bg-panel"
                }`}
              >
                <Badge tone={KIND_TONE[n.kind]}>{KIND_LABEL[n.kind]}</Badge>
                <span className="min-w-0 flex-1 truncate font-mono text-xs">{n.id}</span>
                {errors > 0 && <Badge tone="danger">{errors}</Badge>}
                {act.start === n.id && <span title="Nó inicial">★</span>}
              </button>
              <span className="absolute right-1 top-1/2 hidden -translate-y-1/2 gap-1 group-hover:flex">
                <button
                  title="Duplicar nó"
                  onClick={() => duplicate(n)}
                  className="rounded border border-edge bg-panel px-1 text-xs text-ink-soft hover:text-ink"
                >
                  ⧉
                </button>
                <button
                  title="Excluir nó"
                  onClick={() => setToDelete(n)}
                  className="rounded border border-edge bg-panel px-1 text-xs text-blood"
                >
                  ✕
                </button>
              </span>
            </li>
          );
        })}
        {visible.length === 0 && (
          <li className="px-2 py-1 text-xs text-ink-soft">Nenhum nó encontrado.</li>
        )}
      </ul>
      <div className="mt-3 flex gap-1 px-1">
        {(Object.keys(KIND_LABEL) as NodeKind[]).map((kind) => (
          <button
            key={kind}
            onClick={() => addNode(kind)}
            className="flex-1 rounded-lg border border-edge bg-panel px-2 py-1.5 text-xs font-semibold text-ink transition-colors hover:border-accent"
            title={`Adicionar nó do tipo ${KIND_LABEL[kind]}`}
          >
            + {KIND_LABEL[kind]}
          </button>
        ))}
      </div>
      <ConfirmDialog
        open={toDelete !== null}
        title="Excluir nó"
        message={`Excluir o nó "${toDelete?.id}"? Referências a ele ficarão órfãs e bloquearão o salvamento até serem corrigidas.`}
        confirmLabel="Excluir"
        onConfirm={() => toDelete && remove(toDelete)}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
