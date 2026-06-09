// lib/builder/effect-utils.ts
// Transformações puras de Effect para o EffectListEditor.
import type { Effect } from "@/lib/story/schema";

export const EFFECT_KINDS = ["setFlag", "grantItem", "setTreatment", "setPatient"] as const;
export type EffectKind = (typeof EFFECT_KINDS)[number];

export function effectKind(e: Effect): EffectKind {
  if ("setFlag" in e) return "setFlag";
  if ("grantItem" in e) return "grantItem";
  if ("setTreatment" in e) return "setTreatment";
  return "setPatient";
}

export function defaultEffect(kind: EffectKind): Effect {
  switch (kind) {
    case "setFlag": return { setFlag: "", value: true };
    case "grantItem": return { grantItem: "" };
    case "setTreatment": return { setTreatment: "", value: "" };
    case "setPatient": return { setPatient: "", value: "sucesso" };
  }
}

export function convertEffect(e: Effect, kind: EffectKind): Effect {
  if (effectKind(e) === kind) return e;
  const base = defaultEffect(kind);
  return e.when !== undefined ? { ...base, when: e.when } : base;
}
