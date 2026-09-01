/** Mirrors app/modules/rbac/schemas.py and models.py exactly. */

export const CONSOLE_ROLE_NAMES = [
  "super_admin",
  "operations_admin",
  "finance_admin",
  "finance_operator",
  "finance_auditor",
  "event_manager",
] as const;

/** Canonical role names exposed to the console and session model. */
export type RoleName =
  | "super_admin"
  | "operations_admin"
  | "finance_admin"
  | "finance_operator"
  | "finance_auditor"
  | "event_manager";

/** The subset of RoleName that ever grants a Console login. */
export type ConsoleRoleName = (typeof CONSOLE_ROLE_NAMES)[number];

/** Roles that the console can provision for admin-level users. */
export type ProvisionableGlobalRole =
  | "operations_admin"
  | "finance_admin"
  | "finance_operator"
  | "finance_auditor";

export interface RoleOut {
  id: string;
  name: RoleName;
  description: string | null;
  is_scoped: boolean;
}

export interface RoleAssignmentOut {
  id: string;
  user_id: string;
  role_id: string;
  event_id: string | null;
  status: "active" | "revoked";
}

export interface RoleAssignmentIn {
  user_id: string;
  role_name: RoleName;
  event_id?: string | null;
}

/** Mirrors app/modules/rbac/schemas.py MyRoleAssignmentOut exactly —
 * the resolved-name shape returned by GET /users/me/role-assignments. */
export interface MyRoleAssignment {
  role_name: RoleName;
  event_id: string | null;
  status: "active" | "revoked";
}
