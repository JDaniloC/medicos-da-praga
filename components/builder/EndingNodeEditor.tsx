// components/builder/EndingNodeEditor.tsx
"use client";

import type { EndingNode, StoryAct } from "@/lib/story/schema";
import { Combobox, Field, TextInput } from "./ui";

export function EndingNodeEditor({
  act, node, onChangeNode,
}: {
  act: StoryAct;
  node: EndingNode;
  onChangeNode: (node: EndingNode) => void;
}) {
  const outcomeOptions = [
    ...new Set([
      "gameover", "sobrevive", "imune",
      ...act.nodes.filter((n) => n.kind === "ending").map((n) => n.outcome).filter(Boolean),
    ]),
  ];
  return (
    <div className="space-y-4">
      <Field label="Desfecho" hint="Identificador do resultado (ex.: gameover, sobrevive, imune).">
        <Combobox
          value={node.outcome}
          onChange={(outcome) => onChangeNode({ ...node, outcome })}
          options={outcomeOptions}
        />
      </Field>
      <Field label="Título do final" hint="Exibido ao jogador na tela de encerramento.">
        <TextInput
          value={node.title}
          onChange={(e) => onChangeNode({ ...node, title: e.target.value })}
        />
      </Field>
    </div>
  );
}
