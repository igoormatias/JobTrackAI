"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-client/query-keys";

import { archiveApplication, deleteApplication, favoriteApplication } from "../../services/pipeline-service";
import { removeApplicationFromCache } from "../../utils/update-pipeline-cache";

const invalidateRelated = (queryClient: ReturnType<typeof useQueryClient>) => {
  void queryClient.invalidateQueries({ queryKey: queryKeys.pipeline.all });
  void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
  void queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
  void queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all });
};

export const useFavoriteApplicationMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => favoriteApplication(id),
    onSuccess: () => invalidateRelated(queryClient),
  });
};

export const useArchiveApplicationMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => archiveApplication(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.pipeline.all });
      const previous = queryClient.getQueriesData({ queryKey: queryKeys.pipeline.all });
      removeApplicationFromCache(queryClient, id);
      return { previous };
    },
    onError: (_error, _variables, context) => {
      context?.previous.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
    },
    onSettled: () => invalidateRelated(queryClient),
  });
};

export const useDeleteApplicationMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteApplication(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.pipeline.all });
      const previous = queryClient.getQueriesData({ queryKey: queryKeys.pipeline.all });
      removeApplicationFromCache(queryClient, id);
      return { previous };
    },
    onError: (_error, _variables, context) => {
      context?.previous.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
    },
    onSettled: () => invalidateRelated(queryClient),
  });
};
