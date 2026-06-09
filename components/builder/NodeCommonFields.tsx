// components/builder/NodeCommonFields.tsx
// Campos comuns a todo nó: id (com renomear propagando referências), imagem, ambient, narração.
"use client";

import { useState } from "react";
import type { StoryAct, StoryNode } from "@/lib/story/schema";
import { countReferences } from "@/lib/builder/act-utils";
import { Button, Field, TextArea, TextInput } from "./ui";
import { MediaPicker } from "./MediaPicker";

export function NodeCommonFields({
  act, node, onChangeNode, onRename,
}: {
  act: StoryAct;
  node: StoryNode;
  onChangeNode: (node: StoryNode) => void;
  onRename: (oldId: string, newId: string) => void;
}) {
  const [idDraft, setIdDraft] = useState(node.id);
  const idChanged = idDraft !== node.id;
  const idTaken = idChanged && act.nodes.some((n) => n.id === idDraft);
  const refs = countReferences(act, node.id);

  return (
    <div className="space-y-4">
      <Field
        label="Id do nó"
        error={idTaken ? `Já existe um nó com o id "${idDraft}".` : undefined}
        hint="snake_case. Renomear atualiza start, next e goto que apontam para este nó."
      >
        <div className="flex gap-2">
          <TextInput
            value={idDraft}
            onChange={(e) => setIdDraft(e.target.value)}
            className="max-w-72 font-mono"
          />
          {idChanged && (
            <Button
              variant="ghost"
              disabled={idTaken || !idDraft}
              onClick={() => onRename(node.id, idDraft)}
            >
              Renomear e atualizar {refs} {refs === 1 ? "referência" : "referências"}
            </Button>
          )}
        </div>
      </Field>
      <Field label="Imagem" hint="Chave R2 da arte do nó (ex.: scenes/cena1.webp).">
        <MediaPicker
          value={node.image}
          onChange={(image) => onChangeNode({ ...node, image })}
          kind="image"
          prefix="scenes"
        />
      </Field>
      <Field
        label="Som ambiente (opcional)"
        hint="Deixe vazio para sem ambiente. Valor sem sfx/ nem extensão (ex.: amb/hospital); apenas .mp3."
      >
        <MediaPicker
          value={node.ambient ?? ""}
          onChange={(v) => onChangeNode({ ...node, ambient: v || undefined })}
          kind="ambient"
        />
      </Field>
      <Field
        label="Narração"
        hint="Briefing do mestre para o narrador (LLM) — o que acontece nesta cena."
      >
        <TextArea
          rows={6}
          value={node.narration}
          onChange={(e) => onChangeNode({ ...node, narration: e.target.value })}
        />
      </Field>
    </div>
  );
}
