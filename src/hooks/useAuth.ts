"use client";

import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { getMe, requestOtp as apiRequestOtp, verifyOtp as apiVerifyOtp, logout as apiLogout } from "@/api/identity";
import { listMyRoleAssignments } from "@/api/rbac";
import { useSessionStore } from "@/state/sessionStore";

/**
 * Runs once at the root of the app: attempts a silent refresh against
 * the httpOnly cookie so a page reload doesn't force a re-login, then
 * loads the user + their resolved roles. `hydrated` flips to true
 * whether or not a session was found — route guards wait on this
 * before deciding to redirect, so a logged-in user is never
 * flash-redirected to /login while the refresh is still in flight.
 */
export function useBootstrapSession() {
  const { setAccessToken, setUser, setRoleAssignments, clearSession, setHydrated, hydrated } =
    useSessionStore();

  useEffect(() => {
    if (hydrated) return;

    let cancelled = false;

    async function bootstrap() {
      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), 8000);

      try {
        const res = await fetch("/api/auth/refresh", { method: "POST", signal: controller.signal });
        if (!res.ok) throw new Error("no session");
        const { access_token } = (await res.json()) as { access_token: string };
        if (cancelled) return;

        setAccessToken(access_token);
        const [user, roleAssignments] = await Promise.all([getMe(), listMyRoleAssignments()]);
        if (cancelled) return;

        setUser(user);
        setRoleAssignments(roleAssignments);
      } catch {
        if (!cancelled) clearSession();
      } finally {
        window.clearTimeout(timeoutId);
        if (!cancelled) setHydrated(true);
      }
    }

    bootstrap();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);
}

export function useLogin() {
  const setAccessToken = useSessionStore((s) => s.setAccessToken);
  const setUser = useSessionStore((s) => s.setUser);
  const setRoleAssignments = useSessionStore((s) => s.setRoleAssignments);
  const queryClient = useQueryClient();

  const requestOtp = useCallback(async (mobileNumber: string) => {
    return apiRequestOtp(mobileNumber);
  }, []);

  const verifyOtp = useCallback(
    async (mobileNumber: string, otp: string) => {
      const { access_token } = await apiVerifyOtp(mobileNumber, otp);
      setAccessToken(access_token);

      const [user, roleAssignments] = await Promise.all([getMe(), listMyRoleAssignments()]);
      setUser(user);
      setRoleAssignments(roleAssignments);
      queryClient.clear();

      return { user, roleAssignments };
    },
    [setAccessToken, setUser, setRoleAssignments, queryClient],
  );

  return { requestOtp, verifyOtp };
}

export function useLogout() {
  const clearSession = useSessionStore((s) => s.clearSession);
  const queryClient = useQueryClient();
  const router = useRouter();

  return useCallback(async () => {
    await apiLogout();
    clearSession();
    queryClient.clear();
    router.replace("/login");
  }, [clearSession, queryClient, router]);
}
