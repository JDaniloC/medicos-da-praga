// components/builder/ConditionBuilder.tsx
// Builder visual RECURSIVO de Condition: tipo folha (trait/flag/hasItem/treatment)
// ou composição (anyOf/allOf/not) com filhos aninhados.
"use client";

import { useState } from "react";
import type { Condition, StoryAct } from "@/lib/story/schema";
import {
  CONDITION_KINDS, conditionKind, convertCondition, defaultCondition,
  unwrapCondition, wrapCondition, type ConditionKind,
} from "@/lib/builder/condition-utils";
import { flagNames, itemIds, patientIds, traitIds, treatmentValues } from "@/lib/builder/harvest";
import { removeAt, replaceAt } from "@/lib/builder/immutable";
import {
  pairsToRecord, recordToPairs, type KeyValuePair,
} from "@/lib/builder/record-utils";
import { Button, Combobox, Select } from "./ui";

const KIND_LABEL: Record<ConditionKind, string> = {
  trait: "Traço do jogador",
  flag: "Flag",
  hasItem: "Tem item",
  treatment: "Tratamento aplicado",
  anyOf: "Qualquer uma (OU)",
  allOf: "Todas (E)",
  not: "Negação (NÃO)",
};

// Linhas paciente→tratamento da condição treatment. Estado local de pares para
// não perder linhas em edição (chave vazia some do record até ser preenchida).
function TreatmentRows({
  value, onChange, act,
}: {
  value: Record<string, string>;
  onChange: (record: Record<string, string>) => void;
  act: StoryAct;
}) {
  const [pairs, setPairs] = useState<KeyValuePair[]>(() => recordToPairs(value));
  const update = (next: KeyValuePair[]) => {
    setPairs(next);
    onChange(pairsToRecord(next));
  };
  return (
    <div className="space-y-2">
      {pairs.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-44">
            <Combobox
              value={p.key}
              onChange={(key) => update(replaceAt(pairs, i, { ...p, key }))}
              options={patientIds(act)}
              placeholder="paciente"
            />
          </div>
          <span className="text-ink-soft">recebeu</span>
          <div className="w-44">
            <Combobox
              value={p.label}
              onChange={(label) => update(replaceAt(pairs, i, { ...p, label }))}
              options={treatmentValues(act)}
              placeholder="tratamento"
            />
          </div>
          <Button variant="danger" onClick={() => update(removeAt(pairs, i))}>
            ✕
          </Button>
        </div>
      ))}
      <Button variant="ghost" onClick={() => update([...pairs, { key: "", label: "" }])}>
        + paciente
      </Button>
      {pairs.length > 1 && (
        <p className="text-xs text-ink-soft">Todas as entradas precisam bater (E lógico).</p>
      )}
    </div>
  );
}

export function ConditionBuilder({
  value, onChange, act, allowEmpty = false, depth = 0,
}: {
  value: Condition | undefined;
  onChange: (c: Condition | undefined) => void;
  act: StoryAct;
  allowEmpty?: boolean;
  depth?: number;
}) {
  if (!value) {
    if (!allowEmpty) return null;
    return (
      <Button variant="ghost" onClick={() => onChange(defaultCondition("trait"))}>
        + Adicionar condição
      </Button>
    );
  }

  const kind = conditionKind(value);
  const unwrapped = unwrapCondition(value);

  const body = (() => {
    switch (kind) {
      case "trait":
        if (!("trait" in value)) return null;
        return (
          <div className="w-56">
            <Combobox
              value={value.trait}
              onChange={(trait) => onChange({ trait })}
              options={traitIds(act)}
              placeholder="id do traço"
            />
          </div>
        );
      case "flag":
        if (!("flag" in value)) return null;
        return (
          <div className="flex flex-wrap items-center gap-2">
            <div className="w-56">
              <Combobox
                value={value.flag}
                onChange={(flag) => onChange({ ...value, flag })}
                options={flagNames(act)}
                placeholder="nome_da_flag"
              />
            </div>
            <div className="w-44">
              <Select
                value={String(value.value)}
                onChange={(v) => onChange({ ...value, value: v === "true" })}
                options={[
                  { value: "true", label: "ligada (true)" },
                  { value: "false", label: "desligada (false)" },
                ]}
              />
            </div>
          </div>
        );
      case "hasItem":
        if (!("hasItem" in value)) return null;
        return (
          <div className="w-56">
            <Combobox
              value={value.hasItem}
              onChange={(hasItem) => onChange({ hasItem })}
              options={itemIds(act)}
              placeholder="id do item"
            />
          </div>
        );
      case "treatment":
        if (!("treatment" in value)) return null;
        return (
          <TreatmentRows
            value={value.treatment}
            onChange={(treatment) => onChange({ treatment })}
            act={act}
          />
        );
      case "not":
        if (!("not" in value)) return null;
        return (
          <ConditionBuilder
            value={value.not}
            onChange={(c) => c && onChange({ not: c })}
            act={act}
            depth={depth + 1}
          />
        );
      case "anyOf":
      case "allOf": {
        const children = "anyOf" in value ? value.anyOf : "allOf" in value ? value.allOf : [];
        const setChildren = (list: Condition[]) =>
          onChange(kind === "anyOf" ? { anyOf: list } : { allOf: list });
        return (
          <div className="space-y-2">
            {children.map((child, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="min-w-0 flex-1">
                  <ConditionBuilder
                    value={child}
                    onChange={(c) => c && setChildren(replaceAt(children, i, c))}
                    act={act}
                    depth={depth + 1}
                  />
                </div>
                <Button variant="danger" onClick={() => setChildren(removeAt(children, i))}>
                  ✕
                </Button>
              </div>
            ))}
            <Button
              variant="ghost"
              onClick={() => setChildren([...children, defaultCondition("trait")])}
            >
              + condição
            </Button>
          </div>
        );
      }
    }
  })();

  return (
    <div className={depth > 0 ? "border-l-2 border-edge pl-3" : ""}>
      <div className="flex flex-wrap items-center gap-1.5">
        <div className="w-52">
          <Select
            value={kind}
            onChange={(k) => onChange(convertCondition(value, k as ConditionKind))}
            options={CONDITION_KINDS.map((k) => ({ value: k, label: KIND_LABEL[k] }))}
          />
        </div>
        {kind !== "not" && (
          <Button variant="ghost" title="Envolver em NÃO" onClick={() => onChange(wrapCondition(value, "not"))}>
            NÃO( )
          </Button>
        )}
        <Button variant="ghost" title="Envolver em OU" onClick={() => onChange(wrapCondition(value, "anyOf"))}>
          OU( )
        </Button>
        <Button variant="ghost" title="Envolver em E" onClick={() => onChange(wrapCondition(value, "allOf"))}>
          E( )
        </Button>
        {unwrapped && (
          <Button variant="ghost" title="Remover o invólucro, mantendo o filho" onClick={() => onChange(unwrapped)}>
            desembrulhar
          </Button>
        )}
        {allowEmpty && (
          <Button variant="danger" title="Remover condição" onClick={() => onChange(undefined)}>
            ✕
          </Button>
        )}
      </div>
      <div className="mt-2">{body}</div>
    </div>
  );
}
