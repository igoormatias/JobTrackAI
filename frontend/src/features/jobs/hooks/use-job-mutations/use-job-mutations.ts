"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-client/query-keys";
import type { Job } from "@/types";

import { applyToJob, favoriteJob, markJobViewed, removeJobApplication } from "../../services/jobs-service";

export const useJobMutations = () => {
  const queryClient = useQueryClient();

  const invalidateJobs = async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all });
  };

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
  };

  const favoriteMutation = useMutation({
    mutationFn: ({ id, isFavorite }: { id: string; isFavorite: boolean }) => favoriteJob(id, isFavorite),
    onSuccess: (job) => {
      updateJobInCache(job);
      void invalidateJobs();
    },
  });

  const applyMutation = useMutation({
    mutationFn: (id: string) => applyToJob(id),
    onSuccess: (job) => {
      updateJobInCache(job);
      void invalidateJobs();
    },
  });

  const removeApplicationMutation = useMutation({
    mutationFn: (id: string) => removeJobApplication(id),
    onSuccess: (job) => {
      updateJobInCache(job);
      void invalidateJobs();
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
    applyMutation,
    removeApplicationMutation,
    viewMutation,
  };
};
