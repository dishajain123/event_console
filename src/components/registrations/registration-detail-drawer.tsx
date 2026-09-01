"use client";

import { useState } from "react";
import { X, User, Calendar, CheckCircle2, XCircle, Info } from "lucide-react";
import { toast } from "sonner";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Button } from "@/components/ui/button";
import { ConfirmActionDialog } from "@/components/shared/confirm-action-dialog";
import { RegistrationStatusBadge } from "@/components/registrations/registration-status-badge";
import { useApproveRegistration, useRejectRegistration } from "@/hooks/useRegistrations";
import { DECIDABLE_REGISTRATION_STATUSES, type RegistrationOut } from "@/types/registrations";

export function RegistrationDetailDrawer({
  eventId,
  registration,
  onClose,
}: {
  eventId: string;
  registration: RegistrationOut;
  onClose: () => void;
}) {
  const approve = useApproveRegistration(eventId);
  const reject = useRejectRegistration(eventId);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [approveOpen, setApproveOpen] = useState(false);

  const canDecide = DECIDABLE_REGISTRATION_STATUSES.includes(registration.status);

  async function handleApprove() {
    await approve.mutateAsync(registration.id);
    toast.success("Registration approved");
    onClose();
  }

  async function handleReject(reason?: string) {
    await reject.mutateAsync({ registrationId: registration.id, reason: reason ?? "" });
    toast.success("Registration rejected");
    onClose();
  }

  return (
    <div className="fade-in fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-slate-900/25 backdrop-blur-sm" onClick={onClose} />
      <GlassPanel
        strong
        padded={false}
        className="rise-in relative z-10 flex h-full w-full max-w-md flex-col rounded-none rounded-l-[var(--radius-lg)] p-0"
      >
        <div className="flex items-center justify-between border-b border-black/[0.06] px-6 py-5">
          <div>
            <p className="text-sm font-semibold capitalize text-[var(--foreground)]">
              {registration.participation_type} registration
            </p>
            <p className="text-xs text-[var(--foreground-muted)]">
              {new Date(registration.created_at).toLocaleString()}
            </p>
          </div>
          <button onClick={onClose} className="text-[var(--foreground-subtle)] hover:text-[var(--foreground)]">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--foreground-subtle)]">
              Status
            </p>
            <RegistrationStatusBadge status={registration.status} />
            {registration.rejection_reason && (
              <p className="mt-2 rounded-[var(--radius-sm)] bg-[var(--danger-soft)] p-3 text-xs text-[var(--danger)]">
                {registration.rejection_reason}
              </p>
            )}
          </div>

          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--foreground-subtle)]">
              Participants
            </p>
            {registration.participants.length === 0 ? (
              <p className="text-sm text-[var(--foreground-muted)]">
                No separate participant records — this registration belongs to the account holder directly.
              </p>
            ) : (
              <div className="space-y-2">
                {registration.participants.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between rounded-[var(--radius-sm)] bg-black/[0.02] px-3 py-2"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--accent-soft)]">
                        <User className="h-3.5 w-3.5 text-[var(--accent-strong)]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[var(--foreground)]">{p.full_name}</p>
                        {p.date_of_birth && (
                          <p className="text-xs text-[var(--foreground-muted)]">DOB: {p.date_of_birth}</p>
                        )}
                      </div>
                    </div>
                    {p.is_captain && <span className="text-xs font-medium text-[var(--accent-strong)]">Captain</span>}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--foreground-subtle)]">
              Timeline
            </p>
            <ul className="space-y-2 text-sm">
              <TimelineRow icon={Calendar} label="Submitted" value={registration.submitted_at} />
              {registration.status === "rejected" && (
                <TimelineRow icon={XCircle} label="Rejected" value={registration.updated_at} tone="danger" />
              )}
              {["approved", "confirmed", "checked_in", "completed"].includes(registration.status) && (
                <TimelineRow icon={CheckCircle2} label="Approved" value={registration.updated_at} tone="success" />
              )}
              <TimelineRow icon={Calendar} label="Checked in" value={registration.checked_in_at} />
              <TimelineRow icon={Calendar} label="Completed" value={registration.completed_at} />
            </ul>
          </div>

          <div className="flex items-start gap-2 rounded-[var(--radius-sm)] bg-[var(--info-soft)] p-3 text-xs text-[var(--info)]">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>
              Submitted form answers and uploaded documents aren&apos;t returned by the registrations API
              yet — this view shows everything currently available.
            </span>
          </div>
        </div>

        {canDecide && (
          <div className="flex gap-2 border-t border-black/[0.06] px-6 py-4">
            <Button variant="outline" className="flex-1" onClick={() => setRejectOpen(true)}>
              Reject
            </Button>
            <Button className="flex-1" onClick={() => setApproveOpen(true)} loading={approve.isPending}>
              Approve
            </Button>
          </div>
        )}
      </GlassPanel>

      <ConfirmActionDialog
        open={approveOpen}
        onOpenChange={setApproveOpen}
        title="Approve this registration?"
        description="This moves the registration forward — to payment, confirmation, or ticketing depending on this event's setup."
        confirmLabel="Approve registration"
        onConfirm={handleApprove}
      />

      <ConfirmActionDialog
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        title="Reject this registration?"
        description="This is final for the registrant unless they submit again. A reason is required."
        requireReason
        reasonLabel="Reason for rejection"
        confirmLabel="Reject registration"
        tone="danger"
        onConfirm={handleReject}
      />
    </div>
  );
}

function TimelineRow({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Calendar;
  label: string;
  value: string | null;
  tone?: "success" | "danger";
}) {
  if (!value) return null;
  return (
    <li className="flex items-center gap-2.5">
      <Icon
        className={`h-3.5 w-3.5 ${tone === "success" ? "text-[var(--success)]" : tone === "danger" ? "text-[var(--danger)]" : "text-[var(--foreground-subtle)]"}`}
      />
      <span className="text-[var(--foreground-muted)]">{label}</span>
      <span className="ml-auto text-xs text-[var(--foreground)]">{new Date(value).toLocaleString()}</span>
    </li>
  );
}
