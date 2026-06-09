// lib/builder/auth.ts
// Auth do builder por segredo compartilhado (ADMIN_TOKEN). NUNCA importar em código de cliente.
// O cookie guarda o sha256 do token (não o segredo cru); sem ADMIN_TOKEN o builder fica desabilitado.
import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const COOKIE_NAME = "builder_auth";

export function expectedCookieValue(): string | null {
  const token = process.env.ADMIN_TOKEN;
  if (!token) return null;
  return createHash("sha256").update(token).digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}

export function tokenMatches(candidate: string): boolean {
  const token = process.env.ADMIN_TOKEN;
  return !!token && !!candidate && safeEqual(candidate, token);
}

export async function isAuthorized(): Promise<boolean> {
  const expected = expectedCookieValue();
  if (!expected) return false;
  const store = await cookies();
  const value = store.get(COOKIE_NAME)?.value;
  return !!value && safeEqual(value, expected);
}

export function unauthorized(): NextResponse {
  return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
}
