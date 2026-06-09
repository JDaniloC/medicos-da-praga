// scripts/seed-story.ts
import dotenv from "dotenv";
import { readFileSync } from "node:fs";
import { validateAct } from "../lib/story/validate";
import { getServiceClient } from "../lib/supabase/server";

dotenv.config({ path: [".env.local", ".env"] });

async function main() {
  const path = process.argv[2];
  if (!path) { console.error("Uso: npm run seed:story <arquivo.json>"); process.exit(1); }

  const json = JSON.parse(readFileSync(path, "utf8"));
  const result = validateAct(json);
  if (!result.ok) {
    console.error("INVÁLIDO — corrija antes do seed:");
    result.errors.forEach((e) => console.error(" - " + e));
    process.exit(1);
  }
  const act = result.act;
  const db = getServiceClient();

  const up = await db.from("acts").upsert({
    act: act.act, title: act.title, start_node: act.start,
    world_context: act.worldContext, traits: act.traits,
    items: act.items ?? {}, badges: act.badges ?? {}, updated_at: new Date().toISOString(),
  });
  if (up.error) throw up.error;

  const rows = act.nodes.map((n) => ({ act: act.act, node_id: n.id, kind: n.kind, data: n }));
  const ins = await db.from("scenes").upsert(rows);
  if (ins.error) throw ins.error;

  console.log(`Seed concluído: ato ${act.act}, ${rows.length} cenas.`);
}
main().catch((e) => { console.error(e); process.exit(1); });
