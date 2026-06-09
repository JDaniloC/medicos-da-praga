// components/builder/DeleteActButton.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, ConfirmDialog } from "./ui";

export function DeleteActButton({ act, title }: { act: number; title: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function remove() {
    setConfirming(false);
    const res = await fetch(`/api/builder/acts/${act}`, { method: "DELETE" });
    if (!res.ok) {
      const json = (await res.json().catch(() => null)) as { error?: string } | null;
      setError(json?.error ?? `HTTP ${res.status}`);
      return;
    }
    router.refresh();
  }

  return (
    <>
      <Button variant="danger" title="Excluir ato" onClick={() => setConfirming(true)}>
        Excluir
      </Button>
      {error && <p className="text-xs text-blood">{error}</p>}
      <ConfirmDialog
        open={confirming}
        title={`Excluir o Ato ${act}`}
        message={`Excluir "${title}" apaga o ato e todos os seus nós do banco. Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir definitivamente"
        onConfirm={remove}
        onCancel={() => setConfirming(false)}
      />
    </>
  );
}
