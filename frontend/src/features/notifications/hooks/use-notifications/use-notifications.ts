"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useSettingsQuery } from "@/features/account/queries";
import { queryKeys } from "@/lib/query-client/query-keys";
import { listNotifications, markNotificationsRead } from "@/services/notifications-service";
import type { MarkNotificationsReadPayload, NotificationListParams, RefreshFrequency } from "@/types";

import { useProfile } from "@/features/profile/hooks/use-profile";

const NOTIFICATION_INTERVAL_MS: Record<RefreshFrequency, number | false> = {
  "15m": 900_000,
  "30m": 1_800_000,
  "1h": 3_600_000,
  "2h": 7_200_000,
  manual: false,
};

const resolveRefetchInterval = (frequency?: RefreshFrequency): number | false => {
  if (!frequency) return NOTIFICATION_INTERVAL_MS["1h"];
  return NOTIFICATION_INTERVAL_MS[frequency] ?? NOTIFICATION_INTERVAL_MS["1h"];
};

export const useNotifications = (params?: NotificationListParams) => {
  const { data: profile } = useProfile();
  const { data: settings } = useSettingsQuery();
  const profileVersion = profile?.updatedAt ?? "none";
  const refetchInterval = resolveRefetchInterval(settings?.dashboardNotificationInterval);

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
