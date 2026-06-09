// lib/builder/condition-utils.ts
// Transformações puras de Condition para o ConditionBuilder recursivo.
import type { Condition } from "@/lib/story/schema";

export const CONDITION_KINDS = [
  "trait", "flag", "hasItem", "treatment", "anyOf", "allOf", "not",
] as const;
export type ConditionKind = (typeof CONDITION_KINDS)[number];

export function conditionKind(c: Condition): ConditionKind {
  if ("trait" in c) return "trait";
  if ("flag" in c) return "flag";
  if ("hasItem" in c) return "hasItem";
  if ("treatment" in c) return "treatment";
  if ("anyOf" in c) return "anyOf";
  if ("allOf" in c) return "allOf";
  return "not";
}

export function defaultCondition(kind: ConditionKind): Condition {
  switch (kind) {
    case "trait": return { trait: "" };
    case "flag": return { flag: "", value: true };
    case "hasItem": return { hasItem: "" };
    case "treatment": return { treatment: {} };
    case "anyOf": return { anyOf: [] };
    case "allOf": return { allOf: [] };
    case "not": return { not: { trait: "" } };
  }
}

function childrenOf(c: Condition): Condition[] | null {
  if ("anyOf" in c) return c.anyOf;
  if ("allOf" in c) return c.allOf;
  if ("not" in c) return [c.not];
  return null;
}

// Troca o tipo da condição: grupos preservam filhos entre si; o resto vira o default do novo tipo.
export function convertCondition(c: Condition, kind: ConditionKind): Condition {
  if (conditionKind(c) === kind) return c;
  const children = childrenOf(c);
  if (children) {
    if (kind === "anyOf") return { anyOf: children };
    if (kind === "allOf") return { allOf: children };
    if (kind === "not") return { not: children[0] ?? { trait: "" } };
  }
  return defaultCondition(kind);
}

export function wrapCondition(c: Condition, wrapper: "not" | "anyOf" | "allOf"): Condition {
  if (wrapper === "not") return { not: c };
  if (wrapper === "anyOf") return { anyOf: [c] };
  return { allOf: [c] };
}

// Define/remove o `when` opcional de choices, effects e regras de dificuldade,
// removendo a chave quando indefinido (mantém o JSON salvo limpo).
export function setWhen<T extends { when?: Condition }>(obj: T, when: Condition | undefined): T {
  const { when: _drop, ...rest } = obj;
  void _drop;
  return (when !== undefined ? { ...rest, when } : rest) as T;
}

// Inverso do wrap: not e grupos de um único filho devolvem o filho; senão null.
export function unwrapCondition(c: Condition): Condition | null {
  if ("not" in c) return c.not;
  if ("anyOf" in c && c.anyOf.length === 1) return c.anyOf[0];
  if ("allOf" in c && c.allOf.length === 1) return c.allOf[0];
  return null;
}
