// app/api/narrate/route.ts
import { NextResponse } from "next/server";
import { generateNarration } from "@/lib/gemini/client";
import { buildNarrationPrompt, NARRATOR_SYSTEM, type NarrationInput } from "@/lib/gemini/prompts";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as NarrationInput;
    if (!body?.brief || !body?.worldContext) {
      return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
    }
    const prompt = buildNarrationPrompt(body);
    const text = await generateNarration(prompt, NARRATOR_SYSTEM);
    return NextResponse.json({ text });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro desconhecido na narração.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
