"use client";

import { useQuery } from "@tanstack/react-query";

import { useProfile } from "@/features/profile/hooks/use-profile";
import { queryKeys } from "@/lib/query-client/query-keys";

import { getJobMatch } from "../../services/job-details-service";

export const useJobMatchQuery = (id: string, enabled = true) => {
  const { data: profile } = useProfile();
  const profileVersion = profile?.updatedAt ?? "none";

  return useQuery({
    queryKey: [...queryKeys.jobDetails.match(id), profileVersion],
    queryFn: () => getJobMatch(id),
    enabled: Boolean(id) && enabled,
  });
};
