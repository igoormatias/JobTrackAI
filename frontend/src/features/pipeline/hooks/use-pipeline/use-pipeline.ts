"use client";

import { useQuery } from "@tanstack/react-query";

import { useProfile } from "@/features/profile/hooks/use-profile";
import { queryKeys } from "@/lib/query-client/query-keys";
import type { PipelineListParams } from "@/types";

import { getPipeline } from "@/features/pipeline/services/pipeline-service";

/** @deprecated Use usePipelineQuery from features/pipeline */
export const usePipeline = (params?: PipelineListParams) => {
  const { data: profile } = useProfile();
  const profileVersion = profile?.updatedAt ?? "none";

  return useQuery({
    queryKey: [...queryKeys.pipeline.board(params ?? {}), profileVersion],
    queryFn: () => getPipeline(params),
  });
};
