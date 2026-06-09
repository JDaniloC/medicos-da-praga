// app/builder/(protected)/layout.tsx
// Gate de auth do builder: sem cookie válido, redireciona ao login.
// As rotas /api/builder/* re-verificam o cookie a cada request.
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { isAuthorized } from "@/lib/builder/auth";
import { LogoutButton } from "@/components/builder/LogoutButton";

export const metadata: Metadata = {
  title: "Construtor de Atos — O Cerco de Caffa",
};

// O gate depende do cookie a cada request — sem isso o redirect de login
// seria pré-renderizado no build e bloquearia até quem está autenticado.
export const dynamic = "force-dynamic";

export default async function BuilderLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAuthorized())) redirect("/builder/login");
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b border-edge bg-panel px-4 py-3">
        <Link href="/builder" className="font-bold text-ink transition-colors hover:text-accent">
          Construtor de Atos
        </Link>
        <div className="flex items-center gap-3">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="text-sm text-ink-soft transition-colors hover:text-ink"
          >
            Abrir jogo ↗
          </a>
          <LogoutButton />
        </div>
      </header>
      <div className="flex-1">{children}</div>
    </div>
  );
}
