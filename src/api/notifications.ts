import { apiClient } from "@/api/client";
import type { NotificationOut, NotificationSendIn, NotificationTemplateOut } from "@/types/notifications";

export async function sendNotification(payload: NotificationSendIn): Promise<NotificationOut[]> {
  const { data } = await apiClient.post<NotificationOut[]>("/notifications/send", payload);
  return data;
}

export async function listNotificationsForEvent(eventId: string): Promise<NotificationOut[]> {
  const { data } = await apiClient.get<NotificationOut[]>("/notifications", { params: { event_id: eventId } });
  return data;
}

export async function listNotificationTemplates(): Promise<NotificationTemplateOut[]> {
  const { data } = await apiClient.get<NotificationTemplateOut[]>("/notification-templates");
  return data;
}
