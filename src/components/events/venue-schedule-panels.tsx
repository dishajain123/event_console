"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MapPin, Plus, CalendarClock } from "lucide-react";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { EmptyState } from "@/components/shared/states";
import { Skeleton } from "@/components/shared/skeleton";
import { useCreateVenue, useVenues, useCreateScheduleItem, useSchedule } from "@/hooks/useEvents";

const venueSchema = z.object({ name: z.string().min(2, "Name is required"), address: z.string().optional() });
type VenueFormValues = z.infer<typeof venueSchema>;

export function VenuesPanel({ eventId }: { eventId: string }) {
  const { data: venues, isLoading } = useVenues(eventId);
  const createVenue = useCreateVenue(eventId);
  const [showForm, setShowForm] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<VenueFormValues>({ resolver: zodResolver(venueSchema) });

  async function onSubmit(values: VenueFormValues) {
    await createVenue.mutateAsync({ name: values.name, address: values.address || null });
    reset();
    setShowForm(false);
  }

  return (
    <GlassPanel>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">Venues</h2>
        <Button size="sm" variant="outline" onClick={() => setShowForm((v) => !v)}>
          <Plus className="h-3.5 w-3.5" /> Add venue
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit(onSubmit)} className="fade-in mb-4 space-y-3 rounded-[var(--radius-md)] bg-black/[0.02] p-4">
          <Input placeholder="Venue name" error={!!errors.name} {...register("name")} />
          <Input placeholder="Address (optional)" {...register("address")} />
          <div className="flex justify-end gap-2">
            <Button type="button" size="sm" variant="ghost" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" loading={createVenue.isPending}>
              Save venue
            </Button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : !venues || venues.length === 0 ? (
        <EmptyState icon={MapPin} title="No venues yet" description="Add the physical locations this event uses." />
      ) : (
        <ul className="space-y-2">
          {venues.map((venue) => (
            <li key={venue.id} className="flex items-center gap-3 rounded-[var(--radius-sm)] bg-black/[0.02] px-4 py-3">
              <MapPin className="h-4 w-4 shrink-0 text-[var(--accent-strong)]" />
              <div>
                <p className="text-sm font-medium text-[var(--foreground)]">{venue.name}</p>
                {venue.address && <p className="text-xs text-[var(--foreground-muted)]">{venue.address}</p>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </GlassPanel>
  );
}

const scheduleSchema = z.object({
  title: z.string().min(2, "Title is required"),
  venueId: z.string().optional(),
  startTime: z.string().min(1, "Pick a start time"),
  endTime: z.string().optional(),
});
type ScheduleFormValues = z.infer<typeof scheduleSchema>;

export function SchedulePanel({ eventId }: { eventId: string }) {
  const { data: schedule, isLoading } = useSchedule(eventId);
  const { data: venues } = useVenues(eventId);
  const createScheduleItem = useCreateScheduleItem(eventId);
  const [showForm, setShowForm] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ScheduleFormValues>({ resolver: zodResolver(scheduleSchema) });

  async function onSubmit(values: ScheduleFormValues) {
    await createScheduleItem.mutateAsync({
      title: values.title,
      venue_id: values.venueId || null,
      start_time: new Date(values.startTime).toISOString(),
      end_time: values.endTime ? new Date(values.endTime).toISOString() : null,
    });
    reset();
    setShowForm(false);
  }

  const sorted = [...(schedule ?? [])].sort(
    (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime(),
  );

  return (
    <GlassPanel>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">Schedule</h2>
        <Button size="sm" variant="outline" onClick={() => setShowForm((v) => !v)}>
          <Plus className="h-3.5 w-3.5" /> Add item
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit(onSubmit)} className="fade-in mb-4 space-y-3 rounded-[var(--radius-md)] bg-black/[0.02] p-4">
          <Input placeholder="e.g. Semi-finals" error={!!errors.title} {...register("title")} />
          <Select {...register("venueId")}>
            <option value="">No specific venue</option>
            {venues?.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </Select>
          <div className="grid grid-cols-2 gap-3">
            <Input type="datetime-local" error={!!errors.startTime} {...register("startTime")} />
            <Input type="datetime-local" {...register("endTime")} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" size="sm" variant="ghost" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" loading={createScheduleItem.isPending}>
              Save item
            </Button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : sorted.length === 0 ? (
        <EmptyState icon={CalendarClock} title="No schedule items yet" description="Build the day-by-day schedule for this event." />
      ) : (
        <ul className="space-y-2">
          {sorted.map((item) => {
            const venue = venues?.find((v) => v.id === item.venue_id);
            return (
              <li key={item.id} className="flex items-center gap-3 rounded-[var(--radius-sm)] bg-black/[0.02] px-4 py-3">
                <CalendarClock className="h-4 w-4 shrink-0 text-[var(--accent-strong)]" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-[var(--foreground)]">{item.title}</p>
                  <p className="text-xs text-[var(--foreground-muted)]">
                    {new Date(item.start_time).toLocaleString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                    {venue && ` · ${venue.name}`}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </GlassPanel>
  );
}
