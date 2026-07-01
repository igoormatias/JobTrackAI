"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-client/query-keys";

import { getRelatedJobs } from "../../services/job-details-service";

export const useRelatedJobsQuery = (id: string, enabled = true) =>
  useQuery({
    queryKey: queryKeys.jobDetails.related(id),
    queryFn: () => getRelatedJobs(id),
    enabled: Boolean(id) && enabled,
  });
