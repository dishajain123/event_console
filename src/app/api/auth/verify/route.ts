import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { env } from "@/config/env";

const REFRESH_COOKIE = "console_refresh_token";

export async function POST(request: Request) {
  const body = await request.json();

  const backendRes = await fetch(`${env.apiBaseUrl}/auth/otp/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!backendRes.ok) {
    const errorBody = await backendRes.json().catch(() => ({}));
    return NextResponse.json(
      { message: errorBody?.message ?? "Verification failed." },
      { status: backendRes.status },
    );
  }

  const data = (await backendRes.json()) as { access_token: string; refresh_token: string };

  const cookieStore = await cookies();
  cookieStore.set(REFRESH_COOKIE, data.refresh_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    // Matches the backend's REFRESH_TOKEN_EXPIRE_DAYS default (30 days).
    maxAge: 60 * 60 * 24 * 30,
  });

  return NextResponse.json({ access_token: data.access_token });
}
