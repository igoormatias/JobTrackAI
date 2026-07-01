"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-client/query-keys";

import { getJobTimeline } from "../../services/job-details-service";

export const useJobTimelineQuery = (id: string, enabled = true) =>
  useQuery({
    queryKey: queryKeys.jobDetails.timeline(id),
    queryFn: () => getJobTimeline(id),
    enabled: Boolean(id) && enabled,
  });
