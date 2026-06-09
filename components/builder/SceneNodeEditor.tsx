// components/builder/SceneNodeEditor.tsx
// Lista ordenável de escolhas de um nó de cena.
"use client";

import type { Choice, SceneNode, StoryAct } from "@/lib/story/schema";
import { moveItem, removeAt, replaceAt } from "@/lib/builder/immutable";
import { Button } from "./ui";
import { ChoiceEditor } from "./ChoiceEditor";

function uniqueChoiceId(node: SceneNode): string {
  const ids = new Set(node.choices.map((c) => c.id));
  if (!ids.has("nova_escolha")) return "nova_escolha";
  let i = 2;
  while (ids.has(`nova_escolha_${i}`)) i += 1;
  return `nova_escolha_${i}`;
}

export function SceneNodeEditor({
  act, node, onChangeNode,
}: {
  act: StoryAct;
  node: SceneNode;
  onChangeNode: (node: SceneNode) => void;
}) {
  const setChoices = (choices: Choice[]) => onChangeNode({ ...node, choices });

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-ink">Escolhas ({node.choices.length})</h3>
      {node.choices.length === 0 && (
        <p className="text-sm text-blood">
          Uma cena sem escolhas é um beco sem saída — adicione ao menos uma.
        </p>
      )}
      {node.choices.map((c, i) => (
        <div key={i} className="rounded-xl border border-edge bg-panel p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="font-mono text-xs font-bold text-ink-soft">
              {String.fromCharCode(65 + i)}. {c.id}
            </p>
            <span className="flex gap-1.5">
              <Button variant="ghost" title="Mover acima" disabled={i === 0}
                onClick={() => setChoices(moveItem(node.choices, i, i - 1))}>
                ↑
              </Button>
              <Button variant="ghost" title="Mover abaixo" disabled={i === node.choices.length - 1}
                onClick={() => setChoices(moveItem(node.choices, i, i + 1))}>
                ↓
              </Button>
              <Button variant="danger" title="Remover escolha"
                onClick={() => setChoices(removeAt(node.choices, i))}>
                ✕
              </Button>
            </span>
          </div>
          <ChoiceEditor value={c} onChange={(next) => setChoices(replaceAt(node.choices, i, next))} act={act} />
        </div>
      ))}
      <Button
        variant="ghost"
        onClick={() =>
          setChoices([...node.choices, { id: uniqueChoiceId(node), label: "", next: "" }])
        }
      >
        + Adicionar escolha
      </Button>
    </div>
  );
}
