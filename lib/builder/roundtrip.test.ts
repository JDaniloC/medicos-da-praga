// Round-trip mestre: simula abrir o Ato 1 no editor, passar cada estrutura pelas
// serializações que os componentes usam (parse/build de next, record<->pares,
// setWhen) e salvar sem editar nada — o resultado deve ser idêntico ao original.
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import {
  StoryActSchema,
  type Choice, type Condition, type Effect, type Next, type StoryAct, type StoryNode,
} from "@/lib/story/schema";
import { setWhen } from "./condition-utils";
import { buildNext, parseNext } from "./next-utils";
import { pairsToRecord, recordToPairs } from "./record-utils";

const act1 = StoryActSchema.parse(
  JSON.parse(readFileSync("supabase/seed/act1.json", "utf8"))
);

function touchCondition(c: Condition): Condition {
  if ("anyOf" in c) return { anyOf: c.anyOf.map(touchCondition) };
  if ("allOf" in c) return { allOf: c.allOf.map(touchCondition) };
  if ("not" in c) return { not: touchCondition(c.not) };
  if ("treatment" in c) return { treatment: pairsToRecord(recordToPairs(c.treatment)) };
  return { ...c };
}

function touchEffect(e: Effect): Effect {
  return setWhen(e, e.when ? touchCondition(e.when) : undefined);
}

function touchNext(n: Next): Next {
  const draft = parseNext(n);
  if (draft.mode === "direct") return buildNext(draft);
  return buildNext({
    ...draft,
    rules: draft.rules.map((r) => ({ when: touchCondition(r.when), goto: r.goto })),
  });
}

function touchChoice(c: Choice): Choice {
  const out = setWhen({ ...c, next: touchNext(c.next) }, c.when ? touchCondition(c.when) : undefined);
  return { ...out, effects: c.effects ? c.effects.map(touchEffect) : undefined };
}

function touchNode(n: StoryNode): StoryNode {
  const base = {
    ...n,
    narrationAppend: n.narrationAppend
      ? n.narrationAppend.map((a) => ({ when: touchCondition(a.when), text: a.text }))
      : undefined,
  };
  if (base.kind === "scene") {
    return { ...base, choices: base.choices.map(touchChoice) };
  }
  if (base.kind === "dice") {
    return {
      ...base,
      difficulty: {
        base: base.difficulty.base,
        rules: base.difficulty.rules
          ? base.difficulty.rules.map((r) =>
              setWhen({ ...r }, r.when ? touchCondition(r.when) : undefined)
            )
          : undefined,
      },
      resolve: {
        onSuccess: {
          effects: base.resolve.onSuccess.effects?.map(touchEffect),
          goto: touchNext(base.resolve.onSuccess.goto),
        },
        onFail: {
          effects: base.resolve.onFail.effects?.map(touchEffect),
          goto: touchNext(base.resolve.onFail.goto),
        },
      },
    };
  }
  return base;
}

function touchAct(act: StoryAct): StoryAct {
  return {
    ...act,
    items: act.items ? pairsToRecord(recordToPairs(act.items)) : undefined,
    badges: act.badges ? pairsToRecord(recordToPairs(act.badges)) : undefined,
    traits: act.traits.map((t) => ({ ...t, inventarioInicial: [...t.inventarioInicial] })),
    nodes: act.nodes.map(touchNode),
  };
}

describe("round-trip mestre do editor sobre o act1.json", () => {
  it("tocar todas as estruturas sem editar preserva o ato inteiro", () => {
    const touched = touchAct(act1);
    expect(touched).toEqual(act1);
    // E o que seria enviado no PUT (JSON) re-parseia para o mesmo ato:
    const wire = JSON.parse(JSON.stringify(touched));
    expect(StoryActSchema.parse(wire)).toEqual(act1);
  });
});
