// lib/story/validate.ts
import { StoryActSchema, type StoryAct, type Next } from "./schema";

export type ValidationResult =
  | { ok: true; act: StoryAct }
  | { ok: false; errors: string[] };

function targetsOfNext(next: Next): string[] {
  if (typeof next === "string") return [next];
  return next.flatMap((r) => [r.goto, r.default].filter((x): x is string => !!x));
}

export function validateAct(input: unknown): ValidationResult {
  const parsed = StoryActSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`) };
  }
  const act = parsed.data;
  const errors: string[] = [];
  const ids = new Set<string>();
  for (const n of act.nodes) {
    if (ids.has(n.id)) errors.push(`Nó duplicado: ${n.id}`);
    ids.add(n.id);
  }
  if (!ids.has(act.start)) errors.push(`Nó inicial inexistente: ${act.start}`);

  const refs: string[] = [];
  for (const n of act.nodes) {
    if (n.kind === "scene") n.choices.forEach((c) => refs.push(...targetsOfNext(c.next)));
    if (n.kind === "dice") {
      refs.push(...targetsOfNext(n.resolve.onSuccess.goto));
      refs.push(...targetsOfNext(n.resolve.onFail.goto));
    }
  }
  for (const r of refs) if (!ids.has(r)) errors.push(`Referência órfã: ${r}`);

  return errors.length ? { ok: false, errors } : { ok: true, act };
}
