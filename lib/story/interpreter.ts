import type { GameState } from "../engine/types";
import type { Condition, Effect, Next, Choice, DifficultyRule, SceneNode, StoryNode } from "./schema";
import { clampDifficulty } from "../engine/dice";

export function evalCondition(cond: Condition, s: GameState): boolean {
  if ("trait" in cond) return s.trait === cond.trait;
  if ("flag" in cond) return (s.flags[cond.flag] ?? false) === cond.value;
  if ("hasItem" in cond) return s.inventory.includes(cond.hasItem);
  if ("treatment" in cond)
    return Object.entries(cond.treatment).every(([k, v]) => s.treatments[k] === v);
  if ("anyOf" in cond) return cond.anyOf.some((c) => evalCondition(c, s));
  if ("allOf" in cond) return cond.allOf.every((c) => evalCondition(c, s));
  if ("not" in cond) return !evalCondition(cond.not, s);
  return false;
}

function applyEffect(e: Effect, s: GameState): GameState {
  if (e.when && !evalCondition(e.when, s)) return s;
  if ("setFlag" in e) return { ...s, flags: { ...s.flags, [e.setFlag]: e.value } };
  if ("grantItem" in e)
    return s.inventory.includes(e.grantItem) ? s : { ...s, inventory: [...s.inventory, e.grantItem] };
  if ("setTreatment" in e)
    return { ...s, treatments: { ...s.treatments, [e.setTreatment]: e.value } };
  if ("setPatient" in e)
    return { ...s, patients: { ...s.patients, [e.setPatient]: e.value } };
  return s;
}

export function applyEffects(effects: Effect[] | undefined, s: GameState): GameState {
  return (effects ?? []).reduce((acc, e) => applyEffect(e, acc), s);
}

export function computeDifficulty(
  diff: { base: number; rules?: DifficultyRule[] }, s: GameState
): number {
  let value = diff.base;
  for (const rule of diff.rules ?? []) {
    if (rule.when && !evalCondition(rule.when, s)) continue;
    if (typeof rule.set === "number") value = rule.set;
    if (typeof rule.delta === "number") value += rule.delta;
  }
  return clampDifficulty(value);
}

export function resolveNext(next: Next, s: GameState): string {
  if (typeof next === "string") return next;
  for (const rule of next) {
    if (rule.when) {
      if (evalCondition(rule.when, s) && rule.goto) return rule.goto;
    } else if (rule.default) {
      return rule.default;
    } else if (rule.goto) {
      return rule.goto;
    }
  }
  throw new Error("Nenhuma regra de `next` resolveu para um destino.");
}

export function visibleChoices(node: SceneNode, s: GameState): Choice[] {
  return node.choices.filter((c) => {
    if (c.requiresTrait && c.requiresTrait !== s.trait) return false;
    if (c.when && !evalCondition(c.when, s)) return false;
    return true;
  });
}

// Monta a narração final do nó: o briefing base + cada trecho de `narrationAppend`
// cuja condição é verdadeira no estado atual.
export function buildNarration(node: StoryNode, s: GameState): string {
  const extra = (node.narrationAppend ?? [])
    .filter((a) => evalCondition(a.when, s))
    .map((a) => a.text);
  return [node.narration, ...extra].join("\n\n");
}
