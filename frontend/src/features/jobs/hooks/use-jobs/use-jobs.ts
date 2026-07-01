"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-client/query-keys";
import { listJobs } from "@/services/jobs-service";
import type { JobListParams } from "@/types";

import { useProfile } from "@/features/profile/hooks/use-profile";

const DEFAULT_JOB_PARAMS: JobListParams = {
  sortBy: "match",
  sortDirection: "desc",
};

export const useJobs = (params?: JobListParams) => {
  const { data: profile } = useProfile();
  const mergedParams = { ...DEFAULT_JOB_PARAMS, ...params };
  const profileVersion = profile?.updatedAt ?? "none";

  return useQuery({
    queryKey: [...queryKeys.jobs.list(mergedParams), profileVersion],
    queryFn: () => listJobs(mergedParams),
  });
};
