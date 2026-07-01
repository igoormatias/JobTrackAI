"use client";

import { useJobs } from "@/features/jobs/hooks/use-jobs";

export const useTopJobs = () =>
  useJobs({
    limit: 5,
    sortBy: "match",
    sortDirection: "desc",
  });
