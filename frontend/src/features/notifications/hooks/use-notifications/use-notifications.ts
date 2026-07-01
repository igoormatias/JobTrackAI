"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-client/query-keys";
import { listNotifications, markNotificationsRead } from "@/services/notifications-service";
import type { MarkNotificationsReadPayload, NotificationListParams } from "@/types";

import { useProfile } from "@/features/profile/hooks/use-profile";

export const useNotifications = (params?: NotificationListParams) => {
  const { data: profile } = useProfile();
  const profileVersion = profile?.updatedAt ?? "none";

  return useQuery({
    queryKey: [...queryKeys.notifications.list(params ?? {}), profileVersion],
    queryFn: () => listNotifications(params),
  });
};

export const useMarkNotificationsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: MarkNotificationsReadPayload) => markNotificationsRead(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
};
