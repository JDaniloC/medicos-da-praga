// components/builder/ActMetadataForm.tsx
"use client";

import type { StoryAct } from "@/lib/story/schema";
import { Combobox, Field, TextArea, TextInput } from "./ui";

export function ActMetadataForm({
  value, onChange, nodeIds,
}: {
  value: StoryAct;
  onChange: (act: StoryAct) => void;
  nodeIds: string[];
}) {
  return (
    <div className="max-w-2xl space-y-5">
      <Field label="Número do ato" hint="Definido na criação; identifica o ato no banco e na URL do jogo.">
        <TextInput value={String(value.act)} disabled />
      </Field>
      <Field label="Título">
        <TextInput
          value={value.title}
          onChange={(e) => onChange({ ...value, title: e.target.value })}
          placeholder="O Cerco de Caffa — Ato 1"
        />
      </Field>
      <Field label="Nó inicial" hint="Primeiro nó exibido quando o jogador começa o ato.">
        <Combobox
          value={value.start}
          onChange={(start) => onChange({ ...value, start })}
          options={nodeIds}
        />
      </Field>
      <Field
        label="Contexto de mundo"
        hint="Lore enviado ao narrador (LLM) junto de cada cena — época, tom, regras do mundo."
      >
        <TextArea
          rows={10}
          value={value.worldContext}
          onChange={(e) => onChange({ ...value, worldContext: e.target.value })}
        />
      </Field>
    </div>
  );
}
