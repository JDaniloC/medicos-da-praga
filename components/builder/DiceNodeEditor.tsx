// components/builder/DiceNodeEditor.tsx
// Nó de teste de dado: motivo, dificuldade (base + regras) e resoluções.
"use client";

import type { DiceNode, StoryAct } from "@/lib/story/schema";
import { Field, NumberInput, TextInput } from "./ui";
import { DifficultyRulesEditor } from "./DifficultyRulesEditor";
import { ResolutionEditor } from "./ResolutionEditor";

export function DiceNodeEditor({
  act, node, onChangeNode,
}: {
  act: StoryAct;
  node: DiceNode;
  onChangeNode: (node: DiceNode) => void;
}) {
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nome do teste" hint="Exibido ao jogador (ex.: Tratamento do Lanceiro).">
          <TextInput
            value={node.reason}
            onChange={(e) => onChangeNode({ ...node, reason: e.target.value })}
          />
        </Field>
        <Field label="Dificuldade base" hint="Alvo do d20 antes das regras (limitado a 2–20 no jogo).">
          <NumberInput
            value={node.difficulty.base}
            min={2}
            max={20}
            onChange={(base) =>
              onChangeNode({ ...node, difficulty: { ...node.difficulty, base } })
            }
          />
        </Field>
      </div>
      <DifficultyRulesEditor
        act={act}
        value={node.difficulty.rules}
        onChange={(rules) => onChangeNode({ ...node, difficulty: { ...node.difficulty, rules } })}
      />
      <ResolutionEditor
        act={act}
        title="✓ Em caso de sucesso"
        value={node.resolve.onSuccess}
        onChange={(onSuccess) => onChangeNode({ ...node, resolve: { ...node.resolve, onSuccess } })}
      />
      <ResolutionEditor
        act={act}
        title="✗ Em caso de falha"
        value={node.resolve.onFail}
        onChange={(onFail) => onChangeNode({ ...node, resolve: { ...node.resolve, onFail } })}
      />
    </div>
  );
}
