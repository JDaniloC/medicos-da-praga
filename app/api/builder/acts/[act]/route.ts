// app/api/builder/acts/[act]/route.ts
import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";
import { isAuthorized, unauthorized } from "@/lib/builder/auth";
import { validateAct } from "@/lib/story/validate";
import { readActFromDb, saveAct } from "@/lib/builder/persist";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ act: string }> };

async function actNumber(ctx: Ctx): Promise<number | null> {
  const { act } = await ctx.params;
  const n = Number(act);
  return Number.isInteger(n) && n > 0 ? n : null;
}

export async function GET(_req: Request, ctx: Ctx) {
  if (!(await isAuthorized())) return unauthorized();
  const n = await actNumber(ctx);
  if (n === null) return NextResponse.json({ error: "Número de ato inválido." }, { status: 400 });
  try {
    const story = await readActFromDb(getServiceClient(), n);
    if (!story) return NextResponse.json({ error: "Ato não encontrado." }, { status: 404 });
    return NextResponse.json(story);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao carregar o ato.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: Request, ctx: Ctx) {
  if (!(await isAuthorized())) return unauthorized();
  const n = await actNumber(ctx);
  if (n === null) return NextResponse.json({ error: "Número de ato inválido." }, { status: 400 });
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }
  const result = validateAct(body);
  if (!result.ok) return NextResponse.json({ ok: false, errors: result.errors }, { status: 422 });
  if (result.act.act !== n) {
    return NextResponse.json({ error: "Número do ato não confere com a URL." }, { status: 400 });
  }
  try {
    await saveAct(getServiceClient(), result.act);
    return NextResponse.json({ ok: true, savedAt: new Date().toISOString() });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao salvar o ato.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_req: Request, ctx: Ctx) {
  if (!(await isAuthorized())) return unauthorized();
  const n = await actNumber(ctx);
  if (n === null) return NextResponse.json({ error: "Número de ato inválido." }, { status: 400 });
  try {
    // scenes caem junto via ON DELETE CASCADE (migration 0001).
    const del = await getServiceClient().from("acts").delete().eq("act", n);
    if (del.error) throw del.error;
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao excluir o ato.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
