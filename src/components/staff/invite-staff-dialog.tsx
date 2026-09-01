"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/ui/glass-panel";
import { useCreateStaffAssignment } from "@/hooks/useStaff";
import { useVenues } from "@/hooks/useEvents";
import { STAFF_ROLE_OPTIONS } from "@/types/staff";
import type { RoleName } from "@/types/rbac";

const schema = z.object({
  invitee_mobile: z.string().min(10, "Enter a valid mobile number"),
  role_name: z.string().min(1),
  role_label: z.string().min(1, "Give this role a display label"),
  full_name: z.string().optional(),
  venue_id: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export function InviteStaffDialog({
  eventId,
  open,
  onClose,
}: {
  eventId: string;
  open: boolean;
  onClose: () => void;
}) {
  const createAssignment = useCreateStaffAssignment(eventId);
  const { data: venues } = useVenues(eventId);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { role_name: "staff_member", role_label: "" },
  });

  if (!open) return null;

  async function onSubmit(values: FormValues) {
    try {
      await createAssignment.mutateAsync({
        invitee_mobile: values.invitee_mobile,
        role_name: values.role_name as RoleName,
        role_label: values.role_label,
        full_name: values.full_name || null,
        venue_id: values.venue_id || null,
      });
      toast.success("Invitation sent", {
        description: "They'll unlock Staff Mode in the app once they verify this number.",
      });
      reset();
      onClose();
    } catch (err) {
      toast.error("Couldn't send invitation", { description: (err as { message?: string })?.message });
    }
  }

  return (
    <div className="fade-in fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={onClose} />
      <GlassPanel strong className="rise-in relative w-full max-w-md p-6">
        <h3 className="mb-4 text-base font-semibold text-[var(--foreground)]">Invite staff</h3>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">Mobile number</label>
            <Input placeholder="+91 98765 43210" {...register("invitee_mobile")} />
            {errors.invitee_mobile && (
              <p className="mt-1 text-xs text-[var(--danger)]">{errors.invitee_mobile.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
              Name <span className="text-[var(--foreground-subtle)]">(optional)</span>
            </label>
            <Input placeholder="Their name" {...register("full_name")} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">Role</label>
              <Select {...register("role_name")}>
                {STAFF_ROLE_OPTIONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
                Display label
              </label>
              <Input placeholder="e.g. Gate Lead" {...register("role_label")} />
              {errors.role_label && (
                <p className="mt-1 text-xs text-[var(--danger)]">{errors.role_label.message}</p>
              )}
            </div>
          </div>
          <p className="-mt-2 text-xs text-[var(--foreground-subtle)]">
            The role drives their actual permissions; the display label is just what shows on screen — call
            it whatever your team uses (&quot;Volunteer,&quot; &quot;Marshal,&quot; anything).
          </p>

          {venues && venues.length > 0 && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
                Venue <span className="text-[var(--foreground-subtle)]">(optional)</span>
              </label>
              <Controller
                control={control}
                name="venue_id"
                render={({ field }) => (
                  <Select value={field.value ?? ""} onChange={field.onChange}>
                    <option value="">No specific venue</option>
                    {venues.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name}
                      </option>
                    ))}
                  </Select>
                )}
              />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={createAssignment.isPending}>
              Send invitation
            </Button>
          </div>
        </form>
      </GlassPanel>
    </div>
  );
}
