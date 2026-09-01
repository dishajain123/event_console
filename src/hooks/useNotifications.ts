import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listNotificationsForEvent, listNotificationTemplates, sendNotification } from "@/api/notifications";
import { useSessionStore } from "@/state/sessionStore";
import type { GroupedSend, NotificationOut, NotificationSendIn } from "@/types/notifications";

function useReady() {
  const hydrated = useSessionStore((s) => s.hydrated);
  const user = useSessionStore((s) => s.user);
  return hydrated && !!user;
}

export function useEventNotifications(eventId: string) {
  const ready = useReady();
  return useQuery({
    queryKey: ["notifications", "event", eventId],
    queryFn: () => listNotificationsForEvent(eventId),
    enabled: ready && !!eventId,
  });
}

export function useNotificationTemplates() {
  const ready = useReady();
  return useQuery({
    queryKey: ["notification-templates"],
    queryFn: listNotificationTemplates,
    enabled: ready,
  });
}

export function useSendNotification(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: NotificationSendIn) => sendNotification(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications", "event", eventId] }),
  });
}

/** Groups the backend's one-row-per-recipient fan-out back into the
 * logical "sends" the Console displays — see the note on GroupedSend. */
export function groupNotificationsIntoSends(notifications: NotificationOut[]): GroupedSend[] {
  const groups = new Map<string, GroupedSend>();
  for (const n of notifications) {
    const key = `${n.title}::${n.body}::${n.channel}::${n.created_at.slice(0, 16)}`;
    const existing = groups.get(key);
    if (existing) {
      existing.recipientCount += 1;
      if (n.delivery_status === "sent") existing.deliveredCount += 1;
    } else {
      groups.set(key, {
        key,
        title: n.title,
        body: n.body,
        channel: n.channel,
        createdAt: n.created_at,
        recipientCount: 1,
        deliveredCount: n.delivery_status === "sent" ? 1 : 0,
      });
    }
  }
  return Array.from(groups.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}
