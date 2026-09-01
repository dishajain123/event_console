"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { UserCog, CheckCircle2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/layout/header";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { findOrCreateUserForProvisioning, PROVISIONABLE_GLOBAL_ROLES } from "@/api/identity";
import { assignRole } from "@/api/rbac";
import type { ApiError } from "@/api/client";
import type { ProvisionableGlobalRole } from "@/types/rbac";

const schema = z.object({
  mobileNumber: z
    .string()
    .min(10, "Enter a valid mobile number")
    .regex(/^\+?\d+$/, "Digits only, optionally with a leading +"),
  name: z.string().optional(),
  role: z.enum(["operations_admin", "finance_admin", "finance_operator", "finance_auditor"]),
});

type FormValues = z.infer<typeof schema>;

interface ProvisionedEntry {
  mobileNumber: string;
  name?: string;
  role: ProvisionableGlobalRole;
  userId: string;
  timestamp: number;
}

const ROLE_LABELS: Record<ProvisionableGlobalRole, string> = {
  operations_admin: "Operations Admin",
  finance_admin: "Finance Admin",
  finance_operator: "Finance Operator",
  finance_auditor: "Finance Auditor",
};

export default function AdminAccountsPage() {
  const [provisioned, setProvisioned] = useState<ProvisionedEntry[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { role: "operations_admin" },
  });

  async function onSubmit(values: FormValues) {
    setFormError(null);
    setSubmitting(true);
    try {
      const user = await findOrCreateUserForProvisioning(values.mobileNumber, values.name);
      await assignRole(user.id, { user_id: user.id, role_name: values.role, event_id: null });

      setProvisioned((prev) => [
        {
          mobileNumber: values.mobileNumber,
          name: values.name,
          role: values.role,
          userId: user.id,
          timestamp: Date.now(),
        },
        ...prev,
      ]);
      toast.success("Access granted", {
        description: `${values.name || values.mobileNumber} is now ${ROLE_LABELS[values.role]}.`,
      });
      reset({ mobileNumber: "", name: "", role: values.role });
    } catch (err) {
      const message = (err as ApiError)?.message ?? "Couldn't provision this account. Please try again.";
      setFormError(message);
      toast.error("Couldn't grant access", { description: message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <Header title="Admin Accounts" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.3fr]">
        <GlassPanel className="rise-in h-fit">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-soft)]">
              <UserCog className="h-5 w-5 text-[var(--accent-strong)]" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[var(--foreground)]">Provision a global role</h2>
              <p className="text-xs text-[var(--foreground-muted)]">
                Operations Admin &amp; Finance Admin — Super Admin only
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
                Mobile number
              </label>
              <Input
                placeholder="+91 98765 43210"
                error={!!errors.mobileNumber}
                {...register("mobileNumber")}
              />
              {errors.mobileNumber && (
                <p className="mt-1 text-xs text-[var(--danger)]">{errors.mobileNumber.message}</p>
              )}
              <p className="mt-1.5 text-xs text-[var(--foreground-subtle)]">
                If this number hasn&apos;t signed up before, an account is created automatically.
              </p>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
                Name <span className="text-[var(--foreground-subtle)]">(optional)</span>
              </label>
              <Input placeholder="Jane Doe" {...register("name")} />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">Role</label>
              <Controller
                control={control}
                name="role"
                render={({ field }) => (
                  <div className="grid grid-cols-2 gap-2">
                    {PROVISIONABLE_GLOBAL_ROLES.map((r) => (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => field.onChange(r.value)}
                        className={`glass-input rounded-[var(--radius-sm)] px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                          field.value === r.value
                            ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent-strong)]"
                            : "text-[var(--foreground-muted)]"
                        }`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                )}
              />
            </div>

            {formError && (
              <div className="flex items-start gap-2 rounded-[var(--radius-sm)] bg-[var(--danger-soft)] p-3 text-sm text-[var(--danger)]">
                <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <Button type="submit" className="w-full" loading={submitting}>
              Grant access
            </Button>
          </form>
        </GlassPanel>

        <GlassPanel className="rise-in">
          <h2 className="mb-1 text-sm font-semibold text-[var(--foreground)]">Provisioned this session</h2>
          <p className="mb-4 text-xs text-[var(--foreground-muted)]">
            A persisted, searchable account list ships alongside Staff Accounts in Phase 5 — this is a
            live receipt of what you&apos;ve just granted.
          </p>

          {provisioned.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 rounded-[var(--radius-md)] border border-dashed border-slate-300/60 py-12 text-center">
              <UserCog className="h-8 w-8 text-[var(--foreground-subtle)]" />
              <p className="text-sm text-[var(--foreground-muted)]">Nothing provisioned yet</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {provisioned.map((entry) => (
                <li
                  key={`${entry.userId}-${entry.timestamp}`}
                  className="fade-in flex items-center justify-between rounded-[var(--radius-sm)] bg-[var(--success-soft)]/60 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--success)]" />
                    <div>
                      <p className="text-sm font-medium text-[var(--foreground)]">
                        {entry.name || entry.mobileNumber}
                      </p>
                      {entry.name && (
                        <p className="text-xs text-[var(--foreground-muted)]">{entry.mobileNumber}</p>
                      )}
                    </div>
                  </div>
                  <Badge tone="success">{ROLE_LABELS[entry.role]}</Badge>
                </li>
              ))}
            </ul>
          )}
        </GlassPanel>
      </div>
    </div>
  );
}
