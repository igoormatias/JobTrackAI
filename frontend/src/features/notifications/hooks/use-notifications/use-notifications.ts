"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useSettingsQuery } from "@/features/account/queries";
import { queryKeys } from "@/lib/query-client/query-keys";
import { resolveRefreshIntervalMs } from "@/lib/refresh-frequency";
import { listNotifications, markNotificationsRead } from "@/services/notifications-service";
import type { MarkNotificationsReadPayload, NotificationListParams } from "@/types";

import { useProfile } from "@/features/profile/hooks/use-profile";

export const useNotifications = (params?: NotificationListParams) => {
  const { data: profile } = useProfile();
  const { data: settings } = useSettingsQuery();
  const profileVersion = profile?.updatedAt ?? "none";
  const refetchInterval = resolveRefreshIntervalMs(settings?.dashboardNotificationInterval);

  return useQuery({
    queryKey: [...queryKeys.notifications.list(params ?? {}), profileVersion],
    queryFn: () => listNotifications(params),
    refetchInterval,
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
