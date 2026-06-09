// app/api/builder/acts/route.ts
import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";
import { isAuthorized, unauthorized } from "@/lib/builder/auth";

export const runtime = "nodejs";

export async function GET() {
  if (!(await isAuthorized())) return unauthorized();
  try {
    const db = getServiceClient();
    const a = await db.from("acts").select("act,title,updated_at").order("act");
    if (a.error) throw a.error;
    const s = await db.from("scenes").select("act");
    if (s.error) throw s.error;
    const counts = new Map<number, number>();
    for (const r of s.data as { act: number }[]) counts.set(r.act, (counts.get(r.act) ?? 0) + 1);
    const acts = (a.data as { act: number; title: string; updated_at: string }[]).map((r) => ({
      act: r.act, title: r.title, nodeCount: counts.get(r.act) ?? 0, updatedAt: r.updated_at,
    }));
    return NextResponse.json({ acts });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao listar os atos.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
