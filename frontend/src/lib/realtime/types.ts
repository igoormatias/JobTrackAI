import { REALTIME_EVENT_NAMES, type RealtimeEventName } from "@/events/types/event-names";

export type RealtimeEventHandler = (event: RealtimeEventName, payload?: unknown) => void;

export type RealtimeClient = {
  connect: () => void;
  disconnect: () => void;
  on: (handler: RealtimeEventHandler) => () => void;
};

export { REALTIME_EVENT_NAMES };
