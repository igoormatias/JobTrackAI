"use client";

import { useQuery } from "@tanstack/react-query";

import { useProfile } from "@/features/profile/hooks/use-profile";
import { queryKeys } from "@/lib/query-client/query-keys";

import { getRelatedJobs } from "../../services/job-details-service";

export const useRelatedJobsQuery = (id: string, enabled = true) => {
  const { data: profile } = useProfile();
  const profileVersion = profile?.updatedAt ?? "none";

  return useQuery({
    queryKey: [...queryKeys.jobDetails.related(id), profileVersion],
    queryFn: () => getRelatedJobs(id),
    enabled: Boolean(id) && enabled,
  });
};
