export const REALTIME_EVENT_NAMES = {
  JOBS_NEW: "jobs:new",
  JOBS_UPDATE: "jobs:update",
  PIPELINE_UPDATE: "pipeline:update",
  DASHBOARD_UPDATE: "dashboard:update",
  NOTIFICATIONS_NEW: "notifications:new",
} as const;

export type RealtimeEventName = (typeof REALTIME_EVENT_NAMES)[keyof typeof REALTIME_EVENT_NAMES];
