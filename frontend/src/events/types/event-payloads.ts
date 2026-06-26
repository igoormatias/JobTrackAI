import type { DashboardData, Job, Notification, PipelineData } from "@/types";

import type { RealtimeEventName } from "./event-names";

export type JobsNewPayload = {
  job: Job;
};

export type JobsUpdatePayload = {
  jobId: string;
  changes: Partial<Job>;
};

export type PipelineUpdatePayload = {
  pipeline: PipelineData;
};

export type DashboardUpdatePayload = {
  dashboard: DashboardData;
};

export type NotificationsNewPayload = {
  notification: Notification;
};

export type RealtimeEventPayloadMap = {
  "jobs:new": JobsNewPayload;
  "jobs:update": JobsUpdatePayload;
  "pipeline:update": PipelineUpdatePayload;
  "dashboard:update": DashboardUpdatePayload;
  "notifications:new": NotificationsNewPayload;
};

export type RealtimeEventPayload<T extends RealtimeEventName = RealtimeEventName> =
  RealtimeEventPayloadMap[T];
