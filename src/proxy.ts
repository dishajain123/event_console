import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const REFRESH_COOKIE = "console_refresh_token";
const PUBLIC_PATHS = ["/login"];

/**
 * This is a fast, cookie-presence check only — NOT the real
 * authorization layer. It exists purely to stop an unauthenticated
 * browser from ever rendering a protected shell before redirecting
 * (avoiding a flash of console UI). The actual role/scope
 * authorization happens (a) in RoleGuard client-side, using the
 * resolved roles from /users/me/role-assignments, and (b) on every
 * single API call, enforced by the backend — this proxy could be
 * deleted entirely and no real permission boundary would be lost.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p)) || pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  const hasSession = request.cookies.has(REFRESH_COOKIE);
  if (!hasSession && pathname !== "/") {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Run on everything except static assets and Next internals —
     * negative-match pattern per the framework's own recommendation.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)",
  ],
};
