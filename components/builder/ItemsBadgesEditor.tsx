// components/builder/ItemsBadgesEditor.tsx
// Edita os records items/badges (id → rótulo) como listas de linhas.
// Estado local de pares para não perder linhas com chave vazia/duplicada enquanto digita;
// o record propagado para o draft é sempre o normalizado (pairsToRecord).
"use client";

import { useState } from "react";
import type { StoryAct } from "@/lib/story/schema";
import { removeAt, replaceAt } from "@/lib/builder/immutable";
import {
  duplicateKeys, pairsToRecord, recordToPairs, type KeyValuePair,
} from "@/lib/builder/record-utils";
import { Button, TextInput } from "./ui";

function KeyValueListEditor({
  title, hint, initial, onChange,
}: {
  title: string;
  hint: string;
  initial: Record<string, string> | undefined;
  onChange: (record: Record<string, string>) => void;
}) {
  const [pairs, setPairs] = useState<KeyValuePair[]>(() => recordToPairs(initial));
  const dups = duplicateKeys(pairs);

  const update = (next: KeyValuePair[]) => {
    setPairs(next);
    onChange(pairsToRecord(next));
  };

  return (
    <section>
      <h3 className="font-bold text-ink">{title}</h3>
      <p className="mt-1 text-xs text-ink-soft">{hint}</p>
      <div className="mt-3 space-y-2">
        {pairs.map((p, i) => (
          <div key={i} className="flex items-center gap-2">
            <TextInput
              value={p.key}
              placeholder="id_snake_case"
              onChange={(e) => update(replaceAt(pairs, i, { ...p, key: e.target.value }))}
              className="max-w-56 font-mono"
            />
            <TextInput
              value={p.label}
              placeholder="Rótulo exibido"
              onChange={(e) => update(replaceAt(pairs, i, { ...p, label: e.target.value }))}
            />
            <Button variant="danger" onClick={() => update(removeAt(pairs, i))}>
              ✕
            </Button>
          </div>
        ))}
      </div>
      {dups.length > 0 && (
        <p className="mt-2 text-xs text-blood">
          Chaves duplicadas (a última vence ao salvar): {dups.join(", ")}
        </p>
      )}
      <Button
        variant="ghost"
        className="mt-3"
        onClick={() => update([...pairs, { key: "", label: "" }])}
      >
        + Adicionar
      </Button>
    </section>
  );
}

export function ItemsBadgesEditor({
  value, onChange,
}: {
  value: StoryAct;
  onChange: (act: StoryAct) => void;
}) {
  return (
    <div className="max-w-3xl space-y-10">
      <KeyValueListEditor
        title="Itens"
        hint="Inventário possível do jogador. O id é usado em grantItem/hasItem; o rótulo aparece na sidebar do jogo."
        initial={value.items}
        onChange={(items) => onChange({ ...value, items })}
      />
      <KeyValueListEditor
        title="Insígnias"
        hint="Conquistas do ato (ex.: imunizado). O id é usado em flags; o rótulo aparece na sidebar do jogo."
        initial={value.badges}
        onChange={(badges) => onChange({ ...value, badges })}
      />
    </div>
  );
}
