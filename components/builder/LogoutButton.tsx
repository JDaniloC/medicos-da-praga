// components/builder/LogoutButton.tsx
"use client";

import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();
  async function logout() {
    await fetch("/api/builder/logout", { method: "POST" });
    router.replace("/builder/login");
  }
  return (
    <button
      onClick={logout}
      className="rounded-lg border border-edge bg-panel px-3 py-1.5 text-sm text-ink-soft transition-all hover:border-accent hover:text-ink"
    >
      Sair
    </button>
  );
}
