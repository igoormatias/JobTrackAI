"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-client/query-keys";
import type { PipelineStage } from "@/types";

import { moveApplication } from "../../services/pipeline-service";
import { moveApplicationInCache } from "../../utils/update-pipeline-cache";

export const useMoveApplicationMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, stage }: { id: string; stage: PipelineStage }) => moveApplication(id, stage),
    onMutate: async ({ id, stage }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.pipeline.all });
      const previous = queryClient.getQueriesData({ queryKey: queryKeys.pipeline.all });
      moveApplicationInCache(queryClient, id, stage);
      return { previous };
    },
    onError: (_error, _variables, context) => {
      context?.previous.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.pipeline.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.jobDetails.all });
    },
  });
};
