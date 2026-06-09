// app/api/story/route.ts
import { NextResponse } from "next/server";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { getServiceClient, hasSupabaseConfig } from "@/lib/supabase/server";
import { StoryActSchema, type StoryAct } from "@/lib/story/schema";

export const runtime = "nodejs";

function readSeed(act: number): StoryAct {
  const json = JSON.parse(readFileSync(resolve(`supabase/seed/act${act}.json`), "utf8"));
  return StoryActSchema.parse(json);
}

async function readFromSupabase(act: number): Promise<StoryAct> {
  const db = getServiceClient();
  const a = await db.from("acts").select("*").eq("act", act).single();
  if (a.error) throw a.error;
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

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const act = Number(searchParams.get("act") ?? "1");
  try {
    const story = hasSupabaseConfig() ? await readFromSupabase(act) : readSeed(act);
    return NextResponse.json(story);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao carregar a história.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
