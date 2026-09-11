"use client";

import { LogOut, ChevronDown, User } from "lucide-react";
import { Popover } from "@/components/ui/popover";
import { useSessionStore } from "@/state/sessionStore";
import { useLogout } from "@/hooks/useAuth";

const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super Admin",
  operations_admin: "Operations Admin",
  finance_admin: "Finance Admin",
  finance_operator: "Finance Operator",
  finance_auditor: "Finance Auditor",
  event_manager: "Event Manager",
};

/**
 * Same session data and the same `logout()` call as before. The
 * account menu is now built on the shared, viewport-aware [Popover]
 * instead of a bespoke absolute-positioned [GlassPanel] plus a
 * manually-wired `fixed inset-0` outside-click catcher — one less
 * place in the app implementing its own dropdown positioning, while
 * keeping the exact same panel content (name/mobile header + sign out).
 */
export function Header({ title }: { title: string }) {
  const user = useSessionStore((s) => s.user);
  const roles = useSessionStore((s) => s.roles);
  const logout = useLogout();

  const primaryRoleLabel =
    roles.global.map((r) => ROLE_LABELS[r]).filter(Boolean)[0] ??
    (roles.scopedEventManagerEventIds.length > 0 ? "Event Manager" : "");

  return (
    <header
      className="fade-in sticky top-4 z-20 -mx-2 mb-5 flex items-center justify-between rounded-[var(--radius-md)]
        bg-[var(--background)]/90 px-2 py-2 backdrop-blur-md
        supports-[backdrop-filter]:bg-[var(--background)]/75"
    >
      <h1 className="text-lg font-semibold tracking-tight text-[var(--foreground)]">{title}</h1>

      <Popover
        align="end"
        panelClassName="w-56 overflow-hidden py-1.5"
        renderTrigger={({ toggle }) => (
          <button
            onClick={toggle}
            className="focus-ring glass-panel flex items-center gap-2.5 rounded-full py-1 pl-1 pr-3 transition-colors hover:bg-[var(--surface-muted)]"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--accent-soft)]">
              <User className="h-3.5 w-3.5 text-[var(--accent-strong)]" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium leading-tight text-[var(--foreground)]">
                {user?.name || user?.mobile_number}
              </p>
              <p className="text-xs leading-tight text-[var(--foreground-muted)]">{primaryRoleLabel}</p>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-[var(--foreground-subtle)]" />
          </button>
        )}
      >
        <div className="border-b border-[var(--border)] px-4 py-3">
          <p className="text-sm font-medium text-[var(--foreground)]">{user?.name || "Console user"}</p>
          <p className="text-xs text-[var(--foreground-muted)]">{user?.mobile_number}</p>
        </div>
        <button
          onClick={logout}
          className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-[var(--danger)] hover:bg-red-50"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </Popover>
    </header>
  );
}