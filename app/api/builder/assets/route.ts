// app/api/builder/assets/route.ts
// Lista keys existentes no bucket R2 por prefixo, para o "Procurar" do MediaPicker.
import { NextResponse } from "next/server";
import { ListObjectsV2Command } from "@aws-sdk/client-s3";
import { isAuthorized, unauthorized } from "@/lib/builder/auth";
import { CONTENT_TYPE, getR2Client, hasR2Config } from "@/lib/builder/r2";

export const runtime = "nodejs";

const KNOWN_EXT = new Set(Object.keys(CONTENT_TYPE));

export async function GET(req: Request) {
  if (!(await isAuthorized())) return unauthorized();
  if (!hasR2Config()) {
    return NextResponse.json({ error: "R2 não configurado no servidor." }, { status: 500 });
  }
  const { searchParams } = new URL(req.url);
  const prefix = searchParams.get("prefix") ?? "";
  try {
    const { s3, bucket } = getR2Client();
    const keys: string[] = [];
    let token: string | undefined;
    do {
      const page = await s3.send(
        new ListObjectsV2Command({ Bucket: bucket, Prefix: prefix, ContinuationToken: token })
      );
      for (const obj of page.Contents ?? []) {
        const key = obj.Key ?? "";
        const ext = key.slice(key.lastIndexOf(".")).toLowerCase();
        if (KNOWN_EXT.has(ext)) keys.push(key);
      }
      token = page.IsTruncated ? page.NextContinuationToken : undefined;
    } while (token && keys.length < 2000);
    return NextResponse.json({ keys: keys.sort() });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao listar assets.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
