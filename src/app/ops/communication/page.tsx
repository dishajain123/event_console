"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { MessageSquare, Send, Users } from "lucide-react";
import { Header } from "@/components/layout/header";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { TableSkeleton } from "@/components/shared/skeleton";
import { useEvents } from "@/hooks/useEvents";
import { groupNotificationsIntoSends, useEventNotifications, useSendNotification } from "@/hooks/useNotifications";
import { NOTIFICATION_CHANNEL_LABELS } from "@/types/notifications";
import type { NotificationChannel } from "@/types/notifications";

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  body: z.string().min(1, "Message is required"),
  channel: z.string().min(1),
  participationType: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export default function CommunicationPage() {
  const { data: events } = useEvents();
  const [eventId, setEventId] = useState("");
  const sendNotification = useSendNotification(eventId);
  const { data: sentNotifications, isLoading: sendsLoading, isError: sendsError, refetch: refetchSends } = useEventNotifications(eventId);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { channel: "push" } });

  async function onSubmit(values: FormValues) {
    try {
      await sendNotification.mutateAsync({
        title: values.title,
        body: values.body,
        channels: [values.channel as NotificationChannel],
        target: {
          event_id: eventId,
          participation_types: values.participationType ? [values.participationType] : [],
          registration_statuses: [],
          recipient_user_ids: [],
        },
      });
      toast.success("Notification sent");
      reset({ title: "", body: "", channel: values.channel, participationType: values.participationType });
    } catch (err) {
      toast.error("Couldn't send notification", { description: (err as { message?: string })?.message });
    }
  }

  const sends = sentNotifications ? groupNotificationsIntoSends(sentNotifications) : [];

  return (
    <div>
      <Header title="Communication" />

      <div className="mb-4">
        <Select className="w-64" value={eventId} onChange={(e) => setEventId(e.target.value)}>
          <option value="">Select an event…</option>
          {(events ?? []).map((event) => (
            <option key={event.id} value={event.id}>
              {event.name}
            </option>
          ))}
        </Select>
      </div>

      {!eventId ? (
        <GlassPanel>
          <EmptyState
            icon={MessageSquare}
            title="Pick an event to send a notification"
            description="Target by participation type — push, SMS, or email — to everyone registered for that event."
          />
        </GlassPanel>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.2fr]">
          <GlassPanel className="rise-in h-fit">
            <h2 className="mb-4 text-sm font-semibold text-[var(--foreground)]">Compose</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">Title</label>
                <Input placeholder="Schedule update" {...register("title")} />
                {errors.title && <p className="mt-1 text-xs text-[var(--danger)]">{errors.title.message}</p>}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">Message</label>
                <textarea
                  className="glass-input min-h-[100px] w-full resize-none p-3 text-sm outline-none placeholder:text-[var(--foreground-subtle)]"
                  placeholder="The finals have moved to 5 PM at the main venue."
                  {...register("body")}
                />
                {errors.body && <p className="mt-1 text-xs text-[var(--danger)]">{errors.body.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">Channel</label>
                  <Select {...register("channel")}>
                    {Object.entries(NOTIFICATION_CHANNEL_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
                    Target <span className="text-[var(--foreground-subtle)]">(optional)</span>
                  </label>
                  <Input placeholder="e.g. individual" {...register("participationType")} />
                </div>
              </div>
              <p className="text-xs text-[var(--foreground-subtle)]">
                Leave target blank to reach every registrant for this event, regardless of participation type.
              </p>
              <Button type="submit" className="w-full" loading={sendNotification.isPending}>
                <Send className="h-4 w-4" />
                Send notification
              </Button>
            </form>
          </GlassPanel>

          <GlassPanel padded={false}>
            <div className="border-b border-black/[0.06] px-6 py-4">
              <h2 className="text-sm font-semibold text-[var(--foreground)]">Recent sends</h2>
            </div>
            {sendsLoading ? (
              <div className="p-6">
                <TableSkeleton rows={3} cols={2} />
              </div>
            ) : sendsError ? (
              <div className="p-6">
                <ErrorState onRetry={() => refetchSends()} description="Check the backend connection and try again." />
              </div>
            ) : sends.length === 0 ? (
              <div className="p-6">
                <EmptyState icon={MessageSquare} title="Nothing sent yet for this event" />
              </div>
            ) : (
              <div className="divide-y divide-black/[0.05]">
                {sends.map((send) => (
                  <div key={send.key} className="p-4">
                    <div className="mb-1 flex items-center justify-between">
                      <p className="text-sm font-medium text-[var(--foreground)]">{send.title}</p>
                      <Badge tone="accent">{NOTIFICATION_CHANNEL_LABELS[send.channel]}</Badge>
                    </div>
                    <p className="mb-2 text-xs text-[var(--foreground-muted)]">{send.body}</p>
                    <div className="flex items-center gap-3 text-xs text-[var(--foreground-subtle)]">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {send.deliveredCount}/{send.recipientCount} delivered
                      </span>
                      <span>{new Date(send.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassPanel>
        </div>
      )}
    </div>
  );
}
