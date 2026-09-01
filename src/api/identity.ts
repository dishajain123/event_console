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

export async function logout(): Promise<void> {
  await fetch("/api/auth/logout", { method: "POST" });
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

export async function listAccounts(): Promise<AccountOut[]> {
  const { data } = await apiClient.get<AccountOut[]>("/users/accounts");
  return data;
}

export async function updateAccountStatus(userId: string, payload: AccountStatusUpdateIn): Promise<UserOut> {
  const { data } = await apiClient.patch<UserOut>(`/users/${userId}/status`, payload);
  return data;
}
