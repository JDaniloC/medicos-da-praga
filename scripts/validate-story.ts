// scripts/validate-story.ts
import { readFileSync } from "node:fs";
import { validateAct } from "../lib/story/validate";

const path = process.argv[2];
if (!path) {
  console.error("Uso: npm run validate:story <arquivo.json>");
  process.exit(1);
}
const json = JSON.parse(readFileSync(path, "utf8"));
const result = validateAct(json);
if (result.ok) {
  console.log(`OK — ato ${result.act.act} com ${result.act.nodes.length} nós válido.`);
} else {
  console.error("INVÁLIDO:");
  for (const e of result.errors) console.error(" - " + e);
  process.exit(1);
}
