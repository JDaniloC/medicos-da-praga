// components/builder/TraitsEditor.tsx
"use client";

import type { TraitDef } from "@/lib/story/schema";
import { removeAt, replaceAt } from "@/lib/builder/immutable";
import { Button, Field, TextArea, TextInput } from "./ui";
import { MediaPicker } from "./MediaPicker";

const emptyTrait = (): TraitDef => ({
  id: "", nome: "", descricao: "", portrait: "", inventarioInicial: [],
});

export function TraitsEditor({
  value, onChange, itemOptions,
}: {
  value: TraitDef[];
  onChange: (traits: TraitDef[]) => void;
  itemOptions: string[];
}) {
  const updateTrait = (i: number, patch: Partial<TraitDef>) =>
    onChange(replaceAt(value, i, { ...value[i], ...patch }));

  return (
    <div className="max-w-3xl space-y-5">
      <p className="text-sm text-ink-soft">
        Arquétipos jogáveis do ato — o jogador escolhe um deles ao começar.
      </p>
      {value.map((t, i) => {
        // Itens do inventário inicial que não existem mais no record de itens.
        const unknownItems = t.inventarioInicial.filter((id) => !itemOptions.includes(id));
        return (
          <div key={i} className="space-y-4 rounded-xl border border-edge bg-panel p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-ink">{t.nome || t.id || `Traço ${i + 1}`}</h3>
              <Button variant="danger" onClick={() => onChange(removeAt(value, i))}>
                Remover
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Id" hint="snake_case, usado em requiresTrait e condições (ex.: druida).">
                <TextInput value={t.id} onChange={(e) => updateTrait(i, { id: e.target.value })} />
              </Field>
              <Field label="Nome exibido">
                <TextInput value={t.nome} onChange={(e) => updateTrait(i, { nome: e.target.value })} />
              </Field>
            </div>
            <Field label="Descrição" hint="Texto curto mostrado na seleção de personagem.">
              <TextArea
                rows={2}
                value={t.descricao}
                onChange={(e) => updateTrait(i, { descricao: e.target.value })}
              />
            </Field>
            <Field label="Retrato" hint="Chave R2 da imagem (ex.: portraits/druida.webp).">
              <MediaPicker
                value={t.portrait}
                onChange={(portrait) => updateTrait(i, { portrait })}
                kind="image"
                prefix="portraits"
              />
            </Field>
            <Field label="Inventário inicial" hint="Itens do record de Itens & Insígnias.">
              <div className="flex flex-wrap gap-x-5 gap-y-2">
                {itemOptions.length === 0 && (
                  <p className="text-xs text-ink-soft">Cadastre itens na seção Itens & Insígnias.</p>
                )}
                {itemOptions.map((item) => (
                  <label key={item} className="inline-flex items-center gap-1.5 text-sm text-ink">
                    <input
                      type="checkbox"
                      checked={t.inventarioInicial.includes(item)}
                      onChange={(e) =>
                        updateTrait(i, {
                          inventarioInicial: e.target.checked
                            ? [...t.inventarioInicial, item]
                            : t.inventarioInicial.filter((x) => x !== item),
                        })
                      }
                      className="h-4 w-4"
                    />
                    {item}
                  </label>
                ))}
              </div>
              {unknownItems.length > 0 && (
                <p className="mt-2 text-xs text-blood">
                  Itens desconhecidos no inventário: {unknownItems.join(", ")}{" "}
                  <button
                    className="underline"
                    onClick={() =>
                      updateTrait(i, {
                        inventarioInicial: t.inventarioInicial.filter((x) =>
                          itemOptions.includes(x)
                        ),
                      })
                    }
                  >
                    remover
                  </button>
                </p>
              )}
            </Field>
          </div>
        );
      })}
      <Button variant="ghost" onClick={() => onChange([...value, emptyTrait()])}>
        + Adicionar traço
      </Button>
    </div>
  );
}
