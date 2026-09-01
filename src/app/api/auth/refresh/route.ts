import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { env } from "@/config/env";

const REFRESH_COOKIE = "console_refresh_token";

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_COOKIE)?.value;

  if (!refreshToken) {
    return NextResponse.json({ message: "No session." }, { status: 401 });
  }

  const backendRes = await fetch(`${env.apiBaseUrl}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!backendRes.ok) {
    cookieStore.delete(REFRESH_COOKIE);
    return NextResponse.json({ message: "Session expired." }, { status: 401 });
  }

  const data = (await backendRes.json()) as { access_token: string; refresh_token: string };

  // The backend currently re-issues the same refresh_token unchanged on
  // refresh — re-setting it here is a no-op today, but keeps this route
  // correct automatically if that ever changes to real rotation.
  cookieStore.set(REFRESH_COOKIE, data.refresh_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return NextResponse.json({ access_token: data.access_token });
}
