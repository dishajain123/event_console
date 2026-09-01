import { useQuery } from "@tanstack/react-query";
import { getEntityHistory, queryAuditLog } from "@/api/auditLog";
import { useSessionStore } from "@/state/sessionStore";
import type { AuditLogQueryParams } from "@/types/auditLog";

function useReady() {
  const hydrated = useSessionStore((s) => s.hydrated);
  const user = useSessionStore((s) => s.user);
  return hydrated && !!user;
}

export function useAuditLog(params: AuditLogQueryParams) {
  const ready = useReady();
  return useQuery({
    queryKey: ["audit-log", params],
    queryFn: () => queryAuditLog(params),
    enabled: ready,
    placeholderData: (previous) => previous, // keeps the table from flashing empty while paging/filtering
  });
}

export function useEntityHistory(entityType: string | null, entityId: string | null) {
  const ready = useReady();
  return useQuery({
    queryKey: ["audit-log", "entity", entityType, entityId],
    queryFn: () => getEntityHistory(entityType as string, entityId as string),
    enabled: ready && !!entityType && !!entityId,
  });
}
