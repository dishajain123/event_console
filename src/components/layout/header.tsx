"use client";

import { useState } from "react";
import { LogOut, ChevronDown, User } from "lucide-react";
import { GlassPanel } from "@/components/ui/glass-panel";
import { useSessionStore } from "@/state/sessionStore";
import { useLogout } from "@/hooks/useAuth";

const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super Admin",
  operations_admin: "Operations Admin",
  finance_admin: "Finance Admin",
  finance_operator: "Finance Operator",
  finance_auditor: "Auditor",
  event_manager: "Event Manager",
};

export function Header({ title }: { title: string }) {
  const user = useSessionStore((s) => s.user);
  const roles = useSessionStore((s) => s.roles);
  const logout = useLogout();
  const [menuOpen, setMenuOpen] = useState(false);

  const primaryRoleLabel =
    roles.global.map((r) => ROLE_LABELS[r]).filter(Boolean)[0] ??
    (roles.scopedEventManagerEventIds.length > 0 ? "Event Manager" : "");

  return (
    <header className="fade-in sticky top-4 z-10 mb-6 flex items-center justify-between">
      <h1 className="text-xl font-semibold tracking-tight text-[var(--foreground)]">{title}</h1>

      <div className="relative">
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="glass-panel flex items-center gap-3 rounded-full py-1.5 pl-1.5 pr-3.5 transition-shadow hover:shadow-md"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent-soft)]">
            <User className="h-4 w-4 text-[var(--accent-strong)]" />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium leading-tight text-[var(--foreground)]">
              {user?.name || user?.mobile_number}
            </p>
            <p className="text-xs leading-tight text-[var(--foreground-muted)]">{primaryRoleLabel}</p>
          </div>
          <ChevronDown className="h-4 w-4 text-[var(--foreground-subtle)]" />
        </button>

        {menuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
            <GlassPanel
              strong
              padded={false}
              className="fade-in absolute right-0 z-20 mt-2 w-56 overflow-hidden py-1.5"
            >
              <div className="border-b border-black/[0.06] px-4 py-3">
                <p className="text-sm font-medium text-[var(--foreground)]">
                  {user?.name || "Console user"}
                </p>
                <p className="text-xs text-[var(--foreground-muted)]">{user?.mobile_number}</p>
              </div>
              <button
                onClick={logout}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-[var(--danger)] hover:bg-red-50/70"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </GlassPanel>
          </>
        )}
      </div>
    </header>
  );
}
