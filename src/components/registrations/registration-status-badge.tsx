import { Badge } from "@/components/ui/badge";
import { REGISTRATION_STATUS_LABELS, type RegistrationStatus } from "@/types/registrations";

const TONE: Record<RegistrationStatus, "neutral" | "accent" | "success" | "warning" | "info" | "danger"> = {
  started: "neutral",
  submitted: "info",
  pending_verification: "warning",
  pending_payment: "warning",
  refund_pending: "warning",
  refund_failed: "danger",
  approved: "accent",
  confirmed: "success",
  checked_in: "success",
  completed: "success",
  rejected: "danger",
  cancelled: "neutral",
};

export function RegistrationStatusBadge({ status }: { status: RegistrationStatus }) {
  return <Badge tone={TONE[status]}>{REGISTRATION_STATUS_LABELS[status]}</Badge>;
}
