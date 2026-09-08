import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { env } from "@/config/env";

const REFRESH_COOKIE = "console_refresh_token";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_COOKIE)?.value;
  const body = await request.json().catch(() => ({}));
  cookieStore.delete(REFRESH_COOKIE);

  // Best-effort — logout is primarily a client-side token discard on
  // the backend today (stateless JWTs); this call is future-proofing
  // for when server-side revocation is added, and failures here should
  // never block the client from clearing its own session. Awaited (but
  // still swallowed on failure) so the call is actually given a chance
  // to complete before this serverless route handler returns and the
  // function may be frozen — an un-awaited fetch here isn't guaranteed
  // to be sent at all once revocation is real.
  await fetch(`${env.apiBaseUrl}/auth/logout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken, access_token: body?.access_token }),
  }).catch(() => {});

  return NextResponse.json({ ok: true });
}
