// lib/builder/harvest.ts
// Coleta valores já usados no draft do ato para popular dropdowns do builder
// (flags, pacientes, tratamentos etc.). Funções puras sobre StoryAct.
import type { Condition, Effect, Next, StoryAct } from "@/lib/story/schema";

export function walkConditions(act: StoryAct, fn: (c: Condition) => void): void {
  const visit = (c: Condition | undefined): void => {
    if (!c) return;
    fn(c);
    if ("anyOf" in c) c.anyOf.forEach(visit);
    else if ("allOf" in c) c.allOf.forEach(visit);
    else if ("not" in c) visit(c.not);
  };
  const visitNext = (next: Next): void => {
    if (typeof next === "string") return;
    next.forEach((r) => visit(r.when));
  };
  for (const n of act.nodes) {
    n.narrationAppend?.forEach((a) => visit(a.when));
    if (n.kind === "scene") {
      for (const ch of n.choices) {
        visit(ch.when);
        ch.effects?.forEach((e) => visit(e.when));
        visitNext(ch.next);
      }
    }
    if (n.kind === "dice") {
      n.difficulty.rules?.forEach((r) => visit(r.when));
      for (const res of [n.resolve.onSuccess, n.resolve.onFail]) {
        res.effects?.forEach((e) => visit(e.when));
        visitNext(res.goto);
      }
    }
  }
}

export function walkEffects(act: StoryAct, fn: (e: Effect) => void): void {
  for (const n of act.nodes) {
    if (n.kind === "scene") n.choices.forEach((c) => c.effects?.forEach(fn));
    if (n.kind === "dice") {
      n.resolve.onSuccess.effects?.forEach(fn);
      n.resolve.onFail.effects?.forEach(fn);
    }
  }
}

const uniqueSorted = (xs: string[]): string[] => [...new Set(xs)].sort();

export const nodeIds = (act: StoryAct): string[] => act.nodes.map((n) => n.id);

export const traitIds = (act: StoryAct): string[] => act.traits.map((t) => t.id);

export const itemIds = (act: StoryAct): string[] => Object.keys(act.items ?? {});

export function flagNames(act: StoryAct): string[] {
  const out: string[] = [];
  walkEffects(act, (e) => {
    if ("setFlag" in e) out.push(e.setFlag);
  });
  walkConditions(act, (c) => {
    if ("flag" in c) out.push(c.flag);
  });
  return uniqueSorted(out);
}

export function patientIds(act: StoryAct): string[] {
  const out: string[] = [];
  walkEffects(act, (e) => {
    if ("setTreatment" in e) out.push(e.setTreatment);
    if ("setPatient" in e) out.push(e.setPatient);
  });
  walkConditions(act, (c) => {
    if ("treatment" in c) out.push(...Object.keys(c.treatment));
  });
  return uniqueSorted(out);
}

export function treatmentValues(act: StoryAct): string[] {
  const out: string[] = [];
  walkEffects(act, (e) => {
    if ("setTreatment" in e) out.push(e.value);
  });
  walkConditions(act, (c) => {
    if ("treatment" in c) out.push(...Object.values(c.treatment));
  });
  return uniqueSorted(out);
}

export function ambientKeys(act: StoryAct): string[] {
  return uniqueSorted(act.nodes.map((n) => n.ambient).filter((x): x is string => !!x));
}
