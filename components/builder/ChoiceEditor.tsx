// components/builder/ChoiceEditor.tsx
// Uma escolha da cena: rótulo visível + mecânica oculta (when, effects, next).
"use client";

import type { Choice, StoryAct } from "@/lib/story/schema";
import { setWhen } from "@/lib/builder/condition-utils";
import { traitIds } from "@/lib/builder/harvest";
import { Field, Select, TextInput } from "./ui";
import { ConditionBuilder } from "./ConditionBuilder";
import { EffectListEditor } from "./EffectListEditor";
import { NextEditor } from "./NextEditor";

export function ChoiceEditor({
  value, onChange, act,
}: {
  value: Choice;
  onChange: (choice: Choice) => void;
  act: StoryAct;
}) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Id da escolha" hint="snake_case, único dentro da cena.">
          <TextInput
            value={value.id}
            onChange={(e) => onChange({ ...value, id: e.target.value })}
            className="font-mono"
          />
        </Field>
        <Field label="Restrita ao traço (opcional)">
          <Select
            value={value.requiresTrait ?? ""}
            onChange={(v) => {
              const { requiresTrait: _drop, ...rest } = value;
              void _drop;
              onChange(v ? { ...rest, requiresTrait: v } : (rest as Choice));
            }}
            options={traitIds(act).map((t) => ({ value: t, label: t }))}
            placeholder="(qualquer traço)"
          />
        </Field>
      </div>
      <Field label="Rótulo" hint="Único texto que o jogador vê — só a ação, sem mecânica.">
        <TextInput
          value={value.label}
          onChange={(e) => onChange({ ...value, label: e.target.value })}
        />
      </Field>
      <div>
        <p className="mb-1 text-sm font-semibold text-ink">Exibir somente se (opcional):</p>
        <ConditionBuilder
          value={value.when}
          onChange={(when) => onChange(setWhen(value, when))}
          act={act}
          allowEmpty
        />
      </div>
      <div>
        <p className="mb-1 text-sm font-semibold text-ink">Efeitos ocultos ao escolher:</p>
        <EffectListEditor
          value={value.effects}
          onChange={(effects) => onChange({ ...value, effects })}
          act={act}
        />
      </div>
      <NextEditor
        value={value.next}
        onChange={(next) => onChange({ ...value, next })}
        act={act}
        label="Destino da escolha"
      />
    </div>
  );
}
