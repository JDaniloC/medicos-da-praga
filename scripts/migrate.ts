// Aplica as migrations SQL (supabase/migrations/*.sql) num Postgres via SUPABASE_DB_URL.
// Uso:  npm run db:migrate
// SUPABASE_DB_URL vem do .env.local (Supabase > Settings > Database > Connection string > URI).
import dotenv from "dotenv";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { Client } from "pg";

dotenv.config({ path: [".env.local", ".env"] });

const url = process.env.SUPABASE_DB_URL;
if (!url) {
  console.error("SUPABASE_DB_URL não configurado no .env.local.");
  process.exit(1);
}

async function main() {
  const dir = "supabase/migrations";
  const files = readdirSync(dir)
    .filter((f) => f.endsWith(".sql"))
    .sort();
  if (!files.length) {
    console.log("Nenhuma migration .sql encontrada.");
    return;
  }
  const client = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
  await client.connect();
  try {
    for (const f of files) {
      const sql = readFileSync(join(dir, f), "utf8");
      console.log(`Aplicando ${f}…`);
      await client.query(sql);
    }
    console.log(`OK — ${files.length} migration(s) aplicada(s).`);
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
