/** Mirrors app/modules/notifications/schemas.py + models.py enums. */

export type NotificationChannel = "push" | "sms" | "email";

export const NOTIFICATION_CHANNEL_LABELS: Record<NotificationChannel, string> = {
  push: "Push",
  sms: "SMS",
  email: "Email",
};

export type NotificationDeliveryStatus = "queued" | "sent" | "failed";
export type NotificationType =
  | "operational"
  | "event_reminder"
  | "registration_confirmation"
  | "payment_update"
  | "cancellation_refund"
  | "event_change"
  | "feedback_reminder"
  | "marketing";

export interface NotificationTemplateOut {
  id: string;
  event_id: string | null;
  code: string;
  channel: NotificationChannel;
  subject: string | null;
  body_template: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  notification_type: NotificationType | string;
  dedupe_key: string | null;
  attempt_count: number;
  last_error: string | null;
  delivered_at: string | null;
}

export interface NotificationSendTargetIn {
  event_id: string;
  participation_types?: string[];
  registration_statuses?: string[];
  recipient_user_ids?: string[];
}

export interface NotificationSendIn {
  title: string;
  body: string;
  channels: NotificationChannel[];
  target: NotificationSendTargetIn;
}

export interface NotificationOut {
  id: string;
  event_id: string;
  recipient_user_id: string;
  template_id: string | null;
  channel: NotificationChannel;
  title: string;
  body: string;
  target_metadata: Record<string, unknown> | null;
  delivery_status: NotificationDeliveryStatus;
  provider_message_id: string | null;
  sent_at: string | null;
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

/** A "send" as the Console displays it — many NotificationOut rows
 * (one per recipient) grouped back into one logical send, since the
 * backend has no separate batch/send-id concept. */
export interface GroupedSend {
  key: string;
  title: string;
  body: string;
  channel: NotificationChannel;
  createdAt: string;
  recipientCount: number;
  deliveredCount: number;
  failedCount: number;
}
