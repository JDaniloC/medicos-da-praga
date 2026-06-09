// components/builder/ActEditor.tsx
// Raiz do editor: carrega o ato, mantém o draft em estado imutável, valida continuamente
// (validateAct, o mesmo do servidor) e salva via PUT /api/builder/acts/:act.
"use client";

import { useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import { StoryActSchema, type StoryAct } from "@/lib/story/schema";
import { validateAct } from "@/lib/story/validate";
import { errorNodeIndex } from "@/lib/builder/validation-utils";
import { itemIds } from "@/lib/builder/harvest";
import { ActMetadataForm } from "./ActMetadataForm";
import { BuilderHeader } from "./BuilderHeader";
import { ItemsBadgesEditor } from "./ItemsBadgesEditor";
import { TraitsEditor } from "./TraitsEditor";
import { ValidationPanel } from "./ValidationPanel";
import { Toast } from "./ui";

export type Section =
  | { type: "metadata" }
  | { type: "traits" }
  | { type: "items" }
  | { type: "node"; id: string };

export function ActEditor({ act }: { act: number }) {
  const [draft, setDraft] = useState<StoryAct | null>(null);
  const [lastSaved, setLastSaved] = useState("");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [section, setSection] = useState<Section>({ type: "metadata" });
  const [showValidation, setShowValidation] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; tone: "success" | "danger" } | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/builder/acts/${act}`)
      .then(async (res) => {
        const json = (await res.json().catch(() => null)) as unknown;
        if (!res.ok) {
          const msg = (json as { error?: string } | null)?.error ?? `HTTP ${res.status}`;
          throw new Error(msg);
        }
        return StoryActSchema.parse(json);
      })
      .then((story) => {
        if (cancelled) return;
        setDraft(story);
        setLastSaved(JSON.stringify(story));
      })
      .catch((e: Error) => {
        if (!cancelled) setLoadError(e.message);
      });
    return () => {
      cancelled = true;
    };
  }, [act]);

  const deferredDraft = useDeferredValue(draft);
  const errors = useMemo(() => {
    if (!deferredDraft) return [];
    const v = validateAct(deferredDraft);
    return v.ok ? [] : v.errors;
  }, [deferredDraft]);

  // Contagem de erros por nó (badges na lista de nós).
  const nodeErrorCounts = useMemo(() => {
    const map = new Map<string, number>();
    if (!deferredDraft) return map;
    for (const e of errors) {
      const idx = errorNodeIndex(e);
      const id = idx !== null ? deferredDraft.nodes[idx]?.id : undefined;
      if (id) map.set(id, (map.get(id) ?? 0) + 1);
    }
    return map;
  }, [errors, deferredDraft]);

  const dirty = useMemo(
    () => draft !== null && JSON.stringify(draft) !== lastSaved,
    [draft, lastSaved]
  );

  useEffect(() => {
    if (!dirty) return;
    function onBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault();
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const focusNode = useCallback((nodeId: string) => {
    setSection({ type: "node", id: nodeId });
  }, []);

  const save = useCallback(async () => {
    if (!draft || saving) return;
    const v = validateAct(draft);
    if (!v.ok) {
      setShowValidation(true);
      setToast({ message: "Corrija os erros de validação antes de salvar.", tone: "danger" });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/builder/acts/${draft.act}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const json = (await res.json().catch(() => null)) as
        | { ok?: boolean; errors?: string[]; error?: string }
        | null;
      if (!res.ok) {
        const msg = json?.errors?.join("; ") ?? json?.error ?? `HTTP ${res.status}`;
        setToast({ message: `Falha ao salvar: ${msg}`, tone: "danger" });
        return;
      }
      setLastSaved(JSON.stringify(draft));
      setToast({ message: "Salvo. Recarregue a aba do jogo para ver a mudança.", tone: "success" });
    } catch {
      setToast({ message: "Falha de rede ao salvar.", tone: "danger" });
    } finally {
      setSaving(false);
    }
  }, [draft, saving]);

  if (loadError) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16">
        <p className="rounded-xl border border-blood/40 bg-blood/5 p-4 text-blood">
          Não foi possível carregar o ato {act}: {loadError}
        </p>
      </main>
    );
  }
  if (!draft) {
    return <p className="px-6 py-16 text-center text-ink-soft">Carregando o ato {act}…</p>;
  }

  const sectionButton = (target: Section, label: string) => {
    const active = section.type === target.type;
    return (
      <button
        onClick={() => setSection(target)}
        className={`w-full rounded-lg px-3 py-2 text-left text-sm font-semibold transition-colors ${
          active ? "bg-accent text-white" : "text-ink hover:bg-panel"
        }`}
      >
        {label}
      </button>
    );
  };

  return (
    <div className="flex min-h-[calc(100vh-53px)] flex-col">
      <BuilderHeader
        act={draft}
        dirty={dirty}
        saving={saving}
        errorCount={errors.length}
        onSave={save}
        onToggleValidation={() => setShowValidation((s) => !s)}
      />
      {showValidation && (
        <div className="border-b border-edge bg-panel-strong/60 px-4 py-3">
          <ValidationPanel errors={errors} act={draft} onFocusNode={focusNode} />
        </div>
      )}
      <div className="flex flex-1 items-stretch">
        <aside className="w-72 shrink-0 space-y-1 overflow-y-auto border-r border-edge bg-panel-strong/40 p-3">
          {sectionButton({ type: "metadata" }, "Metadados do ato")}
          {sectionButton({ type: "traits" }, "Traços (personagens)")}
          {sectionButton({ type: "items" }, "Itens & Insígnias")}
          <div className="pt-3">
            <p className="px-3 pb-1 text-xs font-bold uppercase tracking-wider text-ink-soft">
              Nós ({draft.nodes.length})
            </p>
            {/* NodeList entra na fase de edição de nós */}
            <p className="px-3 text-xs text-ink-soft">Em construção.</p>
          </div>
        </aside>
        <main className="min-w-0 flex-1 p-6 fade-in">
          {section.type === "metadata" && (
            <ActMetadataForm
              value={draft}
              onChange={setDraft}
              nodeIds={draft.nodes.map((n) => n.id)}
            />
          )}
          {section.type === "traits" && (
            <TraitsEditor
              value={draft.traits}
              onChange={(traits) => setDraft({ ...draft, traits })}
              itemOptions={itemIds(draft)}
            />
          )}
          {section.type === "items" && <ItemsBadgesEditor value={draft} onChange={setDraft} />}
          {section.type === "node" && <p className="text-ink-soft">Em construção.</p>}
        </main>
      </div>
      {toast && <Toast message={toast.message} tone={toast.tone} />}
    </div>
  );
}
