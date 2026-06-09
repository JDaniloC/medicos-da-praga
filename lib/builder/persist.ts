// lib/builder/persist.ts
// Persistência de um ato no Supabase (espelha scripts/seed-story.ts + remoção de nós órfãos).
// supabase-js não tem transação multi-statement; a ordem upsert→upsert→delete é fail-safe:
// se o delete falhar, sobram nós extras inalcançáveis que passam no schema e somem no próximo save.
import type { SupabaseClient } from "@supabase/supabase-js";
import { StoryActSchema, type StoryAct } from "@/lib/story/schema";

// Mesma reconstrução de app/api/story/route.ts, mas com null para ato inexistente (404).
export async function readActFromDb(db: SupabaseClient, act: number): Promise<StoryAct | null> {
  const a = await db.from("acts").select("*").eq("act", act).maybeSingle();
  if (a.error) throw a.error;
  if (!a.data) return null;
  const s = await db.from("scenes").select("data").eq("act", act);
  if (s.error) throw s.error;
  const candidate = {
    act: a.data.act, title: a.data.title, start: a.data.start_node,
    worldContext: a.data.world_context, traits: a.data.traits,
    items: a.data.items, badges: a.data.badges,
    nodes: s.data.map((r: { data: unknown }) => r.data),
  };
  return StoryActSchema.parse(candidate);
}

export function staleNodeIds(existing: string[], current: string[]): string[] {
  const keep = new Set(current);
  return existing.filter((id) => !keep.has(id));
}

export async function saveAct(db: SupabaseClient, act: StoryAct): Promise<void> {
  const up = await db.from("acts").upsert({
    act: act.act, title: act.title, start_node: act.start,
    world_context: act.worldContext, traits: act.traits,
    items: act.items ?? {}, badges: act.badges ?? {}, updated_at: new Date().toISOString(),
  });
  if (up.error) throw up.error;

  const rows = act.nodes.map((n) => ({ act: act.act, node_id: n.id, kind: n.kind, data: n }));
  const ins = await db.from("scenes").upsert(rows);
  if (ins.error) throw ins.error;

  const existing = await db.from("scenes").select("node_id").eq("act", act.act);
  if (existing.error) throw existing.error;
  const stale = staleNodeIds(
    existing.data.map((r: { node_id: string }) => r.node_id),
    act.nodes.map((n) => n.id)
  );
  if (stale.length) {
    const del = await db.from("scenes").delete().eq("act", act.act).in("node_id", stale);
    if (del.error) throw del.error;
  }
}
