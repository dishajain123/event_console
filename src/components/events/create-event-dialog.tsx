"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ShieldAlert } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useCreateEvent } from "@/hooks/useEvents";
import type { ApiError } from "@/api/client";

const schema = z
  .object({
    name: z.string().min(2, "Give the event a name"),
    category: z.string().optional(),
    description: z.string().optional(),
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
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    setError(null);
    try {
      const event = await createEvent.mutateAsync({
        name: values.name,
        category: values.category || null,
        description: values.description || null,
        start_date: new Date(values.startDate).toISOString(),
        end_date: new Date(values.endDate).toISOString(),
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
      description="Give it a name and dates — everything else (fees, forms, rules) is configured next."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">Event name</label>
          <Input placeholder="e.g. Sports & Fitness" error={!!errors.name} {...register("name")} />
          {errors.name && <p className="mt-1 text-xs text-[var(--danger)]">{errors.name.message}</p>}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
            Category <span className="text-[var(--foreground-subtle)]">(optional)</span>
          </label>
          <Input placeholder="e.g. sports, talent, business" {...register("category")} />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
            Description <span className="text-[var(--foreground-subtle)]">(optional)</span>
          </label>
          <Textarea placeholder="A short internal description" {...register("description")} />
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
