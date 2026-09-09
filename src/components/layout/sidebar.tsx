"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  CalendarDays,
  FileStack,
  Layers3,
  ClipboardList,
  Users2,
  UserRoundCheck,
  ShieldCheck,
  ShieldAlert,
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
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSessionStore } from "@/state/sessionStore";
import { useUiStore } from "@/state/uiStore";
import { Tooltip } from "@/components/ui/tooltip";
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

interface NavSection {
  label: string;
  items: NavItem[];
}

/** Unchanged from before — same sections, same RBAC gating, same hrefs. */
function useOpsNavSections(): NavSection[] {
  const roles = useSessionStore((s) => s.roles);

  if (isScopedOnlyEventManager(roles)) {
    const eventId = roles.scopedEventManagerEventIds[0];
    return [
      {
        label: "Event Workspace",
        items: [
          { label: "Configuration", href: `/ops/events/${eventId}/configure`, icon: ClipboardList },
          { label: "Registrations", href: `/ops/events/${eventId}/registrations`, icon: Users2 },
          { label: "Tickets & Access", href: `/ops/events/${eventId}/access`, icon: ShieldCheck },
          { label: "Check-in & Attendance", href: `/ops/events/${eventId}/attendance`, icon: UserRoundCheck },
          { label: "Teams", href: `/ops/events/${eventId}/teams`, icon: Users2 },
          { label: "Competitions", href: `/ops/events/${eventId}/competitions`, icon: CalendarDays },
          { label: "Waitlist", href: `/ops/events/${eventId}/waitlist`, icon: ClipboardList },
          { label: "Incidents", href: `/ops/incidents?event_id=${eventId}`, icon: ShieldAlert },
          { label: "Reports", href: `/ops/events/${eventId}/reports`, icon: BarChart3 },
          { label: "Analytics", href: `/ops/events/${eventId}/analytics`, icon: BarChart3 },
          { label: "Feedback", href: `/ops/events/${eventId}/feedback`, icon: MessageSquare },
          { label: "Networking", href: `/ops/events/${eventId}/networking`, icon: Users2 },
        ],
      },
      {
        label: "People & Staffing",
        items: [
          { label: "Volunteers", href: "/ops/volunteers", icon: UserRoundCheck },
          { label: "Volunteer shifts", href: "/ops/volunteer-shifts", icon: CalendarDays },
        ],
      },
    ];
  }

  const sections: NavSection[] = [
    {
      label: "Command Center",
      items: [{ label: "Dashboard", href: "/ops/dashboard", icon: LayoutGrid }],
    },
    {
      label: "Event Setup",
      items: [
        { label: "Categories", href: "/ops/categories", icon: Layers3 },
        { label: "Events", href: "/ops/events", icon: CalendarDays },
        { label: "Event Templates", href: "/ops/event-templates", icon: FileStack },
      ],
    },
    {
      label: "Event Operations",
      items: [{ label: "Incidents", href: "/ops/incidents", icon: ShieldAlert }],
    },
    {
      label: "People & Staffing",
      items: [
        { label: "Volunteers", href: "/ops/volunteers", icon: UserRoundCheck },
        { label: "Volunteer shifts", href: "/ops/volunteer-shifts", icon: CalendarDays },
      ],
    },
    {
      label: "Content & Engagement",
      items: [
        { label: "Media", href: "/ops/content/media", icon: ImageIcon },
        { label: "Sponsors", href: "/ops/content/sponsors", icon: Handshake },
        { label: "Communication", href: "/ops/communication", icon: MessageSquare },
        { label: "Feedback", href: "/ops/feedback", icon: MessageSquare },
      ],
    },
    {
      label: "Reports & Governance",
      items: [
        { label: "Reports", href: "/ops/reports", icon: BarChart3 },
        { label: "Audit Log", href: "/ops/audit-log", icon: History },
      ],
    },
  ];

  if (canAccessAccountManagement(roles)) {
    sections.push({
      label: "Administration",
      items: [{ label: "Admin Accounts", href: "/ops/admin-accounts", icon: Users2 }],
    });
  }

  return sections;
}

/** Unchanged from before. */
function useFinanceNavSections(): NavSection[] {
  const roles = useSessionStore((s) => s.roles);
  const sections: NavSection[] = [
    {
      label: "Finance Command Center",
      items: [{ label: "Dashboard", href: "/finance/dashboard", icon: Wallet }],
    },
  ];

  if (canAccessFinanceConsole(roles)) {
    sections.push({
      label: "Financial Operations",
      items: [
        { label: "Transactions", href: "/finance/transactions", icon: Receipt },
        { label: "Refunds", href: "/finance/refunds", icon: RotateCcw },
        { label: "Reconciliation", href: "/finance/reconciliation", icon: Scale },
      ],
    });
  }

  if (canAccessAccountManagement(roles)) {
    sections.push({
      label: "Financial Reporting",
      items: [{ label: "Financial Reports", href: "/finance/reports", icon: BarChart3 }],
    });
    sections.push({
      label: "Finance Administration",
      items: [{ label: "Finance Accounts", href: "/finance/accounts", icon: Users2 }],
    });
  } else if (canAccessFinanceConsole(roles)) {
    sections.push({
      label: "Financial Reporting",
      items: [{ label: "Financial Reports", href: "/finance/reports", icon: BarChart3 }],
    });
  }
  return sections;
}

