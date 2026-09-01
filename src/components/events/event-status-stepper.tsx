"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmActionDialog } from "@/components/shared/confirm-action-dialog";
import { EVENT_ALLOWED_TRANSITIONS, EVENT_STATUS_LABELS, type EventStatus } from "@/types/events";
import { useChangeEventStatus, usePublishEvent } from "@/hooks/useEvents";
import { cn } from "@/lib/utils";

const PIPELINE: EventStatus[] = [
  "draft",
  "configured",
  "published",
  "registration_open",
  "registration_closed",
  "live",
  "completed",
];

const TRANSITION_DESCRIPTIONS: Partial<Record<EventStatus, string>> = {
  published: "This makes the event visible in the mobile app and on the public site immediately.",
  registration_open: "Participants will be able to register from this moment on.",
  registration_closed: "No new registrations will be accepted after this.",
  live: "Marks the event as currently happening.",
  completed: "Marks the event as finished.",
  archived: "Hides the event from active listings. This can't be easily undone.",
};

export function EventStatusStepper({ eventId, status }: { eventId: string; status: EventStatus }) {
  const changeStatus = useChangeEventStatus(eventId);
  const publish = usePublishEvent(eventId);
  const [target, setTarget] = useState<EventStatus | null>(null);

  const currentIndex = PIPELINE.indexOf(status);
  const nextOptions = EVENT_ALLOWED_TRANSITIONS[status] ?? [];
  const pending = changeStatus.isPending || publish.isPending;

  async function handleConfirm() {
    if (!target) return;
    if (target === "published") {
      await publish.mutateAsync();
    } else {
      await changeStatus.mutateAsync(target);
    }
    toast.success(`Event moved to "${EVENT_STATUS_LABELS[target]}"`);
  }

  return (
    <div>
      <div className="flex items-center overflow-x-auto pb-2">
        {PIPELINE.map((step, i) => {
          const isDone = currentIndex > -1 && i < currentIndex;
          const isCurrent = step === status;
          return (
            <div key={step} className="flex shrink-0 items-center">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border text-xs font-medium transition-colors",
                    isCurrent
                      ? "border-[var(--accent)] bg-[var(--accent)] text-white shadow-md shadow-indigo-500/30"
                      : isDone
                        ? "border-[var(--success)]/40 bg-[var(--success-soft)] text-[var(--success)]"
                        : "border-slate-300/60 bg-white/40 text-[var(--foreground-subtle)]",
                  )}
                >
                  {isDone ? <Check className="h-4 w-4" /> : i + 1}
                </div>
                <span
                  className={cn(
                    "max-w-[80px] text-center text-[11px] leading-tight",
                    isCurrent ? "font-medium text-[var(--foreground)]" : "text-[var(--foreground-subtle)]",
                  )}
                >
                  {EVENT_STATUS_LABELS[step]}
                </span>
              </div>
              {i < PIPELINE.length - 1 && (
                <div
                  className={cn("mx-1 mb-4 h-px w-8 shrink-0", isDone ? "bg-[var(--success)]/40" : "bg-slate-300/50")}
                />
              )}
            </div>
          );
        })}
      </div>

      {nextOptions.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-black/[0.05] pt-4">
          <span className="text-xs text-[var(--foreground-muted)]">Move to:</span>
          {nextOptions.map((option) => (
            <Button
              key={option}
              size="sm"
              variant={option === "archived" ? "outline" : "primary"}
              disabled={pending}
              onClick={() => setTarget(option)}
            >
              {EVENT_STATUS_LABELS[option]}
            </Button>
          ))}
        </div>
      )}

      <ConfirmActionDialog
        open={!!target}
        onOpenChange={(open) => !open && setTarget(null)}
        title={target ? `Move this event to "${EVENT_STATUS_LABELS[target]}"?` : ""}
        description={target ? TRANSITION_DESCRIPTIONS[target] : undefined}
        confirmLabel={target ? `Move to ${EVENT_STATUS_LABELS[target]}` : "Confirm"}
        tone={target === "archived" ? "danger" : "default"}
        onConfirm={handleConfirm}
      />
    </div>
  );
}
