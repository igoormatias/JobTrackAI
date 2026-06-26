"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-client/query-keys";
import { listJobs } from "@/services/jobs-service";
import type { JobListParams } from "@/types";

export const useJobs = (params?: JobListParams) =>
  useQuery({
    queryKey: queryKeys.jobs.list(params ?? {}),
    queryFn: () => listJobs(params),
  });
