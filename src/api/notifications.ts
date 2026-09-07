import { apiClient } from "@/api/client";
import type { NotificationOut, NotificationSendIn, NotificationTemplateOut } from "@/types/notifications";
export type NotificationPage = { items: NotificationOut[]; total: number; page: number; page_size: number };

export async function sendNotification(payload: NotificationSendIn): Promise<NotificationOut[]> {
  const { data } = await apiClient.post<NotificationOut[]>("/notifications/send", payload);
  return data;
}

export async function listNotificationsForEvent(eventId: string, page = 1, pageSize = 25): Promise<NotificationPage> {
  const { data } = await apiClient.get<NotificationPage>("/notifications", { params: { event_id: eventId, page, page_size: pageSize } });
  return data;
}

export async function listNotificationTemplates(): Promise<NotificationTemplateOut[]> {
  const { data } = await apiClient.get<NotificationTemplateOut[]>("/notification-templates");
  return data;
}
