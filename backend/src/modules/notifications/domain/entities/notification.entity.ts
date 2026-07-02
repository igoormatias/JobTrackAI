export type NotificationType =
  | "new_job"
  | "recommendation"
  | "pipeline_change"
  | "interview_reminder"
  | "dashboard_update";

export type NotificationEntity = {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  actionUrl: string | null;
  metadata: Record<string, string | number | boolean | null>;
  createdAt: string;
};

export type CreateNotificationInput = {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  actionUrl?: string | null;
  metadata?: Record<string, string | number | boolean | null>;
};

export type NotificationListParams = {
  cursor?: string;
  limit?: number;
  read?: boolean;
  type?: NotificationType;
};

export type MarkNotificationsReadInput = {
  userId: string;
  ids?: string[];
  all?: boolean;
};
