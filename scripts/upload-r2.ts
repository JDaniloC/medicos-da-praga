// Sobe as imagens estáticas (.webp) para um bucket Cloudflare R2 (API S3-compatível).
// Uso:  npm run upload:r2 [pasta]   (padrão: "images")
// As chaves vêm do .env.local (NUNCA commitadas):
//   R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET
// A key de cada objeto é o caminho relativo à pasta (ex.: images/scenes/cena1.webp -> scenes/cena1.webp),
// batendo com o que o app monta via NEXT_PUBLIC_R2_BASE_URL + imageUrl(path).
import "dotenv/config";
import { readdirSync, statSync, readFileSync } from "node:fs";
import { join, extname, relative, sep } from "node:path";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const root = process.argv[2] ?? "images";
const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET } = process.env;

if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET) {
  console.error(
    "Faltam variáveis no .env.local: R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET."
  );
  process.exit(1);
}

const CONTENT_TYPE: Record<string, string> = {
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
};

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY },
});

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

async function main() {
  const files = walk(root).filter((f) => extname(f).toLowerCase() === ".webp");
  if (!files.length) {
    console.error(`Nenhum .webp em "${root}". Rode "npm run images:webp" antes.`);
    process.exit(1);
  }
  let sent = 0;
  for (const file of files) {
    const key = relative(root, file).split(sep).join("/");
    await s3.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
        Body: readFileSync(file),
        ContentType: CONTENT_TYPE[extname(file).toLowerCase()] ?? "application/octet-stream",
      })
    );
    sent += 1;
    console.log(`↑ ${key}`);
  }
  console.log(`\n${sent} arquivos enviados para o bucket "${R2_BUCKET}".`);
  console.log("Defina NEXT_PUBLIC_R2_BASE_URL com a URL pública do bucket (ex.: https://pub-xxxx.r2.dev).");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
