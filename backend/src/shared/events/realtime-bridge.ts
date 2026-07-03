import type { Server } from "socket.io";

import { logger } from "../../config/logger.js";
import type { DomainEvent } from "../domain/domain-event.js";
import type { EventBus } from "./event-bus.interface.js";

const REALTIME_EVENTS = {
  JOBS_NEW: "jobs:new",
  JOBS_UPDATE: "jobs:update",
  PIPELINE_UPDATE: "pipeline:update",
  DASHBOARD_UPDATE: "dashboard:update",
  NOTIFICATIONS_NEW: "notifications:new",
} as const;

type RealtimePayload = {
  userId: string;
  event: string;
  data?: Record<string, unknown>;
};

const extractUserId = (event: DomainEvent): string | null => {
  const payload = (event as DomainEvent & { payload?: { userId?: string } }).payload;
  return payload?.userId ?? null;
};

const mapDomainEventToRealtime = (eventName: string): string | null => {
  switch (eventName) {
    case "process_created":
    case "status_changed":
    case "job_favorited":
    case "priority_changed":
      return REALTIME_EVENTS.PIPELINE_UPDATE;
    case "interview_reminder":
      return REALTIME_EVENTS.NOTIFICATIONS_NEW;
    case "job_closed":
      return REALTIME_EVENTS.JOBS_UPDATE;
    case "notification_created":
      return REALTIME_EVENTS.NOTIFICATIONS_NEW;
    case "SettingsUpdated":
    case "ProfileUpdated":
      return REALTIME_EVENTS.DASHBOARD_UPDATE;
    default:
      return null;
  }
};

export const setupRealtimeBridge = (eventBus: EventBus, io: Server): void => {
  const emitToUser = (userId: string, event: string, data?: Record<string, unknown>): void => {
    io.to(`user:${userId}`).emit(event, data ?? {});
  };

  const bridgeHandler = async (event: DomainEvent): Promise<void> => {
    const userId = extractUserId(event);
    const realtimeEvent = mapDomainEventToRealtime(event.eventName);

    if (!userId || !realtimeEvent) return;

    const payload: RealtimePayload = {
      userId,
      event: event.eventName,
    };

    emitToUser(userId, realtimeEvent, payload);

    if (realtimeEvent === REALTIME_EVENTS.PIPELINE_UPDATE) {
      emitToUser(userId, REALTIME_EVENTS.DASHBOARD_UPDATE, payload);
    }

    if (event.eventName === "job_closed") {
      emitToUser(userId, REALTIME_EVENTS.NOTIFICATIONS_NEW, payload);
    }

    logger.debug({ userId, domainEvent: event.eventName, realtimeEvent }, "Realtime event bridged");
  };

  const subscribedEvents = [
    "process_created",
    "status_changed",
    "job_favorited",
    "priority_changed",
    "interview_reminder",
    "job_closed",
    "notification_created",
    "SettingsUpdated",
    "ProfileUpdated",
  ];

  for (const eventName of subscribedEvents) {
    eventBus.subscribe(eventName, bridgeHandler);
  }
};

export { REALTIME_EVENTS };
