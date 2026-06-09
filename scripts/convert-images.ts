// Converte recursivamente PNG/JPG em WebP, preservando a estrutura de pastas.
// Uso:  npx tsx scripts/convert-images.ts [pasta] [--max=LARGURA] [--delete]
//   pasta   : raiz a varrer (padrão: "images")
//   --max=N : redimensiona para no máximo N px de largura (mantém proporção). Omitido = sem resize.
//   --delete: remove o arquivo de origem após converter com sucesso.
// Qualidade via env WEBP_QUALITY (padrão 80).
import { readdirSync, statSync, rmSync } from "node:fs";
import { join, extname } from "node:path";
import sharp from "sharp";

const args = process.argv.slice(2);
const root = args.find((a) => !a.startsWith("--")) ?? "images";
const maxArg = args.find((a) => a.startsWith("--max="));
const maxWidth = maxArg ? Number(maxArg.split("=")[1]) : undefined;
const del = args.includes("--delete");
const quality = Number(process.env.WEBP_QUALITY ?? 80);

const SRC = new Set([".png", ".jpg", ".jpeg"]);

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (SRC.has(extname(p).toLowerCase())) out.push(p);
  }
  return out;
}

const mb = (n: number) => (n / 1048576).toFixed(1);

async function main() {
  const files = walk(root);
  if (!files.length) {
    console.log(`Nenhuma imagem (png/jpg) encontrada em "${root}".`);
    return;
  }
  let inBytes = 0;
  let outBytes = 0;
  for (const src of files) {
    const dest = src.replace(/\.(png|jpe?g)$/i, ".webp");
    let pipe = sharp(src);
    if (maxWidth) pipe = pipe.resize({ width: maxWidth, withoutEnlargement: true });
    const info = await pipe.webp({ quality }).toFile(dest);
    const inSize = statSync(src).size;
    inBytes += inSize;
    outBytes += info.size;
    console.log(`${src} -> ${dest}  ${(info.size / 1024).toFixed(0)} KB`);
    if (del) rmSync(src);
  }
  console.log(
    `\n${files.length} imagens · origem ${mb(inBytes)}MB -> WebP ${mb(outBytes)}MB ` +
      `(q=${quality}${maxWidth ? `, max=${maxWidth}px` : ", sem resize"}${del ? ", originais removidos" : ""})`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
