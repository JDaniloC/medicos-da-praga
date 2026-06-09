// app/api/builder/login/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE_NAME, expectedCookieValue, tokenMatches } from "@/lib/builder/auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let token = "";
  try {
    const body = (await req.json()) as { token?: string };
    token = body?.token ?? "";
  } catch {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }

  const cookieValue = expectedCookieValue();
  if (!cookieValue || !tokenMatches(token)) {
    return NextResponse.json({ error: "Token inválido." }, { status: 401 });
  }

  const store = await cookies();
  store.set(COOKIE_NAME, cookieValue, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return NextResponse.json({ ok: true });
}
