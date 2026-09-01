import { create } from "zustand";
import type { UserOut } from "@/types/identity";
import type { MyRoleAssignment, RoleName } from "@/types/rbac";

export interface SessionRoles {
  /** Global (unscoped) roles this user holds — apply everywhere. */
  global: RoleName[];
  /** event_ids this user holds a scoped Event Manager role for. */
  scopedEventManagerEventIds: string[];
}

interface SessionState {
  accessToken: string | null;
  user: UserOut | null;
  roles: SessionRoles;
  hydrated: boolean;

  setAccessToken: (token: string) => void;
  setUser: (user: UserOut) => void;
  setRoleAssignments: (assignments: MyRoleAssignment[]) => void;
  clearSession: () => void;
  setHydrated: (value: boolean) => void;
}

const emptyRoles: SessionRoles = { global: [], scopedEventManagerEventIds: [] };

/**
 * In-memory only — the access token deliberately never touches
 * localStorage/sessionStorage (XSS surface). It's re-obtained from the
 * httpOnly refresh cookie on page load via /api/auth/refresh, which is
 * what `hydrated` tracks (has that bootstrap attempt completed yet).
 */
export const useSessionStore = create<SessionState>((set) => ({
  accessToken: null,
  user: null,
  roles: emptyRoles,
  hydrated: false,

  setAccessToken: (token) => set({ accessToken: token }),
  setUser: (user) => set({ user }),
  setRoleAssignments: (assignments) => {
    const global: RoleName[] = [];
    const scopedEventManagerEventIds: string[] = [];
    for (const a of assignments) {
      if (a.status !== "active") continue;
      if (a.event_id === null) {
        global.push(a.role_name);
      } else if (a.role_name === "event_manager") {
        scopedEventManagerEventIds.push(a.event_id);
      }
    }
    set({ roles: { global, scopedEventManagerEventIds } });
  },
  clearSession: () => set({ accessToken: null, user: null, roles: emptyRoles }),
  setHydrated: (value) => set({ hydrated: value }),
}));

export function hasGlobalRole(roles: SessionRoles, ...names: RoleName[]): boolean {
  return names.some((n) => roles.global.includes(n));
}

export function isScopedEventManagerFor(roles: SessionRoles, eventId: string): boolean {
  return roles.scopedEventManagerEventIds.includes(eventId);
}

export function isConsoleUser(roles: SessionRoles): boolean {
  return (
    roles.global.length > 0 ||
    roles.scopedEventManagerEventIds.length > 0
  );
}

