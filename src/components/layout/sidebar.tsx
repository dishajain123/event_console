"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  CalendarDays,
  Layers3,
  ClipboardList,
  Users2,
  ShieldCheck,
  Image as ImageIcon,
  Handshake,
  MessageSquare,
  BarChart3,
  History,
  Wallet,
  Receipt,
  Scale,
  RotateCcw,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSessionStore } from "@/state/sessionStore";
import { useUiStore } from "@/state/uiStore";
import {
  isOperationsAdmin,
  isScopedOnlyEventManager,
  canAccessFinanceConsole,
  canAccessAccountManagement,
} from "@/lib/rbac";

interface NavItem {
  label: string;
  href: string;
  icon: typeof LayoutGrid;
}

function useOpsNavItems(): NavItem[] {
  const roles = useSessionStore((s) => s.roles);

  if (isScopedOnlyEventManager(roles)) {
    const eventId = roles.scopedEventManagerEventIds[0];
    return [
      { label: "Configuration", href: `/ops/events/${eventId}/configure`, icon: ClipboardList },
      { label: "My Reports", href: `/ops/events/${eventId}/reports`, icon: BarChart3 },
    ];
  }

  const items: NavItem[] = [
    { label: "Dashboard", href: "/ops/dashboard", icon: LayoutGrid },
    { label: "Events", href: "/ops/events", icon: CalendarDays },
    { label: "Categories", href: "/ops/categories", icon: Layers3 },
  ];

  if (canAccessAccountManagement(roles)) {
    items.push({ label: "Accounts", href: "/ops/accounts", icon: Users2 });
  }

  items.push(
    { label: "Media", href: "/ops/content/media", icon: ImageIcon },
    { label: "Sponsors", href: "/ops/content/sponsors", icon: Handshake },
    { label: "Communication", href: "/ops/communication", icon: MessageSquare },
    { label: "Reports", href: "/ops/reports", icon: BarChart3 },
    { label: "Audit Log", href: "/ops/audit-log", icon: History },
  );

  return items;
}

function useFinanceNavItems(): NavItem[] {
  const roles = useSessionStore((s) => s.roles);
  const items: NavItem[] = [{ label: "Dashboard", href: "/finance/dashboard", icon: Wallet }];

  if (canAccessFinanceConsole(roles)) {
    items.push(
      { label: "Transactions", href: "/finance/transactions", icon: Receipt },
      { label: "Reconciliation", href: "/finance/reconciliation", icon: Scale },
      { label: "Refunds", href: "/finance/refunds", icon: RotateCcw },
      { label: "Reports", href: "/finance/reports", icon: BarChart3 },
    );
  }

  if (canAccessAccountManagement(roles)) {
    items.splice(1, 0, { label: "Accounts", href: "/finance/accounts", icon: Users2 });
  }
  return items;
}

export function Sidebar({ area }: { area: "ops" | "finance" }) {
  const pathname = usePathname();
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const toggleCollapsed = useUiStore((s) => s.toggleSidebarCollapsed);
  const roles = useSessionStore((s) => s.roles);

  const opsItems = useOpsNavItems();
  const financeItems = useFinanceNavItems();
  const items = area === "ops" ? opsItems : financeItems;
  const canSwitch = area === "ops" ? canAccessFinanceConsole(roles) : isOperationsAdmin(roles);
  const scopedOnly = isScopedOnlyEventManager(roles);

  return (
    <aside
      className={cn(
        "glass-panel-dark fade-in sticky top-4 flex h-[calc(100vh-2rem)] flex-col rounded-[var(--radius-lg)] transition-[width] duration-200",
        collapsed ? "w-[76px]" : "w-64",
      )}
    >
      <div className="flex items-center gap-3 px-4 py-5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--accent)] shadow-lg shadow-indigo-900/30">
          <ShieldCheck className="h-5 w-5 text-white" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[var(--dark-foreground)]">Event Console</p>
            <p className="truncate text-xs text-[var(--dark-foreground-muted)]">
              {area === "ops" ? "Operations" : "Finance"}
            </p>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-white/10 text-white"
                  : "text-[var(--dark-foreground-muted)] hover:bg-white/[0.06] hover:text-white",
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon className={cn("h-[18px] w-[18px] shrink-0", active && "text-[var(--accent)]")} />
              {!collapsed && <span className="truncate">{item.label}</span>}
              {active && !collapsed && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
              )}
            </Link>
          );
        })}
      </nav>

      {!scopedOnly && canSwitch && (
        <div className="border-t border-white/[0.08] p-3">
          <Link
            href={area === "ops" ? "/finance/dashboard" : "/ops/dashboard"}
            className="flex items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2.5 text-sm font-medium text-[var(--dark-foreground-muted)] hover:bg-white/[0.06] hover:text-white"
          >
            {area === "ops" ? <Wallet className="h-[18px] w-[18px]" /> : <LayoutGrid className="h-[18px] w-[18px]" />}
            {!collapsed && <span>Switch to {area === "ops" ? "Finance" : "Operations"}</span>}
          </Link>
        </div>
      )}

      <div className="border-t border-white/[0.08] p-3">
        <button
          onClick={toggleCollapsed}
          className="flex w-full items-center justify-center gap-2 rounded-[var(--radius-sm)] py-2 text-[var(--dark-foreground-muted)] hover:bg-white/[0.06] hover:text-white"
        >
          {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
        </button>
      </div>
    </aside>
  );
}
