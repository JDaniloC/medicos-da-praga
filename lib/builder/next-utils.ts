// lib/builder/next-utils.ts
// Serialização entre Next (string | rules) e o draft do NextEditor.
// buildNext só produz as formas válidas do refine de NextRuleSchema:
// {when, goto} para regras e um único {default} no fim.
import type { Condition, Next } from "@/lib/story/schema";

export type NextDraft =
  | { mode: "direct"; target: string }
  | { mode: "conditional"; rules: { when: Condition; goto: string }[]; defaultTarget: string };

export function parseNext(next: Next): NextDraft {
  if (typeof next === "string") return { mode: "direct", target: next };
  const rules: { when: Condition; goto: string }[] = [];
  let defaultTarget = "";
  for (const r of next) {
    if (r.when !== undefined && r.goto !== undefined) rules.push({ when: r.when, goto: r.goto });
    else if (r.default !== undefined && !defaultTarget) defaultTarget = r.default;
  }
  return { mode: "conditional", rules, defaultTarget };
}

export function buildNext(draft: NextDraft): Next {
  if (draft.mode === "direct") return draft.target;
  return [
    ...draft.rules.map((r) => ({ when: r.when, goto: r.goto })),
    { default: draft.defaultTarget },
  ];
}
