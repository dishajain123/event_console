import type { SessionRoles } from "@/state/sessionStore";

/**
 * These helpers exist purely to decide what the UI SHOWS — every
 * action they gate is still enforced by the backend on every request.
 * If one of these drifts out of sync with the backend, the worst case
 * is a button that 403s when clicked, never a security boundary that
 * silently doesn't exist.
 */

export function canAccessOpsConsole(roles: SessionRoles): boolean {
  return (
    roles.global.some((r) => r === "super_admin" || r === "operations_admin") ||
    roles.scopedEventManagerEventIds.length > 0
  );
}

export function canAccessFinanceConsole(roles: SessionRoles): boolean {
  return roles.global.some(
    (r) => r === "super_admin" || r === "finance_admin" || r === "finance_operator" || r === "finance_auditor",
  );
}

export function canAccessAccountManagement(roles: SessionRoles): boolean {
  return roles.global.some(
    (r) => r === "super_admin" || r === "operations_admin" || r === "finance_admin",
  );
}

export function isSuperAdmin(roles: SessionRoles): boolean {
  return roles.global.includes("super_admin");
}

export function isOperationsAdmin(roles: SessionRoles): boolean {
  return roles.global.includes("super_admin") || roles.global.includes("operations_admin");
}

export function isFinanceAdmin(roles: SessionRoles): boolean {
  return roles.global.includes("super_admin") || roles.global.includes("finance_admin");
}

export function isFinanceOperator(roles: SessionRoles): boolean {
  return roles.global.includes("finance_operator");
}

export function isFinanceAuditor(roles: SessionRoles): boolean {
  return roles.global.includes("finance_auditor");
}

/**
 * Mirrors the backend's exact refund gating (payments/router.py):
 * drafting a refund is Finance Operator (or Super Admin) only — NOT
 * Finance Admin. Approving is Finance Admin (or Super Admin) only —
 * NOT Finance Operator. This is the two-person control from the plan's
 * §7 separation principle, and it's a real backend-enforced boundary,
 * not just a UI convention — these two helpers exist so the Console
 * never shows a button that the backend would reject anyway.
 */
export function canDraftRefund(roles: SessionRoles): boolean {
  return roles.global.includes("super_admin") || roles.global.includes("finance_operator");
}

export function canApproveRefund(roles: SessionRoles): boolean {
  return roles.global.includes("super_admin") || roles.global.includes("finance_admin");
}

/** True for a session that ONLY holds a scoped Event Manager role — the
 * "deliberately narrow exception" shell from the plan's §3.2. */
export function isScopedOnlyEventManager(roles: SessionRoles): boolean {
  return roles.global.length === 0 && roles.scopedEventManagerEventIds.length > 0;
}

export function getPostLoginRedirect(roles: SessionRoles): string {
  if (isOperationsAdmin(roles)) return "/ops/dashboard";
  if (canAccessFinanceConsole(roles)) return "/finance/dashboard";
  if (isScopedOnlyEventManager(roles)) {
    return `/ops/events/${roles.scopedEventManagerEventIds[0]}/configure`;
  }
  return "/no-access";
}
