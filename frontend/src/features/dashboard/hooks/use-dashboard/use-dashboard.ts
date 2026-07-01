"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-client/query-keys";
import { getDashboard } from "@/services/dashboard-service";

import { useProfile } from "@/features/profile/hooks/use-profile";

export const useDashboard = () => {
  const { data: profile } = useProfile();
  const profileVersion = profile?.updatedAt ?? "none";

  return useQuery({
    queryKey: [...queryKeys.dashboard.detail(), profileVersion],
    queryFn: getDashboard,
  });
};
