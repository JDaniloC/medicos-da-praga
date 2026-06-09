// app/builder/(protected)/acts/new/page.tsx
// Cria um ato com template mínimo válido e abre o editor.
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { StoryAct } from "@/lib/story/schema";
import { Button, Field, NumberInput, TextInput } from "@/components/builder/ui";

function template(act: number, title: string): StoryAct {
  return {
    act,
    title,
    start: "cena1",
    worldContext: "",
    traits: [],
    items: {},
    badges: {},
    nodes: [
      {
        id: "cena1", kind: "scene", image: "", narration: "",
        choices: [{ id: "seguir", label: "Seguir em frente", next: "fim" }],
      },
      { id: "fim", kind: "ending", image: "", narration: "", outcome: "fim", title: "Fim do ato" },
    ],
  };
}

export default function NewActPage() {
  const router = useRouter();
  const [existing, setExisting] = useState<number[] | null>(null);
  const [act, setAct] = useState(1);
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    fetch("/api/builder/acts")
      .then(async (res) => {
        const json = (await res.json().catch(() => null)) as
          | { acts?: { act: number }[]; error?: string }
          | null;
        if (!res.ok || !json?.acts) throw new Error(json?.error ?? `HTTP ${res.status}`);
        const nums = json.acts.map((a) => a.act);
        setExisting(nums);
        setAct(nums.length ? Math.max(...nums) + 1 : 1);
      })
      .catch((e: Error) => setError(e.message));
  }, []);

  const collision = existing?.includes(act) ?? false;

  async function create() {
    if (pending || collision) return;
    setPending(true);
    setError(null);
    try {
      const res = await fetch(`/api/builder/acts/${act}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(template(act, title || `Ato ${act}`)),
      });
      const json = (await res.json().catch(() => null)) as { error?: string; errors?: string[] } | null;
      if (!res.ok) throw new Error(json?.errors?.join("; ") ?? json?.error ?? `HTTP ${res.status}`);
      router.push(`/builder/acts/${act}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao criar o ato.");
      setPending(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-md px-4 py-10 fade-in">
      <h1 className="text-2xl font-bold text-ink">Novo ato</h1>
      <p className="mt-2 text-sm text-ink-soft">
        Cria um ato com uma cena inicial e um final de exemplo, já salvo no banco.
      </p>
      <div className="mt-6 space-y-5 rounded-xl border border-edge bg-panel p-6">
        <Field
          label="Número do ato"
          error={collision ? `O ato ${act} já existe.` : undefined}
          hint="Identifica o ato no banco e na URL do jogo (?act=N)."
        >
          <NumberInput value={act} min={1} onChange={setAct} />
        </Field>
        <Field label="Título">
          <TextInput
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={`O Cerco de Caffa — Ato ${act}`}
          />
        </Field>
        {error && <p className="text-sm text-blood">{error}</p>}
        <Button onClick={create} disabled={pending || collision || existing === null} className="w-full">
          {pending ? "Criando…" : "Criar e abrir no editor"}
        </Button>
      </div>
    </main>
  );
}
