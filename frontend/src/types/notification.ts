export type NotificationType =
  | "new_job"
  | "recommendation"
  | "pipeline_change"
  | "interview_reminder"
  | "dashboard_update"
  | "job_closed";

export type NotificationCategory = "jobs" | "pipeline" | "calendar" | "system";

export type NotificationPriority = "low" | "normal" | "high";

export type Notification = {
  id: string;
  userId: string;
  type: NotificationType;
  category: NotificationCategory;
  priority?: NotificationPriority;
  title: string;
  message: string;
  read: boolean;
  actionUrl: string | null;
  metadata: Record<string, string | number | boolean | null>;
  createdAt: string;
};

export type MarkNotificationsReadPayload = {
  ids?: string[];
  all?: boolean;
};

export type DeleteNotificationsPayload = {
  ids: string[];
};
