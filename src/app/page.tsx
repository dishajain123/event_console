"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useSessionStore } from "@/state/sessionStore";
import { useBootstrapSession } from "@/hooks/useAuth";
import { getPostLoginRedirect } from "@/lib/rbac";

export default function RootPage() {
  useBootstrapSession();
  const router = useRouter();
  const hydrated = useSessionStore((s) => s.hydrated);
  const user = useSessionStore((s) => s.user);
  const roles = useSessionStore((s) => s.roles);

  useEffect(() => {
    if (!hydrated) return;
    router.replace(user ? getPostLoginRedirect(roles) : "/login");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, user, roles]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-[var(--accent)]" />
    </div>
  );
}
