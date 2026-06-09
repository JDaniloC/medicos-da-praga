// components/builder/ResolutionEditor.tsx
// Desfecho de um teste de dado (onSuccess/onFail): efeitos + destino.
"use client";

import type { StoryAct } from "@/lib/story/schema";
import { z } from "zod";
import type { ResolutionSchema } from "@/lib/story/schema";
import { EffectListEditor } from "./EffectListEditor";
import { NextEditor } from "./NextEditor";

type Resolution = z.infer<typeof ResolutionSchema>;

export function ResolutionEditor({
  act, title, value, onChange,
}: {
  act: StoryAct;
  title: string;
  value: Resolution;
  onChange: (resolution: Resolution) => void;
}) {
  return (
    <div className="space-y-3 rounded-xl border border-edge bg-panel p-4">
      <h4 className="font-bold text-ink">{title}</h4>
      <div>
        <p className="mb-1 text-sm font-semibold text-ink">Efeitos:</p>
        <EffectListEditor
          value={value.effects}
          onChange={(effects) => onChange({ ...value, effects })}
          act={act}
        />
      </div>
      <NextEditor
        value={value.goto}
        onChange={(goto) => onChange({ ...value, goto })}
        act={act}
        label="Destino"
      />
    </div>
  );
}
