import { apiClient } from "@/api/client";
import type { AccountOut, AccountStatusUpdateIn, OTPRequestOut, UserOut } from "@/types/identity";

/**
 * OTP request carries no secrets, so it goes straight to the backend —
 * only the two token-issuing calls (verify, refresh) are proxied
 * through Next.js route handlers, since those are what set the
 * httpOnly refresh-token cookie.
 */
export async function requestOtp(mobileNumber: string): Promise<OTPRequestOut> {
  const { data } = await apiClient.post<OTPRequestOut>("/auth/otp/request", {
    mobile_number: mobileNumber,
  });
  return data;
}

/** Proxied through /api/auth/verify — see that route handler for why. */
export async function verifyOtp(mobileNumber: string, otp: string): Promise<{ access_token: string }> {
  const res = await fetch("/api/auth/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mobile_number: mobileNumber, otp }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.message ?? "Invalid or expired code. Please try again.");
  }
  return res.json();
}

export async function loginEmail(email: string, password: string): Promise<{ access_token: string }> {
  const res = await fetch("/api/auth/email-login", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.message ?? "Invalid email or password.");
  }
  return res.json();
}

export async function requestPasswordReset(email: string): Promise<OTPRequestOut> {
  const { data } = await apiClient.post<OTPRequestOut>("/auth/email/password-reset/request", { email });
  return data;
}

export async function resetPassword(email: string, code: string, newPassword: string): Promise<void> {
  await apiClient.post("/auth/email/password-reset", { email, code, new_password: newPassword });
}

export async function logout(accessToken?: string): Promise<void> {
  await fetch("/api/auth/logout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ access_token: accessToken }) });
}

export async function getMe(): Promise<UserOut> {
  const { data } = await apiClient.get<UserOut>("/users/me");
  return data;
}

/**
 * Console-only admin-provisioning path (see backend §0 gap fix): finds
 * or creates a bare User for a mobile number so a global role can be
 * assigned to someone who's never opened the public app.
 */
export async function findOrCreateUserForProvisioning(
  mobileNumber: string,
  name?: string,
): Promise<UserOut> {
  const { data } = await apiClient.post<UserOut>("/users/find-or-create", {
    mobile_number: mobileNumber,
    name: name || undefined,
  });
  return data;
}

export type AccountPage = { items: AccountOut[]; total: number; page: number; page_size: number };
/**
 * Same endpoint and the same two query params as before
 * (`page`/`page_size`) — nothing about the request contract changed.
 * What changed: the page size is now a parameter (defaulting to 100,
 * up from a hardcoded 25) so the Account Management screen's search
 * and role filter have more than one page's worth of accounts to work
 * against without the console silently truncating the list. `page` is
 * exposed too, wired to a real Pagination control for the rare case an
 * organization has more than 100 admin/staff accounts.
 */
export async function listAccounts(params?: { page?: number; pageSize?: number }): Promise<AccountPage> {
  const { data } = await apiClient.get<AccountPage>("/users/accounts", {
    params: { page: params?.page ?? 1, page_size: params?.pageSize ?? 100 },
  });
  return data;
}

export async function updateAccountStatus(userId: string, payload: AccountStatusUpdateIn): Promise<UserOut> {
  const { data } = await apiClient.patch<UserOut>(`/users/${userId}/status`, payload);
  return data;
}