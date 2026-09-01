import { apiClient } from "@/api/client";
import type { MyRoleAssignment, RoleAssignmentIn, RoleAssignmentOut, RoleOut } from "@/types/rbac";

export async function listRoles(): Promise<RoleOut[]> {
  const { data } = await apiClient.get<RoleOut[]>("/roles");
  return data;
}

/** The endpoint added to close the "what roles do I hold" gap — see
 * backend §0 in the implementation plan. */
export async function listMyRoleAssignments(): Promise<MyRoleAssignment[]> {
  const { data } = await apiClient.get<MyRoleAssignment[]>("/users/me/role-assignments");
  return data;
}

export async function assignRole(userId: string, payload: RoleAssignmentIn): Promise<RoleAssignmentOut> {
  const { data } = await apiClient.post<RoleAssignmentOut>(`/users/${userId}/role-assignments`, payload);
  return data;
}
