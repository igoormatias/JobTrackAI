"use client";

import { useJobs } from "@/features/jobs/hooks/use-jobs";

export const useTopJobs = () =>
  useJobs({
    limit: 10,
    sortBy: "match",
    sortDirection: "desc",
    matchMin: 60,
    strictProfileMatch: true,
  });
