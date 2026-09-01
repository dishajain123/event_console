import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { env } from "@/config/env";

const REFRESH_COOKIE = "console_refresh_token";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete(REFRESH_COOKIE);

  // Best-effort — logout is primarily a client-side token discard on
  // the backend today (stateless JWTs); this call is future-proofing
  // for when server-side revocation is added, and failures here should
  // never block the client from clearing its own session.
  fetch(`${env.apiBaseUrl}/auth/logout`, { method: "POST" }).catch(() => {});

  return NextResponse.json({ ok: true });
}
