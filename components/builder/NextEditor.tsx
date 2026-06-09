// components/builder/NextEditor.tsx
// Editor do roteamento Next: destino direto ou regras condicionais ordenadas + padrão.
"use client";

import type { Next, StoryAct } from "@/lib/story/schema";
import { buildNext, parseNext } from "@/lib/builder/next-utils";
import { defaultCondition } from "@/lib/builder/condition-utils";
import { nodeIds } from "@/lib/builder/harvest";
import { moveItem, removeAt, replaceAt } from "@/lib/builder/immutable";
import { Button, Combobox } from "./ui";
import { ConditionBuilder } from "./ConditionBuilder";

export function NextEditor({
  value, onChange, act, label = "Próximo nó",
}: {
  value: Next;
  onChange: (next: Next) => void;
  act: StoryAct;
  label?: string;
}) {
  const draft = parseNext(value);
  const ids = nodeIds(act);

  const setMode = (mode: "direct" | "conditional") => {
    if (mode === draft.mode) return;
    if (mode === "direct") {
      onChange(buildNext({ mode: "direct", target: draft.mode === "conditional" ? draft.defaultTarget : "" }));
    } else {
      const target = draft.mode === "direct" ? draft.target : "";
      onChange(buildNext({ mode: "conditional", rules: [], defaultTarget: target }));
    }
  };

  const modeButton = (mode: "direct" | "conditional", text: string) => (
    <button
      onClick={() => setMode(mode)}
      className={`rounded-lg border px-3 py-1 text-xs font-semibold transition-colors ${
        draft.mode === mode
          ? "border-accent bg-accent text-white"
          : "border-edge bg-panel text-ink hover:border-accent"
      }`}
    >
      {text}
    </button>
  );

  return (
    <div className="rounded-lg border border-edge bg-panel-strong/50 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-sm font-semibold text-ink">{label}:</p>
        {modeButton("direct", "Direto")}
        {modeButton("conditional", "Condicional")}
      </div>
      {draft.mode === "direct" ? (
        <div className="mt-2 w-64">
          <Combobox
            value={draft.target}
            onChange={(target) => onChange(buildNext({ ...draft, target }))}
            options={ids}
            placeholder="id do nó de destino"
          />
        </div>
      ) : (
        <div className="mt-2 space-y-3">
          <p className="text-xs text-ink-soft">
            Regras avaliadas em ordem; a primeira condição verdadeira decide o destino.
          </p>
          {draft.rules.map((r, i) => (
            <div key={i} className="space-y-2 rounded-lg border border-edge bg-panel p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold text-ink-soft">Regra {i + 1} — se:</p>
                <span className="flex gap-1.5">
                  <Button variant="ghost" title="Mover acima" disabled={i === 0}
                    onClick={() => onChange(buildNext({ ...draft, rules: moveItem(draft.rules, i, i - 1) }))}>
                    ↑
                  </Button>
                  <Button variant="ghost" title="Mover abaixo" disabled={i === draft.rules.length - 1}
                    onClick={() => onChange(buildNext({ ...draft, rules: moveItem(draft.rules, i, i + 1) }))}>
                    ↓
                  </Button>
                  <Button variant="danger" title="Remover regra"
                    onClick={() => onChange(buildNext({ ...draft, rules: removeAt(draft.rules, i) }))}>
                    ✕
                  </Button>
                </span>
              </div>
              <ConditionBuilder
                value={r.when}
                onChange={(when) =>
                  when && onChange(buildNext({ ...draft, rules: replaceAt(draft.rules, i, { ...r, when }) }))
                }
                act={act}
              />
              <div className="flex items-center gap-2">
                <span className="text-sm text-ink-soft">→ vai para</span>
                <div className="w-64">
                  <Combobox
                    value={r.goto}
                    onChange={(goto) =>
                      onChange(buildNext({ ...draft, rules: replaceAt(draft.rules, i, { ...r, goto }) }))
                    }
                    options={ids}
                    placeholder="id do nó"
                  />
                </div>
              </div>
            </div>
          ))}
          <Button
            variant="ghost"
            onClick={() =>
              onChange(
                buildNext({
                  ...draft,
                  rules: [...draft.rules, { when: defaultCondition("trait"), goto: "" }],
                })
              )
            }
          >
            + Adicionar regra
          </Button>
          <div className="flex items-center gap-2 border-t border-edge pt-3">
            <span className="text-sm font-semibold text-ink">Padrão (nenhuma regra bateu) →</span>
            <div className="w-64">
              <Combobox
                value={draft.defaultTarget}
                onChange={(defaultTarget) => onChange(buildNext({ ...draft, defaultTarget }))}
                options={ids}
                placeholder="id do nó"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
