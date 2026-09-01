import { apiClient } from "@/api/client";
import type { AuditLogOut, AuditLogPageOut, AuditLogQueryParams } from "@/types/auditLog";

export async function queryAuditLog(params: AuditLogQueryParams): Promise<AuditLogPageOut> {
  const { data } = await apiClient.get<AuditLogPageOut>("/audit-log", { params });
  return data;
}

export async function getEntityHistory(entityType: string, entityId: string): Promise<AuditLogOut[]> {
  const { data } = await apiClient.get<AuditLogOut[]>(`/audit-log/entity/${entityType}/${entityId}`);
  return data;
}
