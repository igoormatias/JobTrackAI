"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-client/query-keys";

import {
  connectGoogleCalendar,
  disconnectGoogleCalendar,
  dismissCalendarPrompt,
  getCalendarStatus,
  getGoogleCalendarAuthUrl,
  listCalendarEvents,
} from "../services/calendar-service";

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

export const useGoogleCalendarConnectMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const url = await getGoogleCalendarAuthUrl();
      window.location.href = url;
    },
  });
};

export const useGoogleCalendarCallbackMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: connectGoogleCalendar,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.calendar.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    },
  });
};

export const useGoogleCalendarDisconnectMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: disconnectGoogleCalendar,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.calendar.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    },
  });
};

export const useDismissCalendarPromptMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: dismissCalendarPrompt,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.calendar.all });
    },
  });
};
