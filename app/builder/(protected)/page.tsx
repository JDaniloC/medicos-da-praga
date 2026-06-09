// app/builder/(protected)/page.tsx
// Lista de atos — server component, lê direto do Supabase (service role).
import Link from "next/link";
import { getServiceClient, hasSupabaseConfig } from "@/lib/supabase/server";
import { listActSummaries, type ActSummary } from "@/lib/builder/persist";
import { DeleteActButton } from "@/components/builder/DeleteActButton";

async function listActs(): Promise<{ acts: ActSummary[] } | { error: string }> {
  if (!hasSupabaseConfig()) {
    return { error: "Supabase não configurado (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)." };
  }
  try {
    return { acts: await listActSummaries(getServiceClient()) };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Erro ao listar os atos." };
  }
}

export default async function BuilderHomePage() {
  const result = await listActs();
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink">Atos da história</h1>
        <Link
          href="/builder/acts/new"
          className="rounded-lg border border-edge bg-accent px-4 py-2 text-sm font-semibold text-white transition-all hover:opacity-90"
        >
          + Novo ato
        </Link>
      </div>

      {"error" in result ? (
        <p className="mt-8 rounded-xl border border-blood/40 bg-blood/5 p-4 text-blood">{result.error}</p>
      ) : result.acts.length === 0 ? (
        <p className="mt-8 rounded-xl border border-edge bg-panel p-6 text-ink-soft">
          Nenhum ato cadastrado ainda. Crie o primeiro com “Novo ato”.
        </p>
      ) : (
        <ul className="mt-8 space-y-3">
          {result.acts.map((a) => (
            <li key={a.act} className="flex items-center gap-3">
              <Link
                href={`/builder/acts/${a.act}`}
                className="block min-w-0 flex-1 rounded-xl border border-edge bg-panel p-5 transition-all hover:border-accent hover:bg-panel-strong hover:shadow-md"
              >
                <div className="flex items-baseline justify-between gap-4">
                  <span className="font-bold text-ink">
                    Ato {a.act} — {a.title}
                  </span>
                  <span className="shrink-0 text-sm text-ink-soft">{a.nodeCount} nós</span>
                </div>
                <p className="mt-1 text-xs text-ink-soft">
                  Atualizado em {new Date(a.updatedAt).toLocaleString("pt-BR")}
                </p>
              </Link>
              <DeleteActButton act={a.act} title={a.title} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
