import { REALTIME_EVENT_NAMES, type RealtimeClient, type RealtimeEventHandler } from "./types";

const DEFAULT_POLL_INTERVAL_MS = 60_000;

export const createPollingRealtimeClient = (pollIntervalMs = DEFAULT_POLL_INTERVAL_MS): RealtimeClient => {
  const handlers = new Set<RealtimeEventHandler>();
  let intervalId: ReturnType<typeof setInterval> | null = null;

  const emitAll = (): void => {
    for (const handler of handlers) {
      handler(REALTIME_EVENT_NAMES.DASHBOARD_UPDATE);
      handler(REALTIME_EVENT_NAMES.NOTIFICATIONS_NEW);
    }
  };

  return {
    connect: () => {
      if (intervalId) return;
      intervalId = setInterval(emitAll, pollIntervalMs);
    },
    disconnect: () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    },
    on: (handler) => {
      handlers.add(handler);
      return () => handlers.delete(handler);
    },
  };
};
