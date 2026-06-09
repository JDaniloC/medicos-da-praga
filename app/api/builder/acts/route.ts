// app/api/builder/acts/route.ts
import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";
import { isAuthorized, unauthorized } from "@/lib/builder/auth";
import { listActSummaries } from "@/lib/builder/persist";

export const runtime = "nodejs";

export async function GET() {
  if (!(await isAuthorized())) return unauthorized();
  try {
    const acts = await listActSummaries(getServiceClient());
    return NextResponse.json({ acts });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao listar os atos.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
