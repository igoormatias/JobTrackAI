"use client";

import { useQuery } from "@tanstack/react-query";

import { useProfile } from "@/features/profile/hooks/use-profile";
import { queryKeys } from "@/lib/query-client/query-keys";

import { getJobDetails } from "../../services/job-details-service";

export const useJobDetailsQuery = (id: string) => {
  const { data: profile } = useProfile();
  const profileVersion = profile?.updatedAt ?? "none";

  return useQuery({
    queryKey: [...queryKeys.jobDetails.detail(id), profileVersion],
    queryFn: () => getJobDetails(id),
    enabled: Boolean(id),
  });
};
