import type { RealtimeEventName } from "../types/event-names";
import type { RealtimeEventPayload } from "../types/event-payloads";

export type RealtimeEventHandler<T extends RealtimeEventName = RealtimeEventName> = (
  payload: RealtimeEventPayload<T>,
) => void;

export type RealtimeClient = {
  connect: () => Promise<void>;
  disconnect: () => void;
  subscribe: <T extends RealtimeEventName>(
    event: T,
    handler: RealtimeEventHandler<T>,
  ) => () => void;
  isConnected: () => boolean;
};

export type EventBus = {
  emit: <T extends RealtimeEventName>(event: T, payload: RealtimeEventPayload<T>) => void;
  on: <T extends RealtimeEventName>(event: T, handler: RealtimeEventHandler<T>) => () => void;
  off: <T extends RealtimeEventName>(event: T, handler: RealtimeEventHandler<T>) => void;
};
