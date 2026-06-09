// components/builder/ValidationPanel.tsx
"use client";

import type { StoryAct } from "@/lib/story/schema";
import { errorNodeIndex } from "@/lib/builder/validation-utils";

export function ValidationPanel({
  errors, act, onFocusNode,
}: {
  errors: string[];
  act: StoryAct;
  onFocusNode: (nodeId: string) => void;
}) {
  if (!errors.length) {
    return (
      <div className="rounded-xl border border-success/40 bg-success/5 px-4 py-3 text-sm font-semibold text-success">
        ✓ Ato válido — pronto para salvar.
      </div>
    );
  }
  return (
    <div className="rounded-xl border border-blood/40 bg-blood/5 p-4">
      <p className="text-sm font-bold text-blood">
        {errors.length} {errors.length === 1 ? "erro impede" : "erros impedem"} o salvamento:
      </p>
      <ul className="mt-2 space-y-1">
        {errors.map((e, i) => {
          const idx = errorNodeIndex(e);
          const nodeId = idx !== null ? act.nodes[idx]?.id : undefined;
          return (
            <li key={`${i}-${e}`} className="text-sm text-ink">
              {nodeId ? (
                <button
                  className="text-left underline decoration-blood/40 underline-offset-2 hover:text-blood"
                  onClick={() => onFocusNode(nodeId)}
                >
                  <span className="font-semibold">[{nodeId}]</span> {e}
                </button>
              ) : (
                <span>{e}</span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
