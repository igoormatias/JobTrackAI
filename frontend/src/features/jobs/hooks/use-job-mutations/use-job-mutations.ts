"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { invalidateCareerSurfaces } from "@/lib/query-client/invalidate-career-surfaces";
import { queryKeys } from "@/lib/query-client/query-keys";
import type { Job } from "@/types";

import { favoriteJob, markJobViewed } from "../../services/jobs-service";

export const useJobMutations = () => {
  const queryClient = useQueryClient();

  const updateJobInCache = (updatedJob: Job) => {
    queryClient.setQueriesData({ queryKey: queryKeys.jobs.lists() }, (oldData: unknown) => {
      if (!oldData || typeof oldData !== "object") return oldData;

      if ("pages" in (oldData as { pages?: unknown[] })) {
        const infiniteData = oldData as {
          pages: { data: Job[]; meta: unknown }[];
        };

        return {
          ...infiniteData,
          pages: infiniteData.pages.map((page) => ({
            ...page,
            data: page.data.map((job) => (job.id === updatedJob.id ? updatedJob : job)),
          })),
        };
      }

      if ("data" in (oldData as { data?: Job[] })) {
        const listData = oldData as { data: Job[]; meta?: unknown };
        return {
          ...listData,
          data: listData.data.map((job) => (job.id === updatedJob.id ? updatedJob : job)),
        };
      }

      return oldData;
    });

    queryClient.setQueryData(queryKeys.jobs.detail(updatedJob.id), updatedJob);
    queryClient.setQueryData(queryKeys.jobDetails.detail(updatedJob.id), updatedJob);
  };

  const favoriteMutation = useMutation({
    mutationFn: ({ id, isFavorite }: { id: string; isFavorite: boolean }) => favoriteJob(id, isFavorite),
    onSuccess: (job) => {
      updateJobInCache(job);
      invalidateCareerSurfaces(queryClient);
    },
  });

  const viewMutation = useMutation({
    mutationFn: (id: string) => markJobViewed(id),
    onSuccess: (job) => {
      updateJobInCache(job);
    },
  });

  return {
    favoriteMutation,
    viewMutation,
  };
};
