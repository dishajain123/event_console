import { Badge } from "@/components/ui/badge";
import { STAFF_ASSIGNMENT_STATUS_LABELS, type StaffAssignmentStatus } from "@/types/staff";

const TONE: Record<StaffAssignmentStatus, "warning" | "success" | "neutral"> = {
  invited: "warning",
  active: "success",
  revoked: "neutral",
};

export function StaffStatusBadge({ status }: { status: StaffAssignmentStatus }) {
  return <Badge tone={TONE[status]}>{STAFF_ASSIGNMENT_STATUS_LABELS[status]}</Badge>;
}
