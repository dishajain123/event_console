"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useSessionStore } from "@/state/sessionStore";
import { useBootstrapSession } from "@/hooks/useAuth";

export function RoleGuard({
  children,
  allow,
}: {
  children: ReactNode;
  /** Returns true if the current session's roles are allowed here. */
  allow: (roles: ReturnType<typeof useSessionStore.getState>["roles"]) => boolean;
}) {
  useBootstrapSession();
  const router = useRouter();
  const hydrated = useSessionStore((s) => s.hydrated);
  const user = useSessionStore((s) => s.user);
  const roles = useSessionStore((s) => s.roles);

  useEffect(() => {
    if (!hydrated) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (!allow(roles)) {
      router.replace("/no-access");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, user, roles]);

  if (!hydrated || !user || !allow(roles)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-[var(--foreground-muted)]">
          <Loader2 className="h-6 w-6 animate-spin text-[var(--accent)]" />
          <p className="text-sm">Loading your workspace…</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
