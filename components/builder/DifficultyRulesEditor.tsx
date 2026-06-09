// components/builder/DifficultyRulesEditor.tsx
// Regras ordenadas de dificuldade do d20: when opcional + set (fixa) ou delta (soma).
"use client";

import type { DifficultyRule, StoryAct } from "@/lib/story/schema";
import { setWhen } from "@/lib/builder/condition-utils";
import { moveItem, removeAt, replaceAt } from "@/lib/builder/immutable";
import { Button, NumberInput, Select } from "./ui";
import { ConditionBuilder } from "./ConditionBuilder";

export function DifficultyRulesEditor({
  act, value, onChange,
}: {
  act: StoryAct;
  value: DifficultyRule[] | undefined;
  onChange: (rules: DifficultyRule[] | undefined) => void;
}) {
  const rules = value ?? [];
  const update = (list: DifficultyRule[]) => onChange(list.length ? list : undefined);

  const setMode = (r: DifficultyRule, mode: "set" | "delta"): DifficultyRule => {
    if (mode === "set") {
      const { delta: _drop, ...rest } = r;
      void _drop;
      return { ...rest, set: r.delta ?? r.set ?? 10 };
    }
    const { set: _drop, ...rest } = r;
    void _drop;
    return { ...rest, delta: r.set !== undefined ? 0 : (r.delta ?? 0) };
  };

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-ink">Regras de dificuldade ({rules.length})</p>
      <p className="text-xs text-ink-soft">
        Aplicadas em ordem sobre a base; “fixar” sobrescreve, “somar” ajusta. Resultado final
        limitado entre 2 e 20.
      </p>
      {rules.map((r, i) => (
        <div key={i} className="space-y-2 rounded-lg border border-edge bg-panel-strong/50 p-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <div className="w-40">
              <Select
                value={r.set !== undefined ? "set" : "delta"}
                onChange={(m) => update(replaceAt(rules, i, setMode(r, m as "set" | "delta")))}
                options={[
                  { value: "set", label: "fixar em (set)" },
                  { value: "delta", label: "somar (delta)" },
                ]}
              />
            </div>
            <div className="w-24">
              <NumberInput
                value={r.set ?? r.delta ?? 0}
                onChange={(n) =>
                  update(replaceAt(rules, i, r.set !== undefined ? { ...r, set: n } : { ...r, delta: n }))
                }
              />
            </div>
            <span className="flex-1" />
            <Button variant="ghost" title="Mover acima" disabled={i === 0}
              onClick={() => update(moveItem(rules, i, i - 1))}>
              ↑
            </Button>
            <Button variant="ghost" title="Mover abaixo" disabled={i === rules.length - 1}
              onClick={() => update(moveItem(rules, i, i + 1))}>
              ↓
            </Button>
            <Button variant="danger" title="Remover regra" onClick={() => update(removeAt(rules, i))}>
              ✕
            </Button>
          </div>
          <div>
            <p className="mb-1 text-xs font-semibold text-ink-soft">Condição (opcional — sem ela, sempre aplica):</p>
            <ConditionBuilder
              value={r.when}
              onChange={(when) => update(replaceAt(rules, i, setWhen(r, when)))}
              act={act}
              allowEmpty
            />
          </div>
        </div>
      ))}
      <Button variant="ghost" onClick={() => update([...rules, { delta: 0 }])}>
        + Adicionar regra
      </Button>
    </div>
  );
}
