"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-client/query-keys";

import { getJobInsights } from "../../services/job-details-service";

export const useJobInsightsQuery = (id: string, enabled = true) =>
  useQuery({
    queryKey: queryKeys.jobDetails.insights(id),
    queryFn: () => getJobInsights(id),
    enabled: Boolean(id) && enabled,
  });
