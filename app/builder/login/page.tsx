// app/builder/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BuilderLoginPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/builder/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      if (!res.ok) {
        const json = (await res.json().catch(() => null)) as { error?: string } | null;
        setError(json?.error ?? `Erro HTTP ${res.status}`);
        return;
      }
      router.replace("/builder");
    } catch {
      setError("Falha de rede ao entrar.");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-sm flex-col justify-center px-4 fade-in">
      <h1 className="text-center text-2xl font-bold text-ink">Construtor de Atos</h1>
      <p className="mt-2 text-center text-sm text-ink-soft">
        Informe o token de administrador para editar a história.
      </p>
      <form onSubmit={submit} className="mt-8 rounded-xl border border-edge bg-panel p-6 shadow-sm">
        <label className="block text-sm font-semibold text-ink" htmlFor="token">
          Token de acesso
        </label>
        <input
          id="token"
          type="password"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          autoFocus
          className="mt-2 w-full rounded-lg border border-edge bg-panel-strong px-3 py-2 text-ink outline-none focus:border-accent"
        />
        {error && <p className="mt-3 text-sm text-blood">{error}</p>}
        <button
          type="submit"
          disabled={pending || !token}
          className="mt-4 w-full rounded-lg border border-edge bg-accent px-4 py-2 font-semibold text-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </main>
  );
}
