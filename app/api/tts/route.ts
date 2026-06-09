import { NextResponse } from "next/server";
import { synthesizeSpeech, DEFAULT_VOICE } from "@/lib/tts/edge";

export const runtime = "nodejs";

interface TtsRequest {
  text?: string;
  voice?: string;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as TtsRequest;
    const text = body?.text?.trim();
    if (!text) {
      return NextResponse.json({ error: "Texto vazio." }, { status: 400 });
    }
    const mp3 = await synthesizeSpeech(text, body.voice || DEFAULT_VOICE);
    return new Response(new Uint8Array(mp3), {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro desconhecido na síntese de voz.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
