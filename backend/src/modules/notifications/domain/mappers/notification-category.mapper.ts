import type {
  NotificationCategory,
  NotificationPriority,
  NotificationType,
} from "../entities/notification.entity.js";

const TYPE_TO_CATEGORY: Record<NotificationType, NotificationCategory> = {
  new_job: "jobs",
  recommendation: "jobs",
  job_closed: "alerts",
  pipeline_change: "pipeline",
  interview_reminder: "calendar",
  dashboard_update: "system",
  favorite_company: "favorites",
  followup_reminder: "followup",
  sync_complete: "system",
  alert: "alerts",
};

const TYPE_TO_PRIORITY: Partial<Record<NotificationType, NotificationPriority>> = {
  new_job: "high",
  interview_reminder: "high",
  job_closed: "normal",
  favorite_company: "high",
  followup_reminder: "normal",
  alert: "high",
};

export const notificationCategoryMapper = {
  toCategory(type: NotificationType): NotificationCategory {
    return TYPE_TO_CATEGORY[type] ?? "system";
  },

  toPriority(type: NotificationType, metadata?: Record<string, unknown>): NotificationPriority {
    if (type === "new_job" && typeof metadata?.matchScore === "number" && metadata.matchScore >= 90) {
      return "high";
    }
    return TYPE_TO_PRIORITY[type] ?? "normal";
  },
};
