"use client";

import { useState, type ReactNode } from "react";
import { AlertTriangle, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/ui/glass-panel";
import type { ApiError } from "@/api/client";

export interface ConfirmActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  /** When true, shows a required reason textarea — matches the
   * backend's expectation of a mandatory reason on decisions like
   * approve/reject/refund. */
  requireReason?: boolean;
  reasonLabel?: string;
  confirmLabel?: string;
  tone?: "default" | "danger";
  onConfirm: (reason?: string) => Promise<void> | void;
  children?: ReactNode;
}

export function ConfirmActionDialog({
  open,
  onOpenChange,
  title,
  description,
  requireReason,
  reasonLabel = "Reason",
  confirmLabel = "Confirm",
  tone = "default",
  onConfirm,
  children,
}: ConfirmActionDialogProps) {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const canConfirm = !requireReason || reason.trim().length > 0;

  async function handleConfirm() {
    setSubmitting(true);
    try {
      await onConfirm(requireReason ? reason.trim() : undefined);
      onOpenChange(false);
      setReason("");
    } catch (err) {
      // Centralized so every caller gets user feedback on failure without
      // having to remember to add its own try/catch — three real call
      // sites (staff revoke, sponsor removal, refund approval) were
      // previously failing completely silently on a backend error.
      toast.error("That didn't work", {
        description: (err as ApiError)?.message ?? "Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fade-in fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"
        onClick={() => !submitting && onOpenChange(false)}
      />
      <GlassPanel strong className="rise-in relative w-full max-w-md p-6">
        <button
          className="absolute right-4 top-4 text-[var(--foreground-subtle)] hover:text-[var(--foreground)]"
          onClick={() => onOpenChange(false)}
          disabled={submitting}
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-4 flex items-start gap-3">
          {tone === "danger" && (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--danger-soft)]">
              <AlertTriangle className="h-5 w-5 text-[var(--danger)]" />
            </div>
          )}
          <div>
            <h3 className="text-base font-semibold text-[var(--foreground)]">{title}</h3>
            {description && (
              <p className="mt-1 text-sm text-[var(--foreground-muted)]">{description}</p>
            )}
          </div>
        </div>

        {children}

        {requireReason && (
          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
              {reasonLabel}
            </label>
            <textarea
              className="glass-input min-h-[88px] w-full resize-none p-3 text-sm outline-none placeholder:text-[var(--foreground-subtle)]"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="This is logged and visible in the Audit Log."
              autoFocus
            />
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button
            variant={tone === "danger" ? "danger" : "primary"}
            onClick={handleConfirm}
            loading={submitting}
            disabled={!canConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </GlassPanel>
    </div>
  );
}
