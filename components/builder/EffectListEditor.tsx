// components/builder/EffectListEditor.tsx
// Lista ordenável de Effects com campos por tipo e condição opcional (when).
"use client";

import type { Condition, Effect, StoryAct } from "@/lib/story/schema";
import { EFFECT_KINDS, convertEffect, defaultEffect, effectKind, type EffectKind } from "@/lib/builder/effect-utils";
import { flagNames, itemIds, patientIds, treatmentValues } from "@/lib/builder/harvest";
import { moveItem, removeAt, replaceAt } from "@/lib/builder/immutable";
import { Button, Combobox, Select } from "./ui";
import { ConditionBuilder } from "./ConditionBuilder";

const KIND_LABEL: Record<EffectKind, string> = {
  setFlag: "Definir flag",
  grantItem: "Conceder item",
  setTreatment: "Registrar tratamento",
  setPatient: "Resultado do paciente",
};

function withWhen(e: Effect, when: Condition | undefined): Effect {
  const { when: _drop, ...rest } = e;
  void _drop;
  return (when !== undefined ? { ...rest, when } : rest) as Effect;
}

function EffectFields({
  value, onChange, act,
}: {
  value: Effect;
  onChange: (e: Effect) => void;
  act: StoryAct;
}) {
  if ("setFlag" in value) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <div className="w-56">
          <Combobox
            value={value.setFlag}
            onChange={(setFlag) => onChange({ ...value, setFlag })}
            options={flagNames(act)}
            placeholder="nome_da_flag"
          />
        </div>
        <div className="w-44">
          <Select
            value={String(value.value)}
            onChange={(v) => onChange({ ...value, value: v === "true" })}
            options={[
              { value: "true", label: "ligar (true)" },
              { value: "false", label: "desligar (false)" },
            ]}
          />
        </div>
      </div>
    );
  }
  if ("grantItem" in value) {
    return (
      <div className="w-56">
        <Combobox
          value={value.grantItem}
          onChange={(grantItem) => onChange({ ...value, grantItem })}
          options={itemIds(act)}
          placeholder="id do item"
        />
      </div>
    );
  }
  if ("setTreatment" in value) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <div className="w-44">
          <Combobox
            value={value.setTreatment}
            onChange={(setTreatment) => onChange({ ...value, setTreatment })}
            options={patientIds(act)}
            placeholder="paciente"
          />
        </div>
        <span className="text-ink-soft">recebe</span>
        <div className="w-44">
          <Combobox
            value={value.value}
            onChange={(v) => onChange({ ...value, value: v })}
            options={treatmentValues(act)}
            placeholder="tratamento"
          />
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="w-44">
        <Combobox
          value={value.setPatient}
          onChange={(setPatient) => onChange({ ...value, setPatient })}
          options={patientIds(act)}
          placeholder="paciente"
        />
      </div>
      <div className="w-44">
        <Select
          value={value.value}
          onChange={(v) => onChange({ ...value, value: v as "sucesso" | "fracasso" })}
          options={[
            { value: "sucesso", label: "sucesso" },
            { value: "fracasso", label: "fracasso" },
          ]}
        />
      </div>
    </div>
  );
}

export function EffectListEditor({
  value, onChange, act,
}: {
  value: Effect[] | undefined;
  onChange: (effects: Effect[] | undefined) => void;
  act: StoryAct;
}) {
  const effects = value ?? [];
  const update = (list: Effect[]) => onChange(list.length ? list : undefined);

  return (
    <div className="space-y-3">
      {effects.map((e, i) => (
        <div key={i} className="space-y-2 rounded-lg border border-edge bg-panel-strong/50 p-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <div className="w-52">
              <Select
                value={effectKind(e)}
                onChange={(k) => update(replaceAt(effects, i, convertEffect(e, k as EffectKind)))}
                options={EFFECT_KINDS.map((k) => ({ value: k, label: KIND_LABEL[k] }))}
              />
            </div>
            <span className="flex-1" />
            <Button variant="ghost" title="Mover acima" disabled={i === 0} onClick={() => update(moveItem(effects, i, i - 1))}>
              ↑
            </Button>
            <Button
              variant="ghost"
              title="Mover abaixo"
              disabled={i === effects.length - 1}
              onClick={() => update(moveItem(effects, i, i + 1))}
            >
              ↓
            </Button>
            <Button variant="danger" title="Remover efeito" onClick={() => update(removeAt(effects, i))}>
              ✕
            </Button>
          </div>
          <EffectFields value={e} onChange={(next) => update(replaceAt(effects, i, next))} act={act} />
          <div>
            <p className="mb-1 text-xs font-semibold text-ink-soft">Condição (opcional — só aplica se verdadeira):</p>
            <ConditionBuilder
              value={e.when}
              onChange={(when) => update(replaceAt(effects, i, withWhen(e, when)))}
              act={act}
              allowEmpty
            />
          </div>
        </div>
      ))}
      <Button variant="ghost" onClick={() => update([...effects, defaultEffect("setFlag")])}>
        + Adicionar efeito
      </Button>
    </div>
  );
}
