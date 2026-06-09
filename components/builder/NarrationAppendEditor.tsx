// components/builder/NarrationAppendEditor.tsx
// Fragmentos condicionais anexados à narração do nó.
"use client";

import type { StoryAct, StoryNode } from "@/lib/story/schema";
import { defaultCondition } from "@/lib/builder/condition-utils";
import { removeAt, replaceAt } from "@/lib/builder/immutable";
import { Button, TextArea } from "./ui";
import { ConditionBuilder } from "./ConditionBuilder";

type Append = NonNullable<StoryNode["narrationAppend"]>[number];

export function NarrationAppendEditor({
  act, value, onChange,
}: {
  act: StoryAct;
  value: StoryNode["narrationAppend"];
  onChange: (appends: StoryNode["narrationAppend"]) => void;
}) {
  const appends = value ?? [];
  const update = (list: Append[]) => onChange(list.length ? list : undefined);

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-ink">
        Acréscimos condicionais à narração ({appends.length})
      </p>
      {appends.map((a, i) => (
        <div key={i} className="space-y-2 rounded-lg border border-edge bg-panel-strong/50 p-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-ink-soft">Se:</p>
            <Button variant="danger" title="Remover acréscimo" onClick={() => update(removeAt(appends, i))}>
              ✕
            </Button>
          </div>
          <ConditionBuilder
            value={a.when}
            onChange={(when) => when && update(replaceAt(appends, i, { ...a, when }))}
            act={act}
          />
          <TextArea
            rows={2}
            value={a.text}
            placeholder="Texto acrescentado ao briefing quando a condição vale."
            onChange={(e) => update(replaceAt(appends, i, { ...a, text: e.target.value }))}
          />
        </div>
      ))}
      <Button
        variant="ghost"
        onClick={() => update([...appends, { when: defaultCondition("trait"), text: "" }])}
      >
        + Acréscimo condicional
      </Button>
    </div>
  );
}
