"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-client/query-keys";
import { listNotifications, markNotificationsRead } from "@/services/notifications-service";
import type { MarkNotificationsReadPayload, NotificationListParams } from "@/types";

export const useNotifications = (params?: NotificationListParams) =>
  useQuery({
    queryKey: queryKeys.notifications.list(params ?? {}),
    queryFn: () => listNotifications(params),
  });

export const useMarkNotificationsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: MarkNotificationsReadPayload) => markNotificationsRead(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
};
