"use client";

import { createContext, useContext, useEffect, useMemo, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { invalidateCareerSurfaces } from "@/lib/query-client/invalidate-career-surfaces";
import { REALTIME_EVENT_NAMES, type RealtimeEventName } from "@/events/types/event-names";
import { queryKeys } from "@/lib/query-client/query-keys";
import { createPollingRealtimeClient } from "@/lib/realtime/polling-realtime-client";
import { createSocketRealtimeClient } from "@/lib/realtime/socket-realtime-client";
import type { RealtimeClient } from "@/lib/realtime/types";

import { useSession } from "@/features/auth/hooks/use-auth";

type RealtimeContextValue = {
  client: RealtimeClient | null;
};

const RealtimeContext = createContext<RealtimeContextValue>({ client: null });

const resolveTransport = (): "polling" | "socket" => {
  const transport = process.env.NEXT_PUBLIC_REALTIME_TRANSPORT ?? "polling";
  return transport === "socket" ? "socket" : "polling";
};

const invalidateForEvent = (
  queryClient: ReturnType<typeof useQueryClient>,
  event: RealtimeEventName,
): void => {
  switch (event) {
    case REALTIME_EVENT_NAMES.JOBS_NEW:
    case REALTIME_EVENT_NAMES.JOBS_UPDATE:
      void queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all });
      break;
    case REALTIME_EVENT_NAMES.PIPELINE_UPDATE:
      invalidateCareerSurfaces(queryClient);
      break;
    case REALTIME_EVENT_NAMES.DASHBOARD_UPDATE:
      invalidateCareerSurfaces(queryClient);
      break;
    case REALTIME_EVENT_NAMES.NOTIFICATIONS_NEW:
      void queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
      break;
    default:
      break;
  }
};

export const useRealtimeInvalidation = (): void => {
  const queryClient = useQueryClient();
  const { client } = useContext(RealtimeContext);

  useEffect(() => {
    if (!client) return;

    return client.on((event) => {
      invalidateForEvent(queryClient, event);
    });
  }, [client, queryClient]);
};

type RealtimeProviderProps = {
  children: ReactNode;
};

export const RealtimeProvider = ({ children }: RealtimeProviderProps) => {
  const { isAuthenticated } = useSession();

  const client = useMemo<RealtimeClient | null>(() => {
    if (!isAuthenticated) return null;

    return resolveTransport() === "socket"
      ? createSocketRealtimeClient()
      : createPollingRealtimeClient();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!client) return;

    client.connect();
    return () => client.disconnect();
  }, [client]);

  return <RealtimeContext.Provider value={{ client }}>{children}</RealtimeContext.Provider>;
};

export const RealtimeInvalidation = (): null => {
  useRealtimeInvalidation();
  return null;
};
