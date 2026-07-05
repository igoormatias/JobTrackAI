"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { invalidateCareerSurfaces } from "@/lib/query-client/invalidate-career-surfaces";
import { queryKeys } from "@/lib/query-client/query-keys";

import { DEFAULT_CALENDAR_RETURN_TO, setCalendarReturnTo } from "../constants/calendar-oauth";
import {
  connectGoogleCalendar,
  disconnectGoogleCalendar,
  dismissCalendarPrompt,
  getCalendarStatus,
  getGoogleCalendarAuthUrl,
  listCalendarEvents,
  syncGoogleCalendar,
} from "../services/calendar-service";

const invalidateCalendarQueries = (queryClient: ReturnType<typeof useQueryClient>) => {
  invalidateCareerSurfaces(queryClient);
};

export const useCalendarStatusQuery = () =>
  useQuery({
    queryKey: queryKeys.calendar.status(),
    queryFn: getCalendarStatus,
  });

export const useCalendarEventsQuery = (from: string, to: string, enabled = true) =>
  useQuery({
    queryKey: queryKeys.calendar.events(from, to),
    queryFn: () => listCalendarEvents(from, to),
    enabled,
  });

export const useGoogleCalendarConnectMutation = (returnTo = DEFAULT_CALENDAR_RETURN_TO) =>
  useMutation({
    mutationFn: async () => {
      setCalendarReturnTo(returnTo);
      const url = await getGoogleCalendarAuthUrl();
      window.location.href = url;
    },
  });

export const useGoogleCalendarCallbackMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: connectGoogleCalendar,
    onSuccess: () => {
      invalidateCalendarQueries(queryClient);
    },
  });
};

export const useGoogleCalendarDisconnectMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: disconnectGoogleCalendar,
    onSuccess: () => {
      invalidateCalendarQueries(queryClient);
    },
  });
};

export const useGoogleCalendarSyncMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: syncGoogleCalendar,
    onSuccess: () => {
      invalidateCalendarQueries(queryClient);
    },
  });
};

export const useDismissCalendarPromptMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: dismissCalendarPrompt,
    onSuccess: () => {
      invalidateCalendarQueries(queryClient);
    },
  });
};
