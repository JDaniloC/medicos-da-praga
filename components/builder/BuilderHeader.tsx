// components/builder/BuilderHeader.tsx
"use client";

import Link from "next/link";
import type { StoryAct } from "@/lib/story/schema";
import { Badge, Button } from "./ui";

export function BuilderHeader({
  act, dirty, saving, errorCount, onSave, onToggleValidation,
}: {
  act: StoryAct;
  dirty: boolean;
  saving: boolean;
  errorCount: number;
  onSave: () => void;
  onToggleValidation: () => void;
}) {
  return (
    <div className="sticky top-0 z-40 flex flex-wrap items-center justify-between gap-2 border-b border-edge bg-panel px-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <Link
          href="/builder"
          className="shrink-0 text-ink-soft transition-colors hover:text-ink"
          title="Voltar para a lista de atos"
        >
          ← Atos
        </Link>
        <h1 className="truncate font-bold text-ink">
          Ato {act.act} — {act.title || "(sem título)"}
        </h1>
        {dirty && <Badge tone="accent">não salvo</Badge>}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <button onClick={onToggleValidation} title="Ver detalhes da validação">
          {errorCount > 0 ? (
            <Badge tone="danger">{errorCount} {errorCount === 1 ? "erro" : "erros"}</Badge>
          ) : (
            <Badge tone="success">válido</Badge>
          )}
        </button>
        <Button onClick={onSave} disabled={saving}>
          {saving ? "Salvando…" : "Salvar"}
        </Button>
      </div>
    </div>
  );
}