/**
 * Navigation, RBAC gating, and the collapse-to-icons behavior are all
 * unchanged from before. What's new: each section heading is now its
 * own expand/collapse toggle (so a long nav can be tidied without
 * hiding the whole sidebar), and collapsed-mode items use the new
 * [Tooltip] component instead of the native `title` attribute, so the
 * label actually appears promptly and consistently instead of relying
 * on the browser's built-in (slow, unstyled) tooltip.
 */
export function Sidebar({ area }: { area: "ops" | "finance" }) {
  const pathname = usePathname();
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const toggleCollapsed = useUiStore((s) => s.toggleSidebarCollapsed);
  const roles = useSessionStore((s) => s.roles);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

  const opsSections = useOpsNavSections();
  const financeSections = useFinanceNavSections();
  const sections = area === "ops" ? opsSections : financeSections;
  const canSwitch = area === "ops" ? canAccessFinanceConsole(roles) : isOperationsAdmin(roles);
  const scopedOnly = isScopedOnlyEventManager(roles);

  function toggleSection(label: string) {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  }

  return (
    <aside
      className={cn(
        "glass-panel-dark fade-in sticky top-4 flex h-[calc(100vh-2rem)] flex-col rounded-[var(--radius-lg)] transition-[width] duration-200",
        collapsed ? "w-[68px]" : "w-60",
      )}
    >
      <div className="flex items-center gap-3 px-3.5 py-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--accent)]">
          <ShieldCheck className="h-4 w-4 text-white" />
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

      <nav className="flex-1 space-y-1 overflow-y-auto px-2.5 py-2">
        {sections.map((section) => {
          const sectionCollapsed = collapsedSections.has(section.label);
          return (
            <div key={section.label} className="pb-1">
              {!collapsed && (
                <button
                  type="button"
                  onClick={() => toggleSection(section.label)}
                  className="focus-ring group mb-1 flex w-full items-center justify-between rounded-[var(--radius-sm)] px-2.5 py-1.5 text-left"
                >
                  <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--dark-foreground-subtle)]">
                    {section.label}
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-3 w-3 text-[var(--dark-foreground-subtle)] transition-transform group-hover:text-[var(--dark-foreground-muted)]",
                      sectionCollapsed && "-rotate-90",
                    )}
                  />
                </button>
              )}
              {(!sectionCollapsed || collapsed) && (
                <div className="space-y-0.5">
                  {section.items.map((item) => {
                    const active = pathname === item.href || pathname.startsWith(item.href + "/");
                    const Icon = item.icon;
                    const link = (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "group flex items-center gap-2.5 rounded-[var(--radius-sm)] px-2.5 py-2 text-sm font-medium transition-colors",
                          active
                            ? "bg-white/10 text-white"
                            : "text-[var(--dark-foreground-muted)] hover:bg-white/[0.06] hover:text-white",
                        )}
                      >
                        <Icon className={cn("h-[17px] w-[17px] shrink-0", active && "text-[var(--accent)]")} />
                        {!collapsed && <span className="truncate">{item.label}</span>}
                        {active && !collapsed && (
                          <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
                        )}
                      </Link>
                    );
                    return collapsed ? (
                      <Tooltip key={item.href} label={item.label} side="right">
                        {link}
                      </Tooltip>
                    ) : (
                      link
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {!scopedOnly && canSwitch && (
        <div className="border-t border-white/[0.08] p-2.5">
          {collapsed ? (
            <Tooltip label={`Switch to ${area === "ops" ? "Finance" : "Operations"}`} side="right">
              <Link
                href={area === "ops" ? "/finance/dashboard" : "/ops/dashboard"}
                className="flex items-center justify-center rounded-[var(--radius-sm)] px-2.5 py-2 text-[var(--dark-foreground-muted)] hover:bg-white/[0.06] hover:text-white"
              >
                {area === "ops" ? <Wallet className="h-[17px] w-[17px]" /> : <LayoutGrid className="h-[17px] w-[17px]" />}
              </Link>
            </Tooltip>
          ) : (
            <Link
              href={area === "ops" ? "/finance/dashboard" : "/ops/dashboard"}
              className="flex items-center gap-2.5 rounded-[var(--radius-sm)] px-2.5 py-2 text-sm font-medium text-[var(--dark-foreground-muted)] hover:bg-white/[0.06] hover:text-white"
            >
              {area === "ops" ? <Wallet className="h-[17px] w-[17px]" /> : <LayoutGrid className="h-[17px] w-[17px]" />}
              <span>Switch to {area === "ops" ? "Finance" : "Operations"}</span>
            </Link>
          )}
        </div>
      )}

      <div className="border-t border-white/[0.08] p-2.5">
        <button
          onClick={toggleCollapsed}
          className="focus-ring flex w-full items-center justify-center gap-2 rounded-[var(--radius-sm)] py-1.5 text-[var(--dark-foreground-muted)] hover:bg-white/[0.06] hover:text-white"
        >
          {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
        </button>
      </div>
    </aside>
  );
}