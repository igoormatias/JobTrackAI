"use client";

import { useInfiniteQuery } from "@tanstack/react-query";

import { useProfile } from "@/features/profile/hooks/use-profile";
import { queryKeys } from "@/lib/query-client/query-keys";
import type { JobListParams } from "@/types";

import { DEFAULT_JOB_LIST_LIMIT } from "../../constants/jobs-constants";
import { listJobs } from "../../services/jobs-service";

export const useInfiniteJobs = (params: JobListParams) => {
  const { data: profile } = useProfile();
  const profileVersion = profile?.updatedAt ?? "none";
  const limit = params.limit ?? DEFAULT_JOB_LIST_LIMIT;

  return useInfiniteQuery({
    queryKey: [...queryKeys.jobs.list({ ...params, limit }), "infinite", profileVersion],
    queryFn: ({ pageParam }) =>
      listJobs({
        ...params,
        limit,
        cursor: pageParam as string | undefined,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => (lastPage.meta.hasMore ? lastPage.meta.nextCursor : undefined),
  });
};
