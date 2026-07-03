import { io, type Socket } from "socket.io-client";

import { REALTIME_EVENT_NAMES, type RealtimeClient, type RealtimeEventHandler } from "./types";
import type { RealtimeEventName } from "@/events/types/event-names";

const SOCKET_EVENTS: RealtimeEventName[] = Object.values(REALTIME_EVENT_NAMES);

export const createSocketRealtimeClient = (apiUrl?: string): RealtimeClient => {
  const handlers = new Set<RealtimeEventHandler>();
  let socket: Socket | null = null;

  const baseUrl = apiUrl ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";

  const notify = (event: RealtimeEventName, payload?: unknown): void => {
    for (const handler of handlers) {
      handler(event, payload);
    }
  };

  return {
    connect: () => {
      if (socket?.connected) return;

      socket = io(baseUrl, {
        withCredentials: true,
        transports: ["websocket", "polling"],
        autoConnect: true,
      });

      for (const eventName of SOCKET_EVENTS) {
        socket.on(eventName, (payload: unknown) => notify(eventName, payload));
      }
    },
    disconnect: () => {
      socket?.disconnect();
      socket = null;
    },
    on: (handler) => {
      handlers.add(handler);
      return () => handlers.delete(handler);
    },
  };
};
