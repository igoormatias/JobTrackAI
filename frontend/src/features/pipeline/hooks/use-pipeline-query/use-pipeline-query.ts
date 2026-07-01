"use client";

import { useQuery } from "@tanstack/react-query";

import { useProfile } from "@/features/profile/hooks/use-profile";
import { queryKeys } from "@/lib/query-client/query-keys";
import type { PipelineListParams } from "@/types";

import { getPipeline } from "../../services/pipeline-service";

export const usePipelineQuery = (params?: PipelineListParams) => {
  const { data: profile } = useProfile();
  const profileVersion = profile?.updatedAt ?? "none";
  const queryParams = params ?? {};

  return useQuery({
    queryKey: [...queryKeys.pipeline.board(queryParams), profileVersion],
    queryFn: () => getPipeline(queryParams),
  });
};
