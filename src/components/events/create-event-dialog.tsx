"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ShieldAlert } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { MobileNumberField } from "@/components/shared/mobile-number-field";
import { useCreateEvent } from "@/hooks/useEvents";
import { useMainCategories, useSubCategories } from "@/hooks/useEventCategories";
import { assignRole } from "@/api/rbac";
import { findOrCreateUserForProvisioning } from "@/api/identity";
import type { ApiError } from "@/api/client";
import type { RoleName } from "@/types/rbac";

const schema = z
  .object({
    name: z.string().min(2, "Give the event a name"),
    mainCategoryId: z.string().min(1, "Pick a main category"),
    subCategoryId: z.string().min(1, "Pick a sub category"),
    description: z.string().optional(),
    organizerMobileNumber: z
      .string()
      .min(10, "Enter a 10-digit mobile number")
      .max(10, "Enter a 10-digit mobile number")
      .regex(/^\d+$/, "Digits only"),
    organizerName: z.string().optional(),
    startDate: z.string().min(1, "Pick a start date"),
    endDate: z.string().min(1, "Pick an end date"),
  })
  .refine((v) => new Date(v.endDate) >= new Date(v.startDate), {
    message: "End date must be on or after the start date",
    path: ["endDate"],
  });

type FormValues = z.infer<typeof schema>;

export function CreateEventDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const createEvent = useCreateEvent();
  const { data: mainCategories, isLoading: mainLoading } = useMainCategories();
  const activeMainCategories = mainCategories?.filter((category) => category.is_active) ?? [];
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });
  const selectedMainCategoryId = useWatch({ control, name: "mainCategoryId" });
  const organizerMobileNumber = useWatch({ control, name: "organizerMobileNumber" });
  const { data: subCategories, isLoading: subLoading } = useSubCategories(selectedMainCategoryId);
  const activeSubCategories = subCategories?.filter((category) => category.is_active) ?? [];

  useEffect(() => {
    setValue("subCategoryId", "");
  }, [selectedMainCategoryId, setValue]);

  async function onSubmit(values: FormValues) {
    setError(null);
    try {
      const organizer = await findOrCreateUserForProvisioning(
        `+91${values.organizerMobileNumber}`,
        values.organizerName?.trim() || undefined,
      );
      const event = await createEvent.mutateAsync({
        name: values.name,
        description: values.description || null,
        main_category_id: values.mainCategoryId,
        sub_category_id: values.subCategoryId,
        start_date: new Date(values.startDate).toISOString(),
        end_date: new Date(values.endDate).toISOString(),
        organizer_user_id: organizer.id,
      });
      await assignRole(organizer.id, {
        user_id: organizer.id,
        role_name: "event_manager" as RoleName,
        event_id: event.id,
      });
      reset();
      onClose();
      router.push(`/ops/events/${event.id}`);
    } catch (err) {
      setError((err as ApiError)?.message ?? "Couldn't create this event. Please try again.");
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Create an event"
      description="Choose a main category, sub category, and event manager, then set the event dates."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">Event name</label>
          <Input placeholder="e.g. Sports & Fitness" error={!!errors.name} {...register("name")} />
          {errors.name && <p className="mt-1 text-xs text-[var(--danger)]">{errors.name.message}</p>}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
            Main category
          </label>
          <Select disabled={mainLoading || activeMainCategories.length === 0} {...register("mainCategoryId")}>
            <option value="">Select a main category</option>
            {activeMainCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
          {errors.mainCategoryId && (
            <p className="mt-1 text-xs text-[var(--danger)]">{errors.mainCategoryId.message}</p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">Sub category</label>
          <Select
            disabled={!selectedMainCategoryId || subLoading || activeSubCategories.length === 0}
            {...register("subCategoryId")}
          >
            <option value="">
              {!selectedMainCategoryId
                ? "Select a main category first"
                : activeSubCategories.length === 0
                  ? "No sub categories found"
                  : "Select a sub category"}
            </option>
            {activeSubCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
          {errors.subCategoryId && (
            <p className="mt-1 text-xs text-[var(--danger)]">{errors.subCategoryId.message}</p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
            Description <span className="text-[var(--foreground-subtle)]">(optional)</span>
          </label>
          <Textarea placeholder="A short internal description" {...register("description")} />
        </div>

        <MobileNumberField
          id="event-organizer-mobile"
          label="Event Manager mobile number"
          value={organizerMobileNumber ?? ""}
          onChange={(value) => setValue("organizerMobileNumber", value, { shouldValidate: true })}
          error={!!errors.organizerMobileNumber}
          errorMessage={errors.organizerMobileNumber?.message}
          helperText="This account will be provisioned if needed and assigned as the event's manager."
        />

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
            Event manager name <span className="text-[var(--foreground-subtle)]">(optional)</span>
          </label>
          <Input placeholder="Organizer name" {...register("organizerName")} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">Start</label>
            <Input type="datetime-local" error={!!errors.startDate} {...register("startDate")} />
            {errors.startDate && (
              <p className="mt-1 text-xs text-[var(--danger)]">{errors.startDate.message}</p>
            )}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">End</label>
            <Input type="datetime-local" error={!!errors.endDate} {...register("endDate")} />
            {errors.endDate && <p className="mt-1 text-xs text-[var(--danger)]">{errors.endDate.message}</p>}
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-[var(--radius-sm)] bg-[var(--danger-soft)] p-3 text-sm text-[var(--danger)]">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={createEvent.isPending}>
            Create event
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
