"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-client/query-keys";
import { getDashboard } from "@/services/dashboard-service";

export const useDashboard = () =>
  useQuery({
    queryKey: queryKeys.dashboard.detail(),
    queryFn: getDashboard,
  });
