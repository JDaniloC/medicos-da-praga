// app/api/builder/upload/route.ts
// Upload de mídia para o R2 a partir do builder (multipart: file, prefix, name?).
import { NextResponse } from "next/server";
import { extname } from "node:path";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { isAuthorized, unauthorized } from "@/lib/builder/auth";
import { CONTENT_TYPE, getR2Client, hasR2Config } from "@/lib/builder/r2";
import { sanitizeAssetName } from "@/lib/builder/media-utils";
import { imageUrl } from "@/lib/images/assets";

export const runtime = "nodejs";

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB local; na Vercel o limite de body é ~4,5 MB.
const PREFIX_RE = /^[a-z0-9][a-z0-9/_-]*$/;

export async function POST(req: Request) {
  if (!(await isAuthorized())) return unauthorized();
  if (!hasR2Config()) {
    return NextResponse.json({ error: "R2 não configurado no servidor." }, { status: 500 });
  }
  try {
    const form = await req.formData();
    const file = form.get("file");
    const prefix = String(form.get("prefix") ?? "");
    const rawName = form.get("name");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Arquivo ausente." }, { status: 400 });
    }
    if (!PREFIX_RE.test(prefix) || prefix.includes("..")) {
      return NextResponse.json({ error: "Prefixo inválido." }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "Arquivo acima de 8 MB." }, { status: 413 });
    }
    const ext = extname(file.name).toLowerCase();
    const contentType = CONTENT_TYPE[ext];
    if (!contentType) {
      return NextResponse.json(
        { error: `Extensão não suportada (${ext || "sem extensão"}). Use webp/png/jpg/mp3/ogg/wav.` },
        { status: 400 }
      );
    }

    const base = sanitizeAssetName(
      typeof rawName === "string" && rawName ? rawName : file.name.slice(0, -ext.length)
    );
    const key = `${prefix}/${base}${ext}`;

    const { s3, bucket } = getR2Client();
    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: Buffer.from(await file.arrayBuffer()),
        ContentType: contentType,
      })
    );
    return NextResponse.json({ key, url: imageUrl(key) });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro no upload.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
