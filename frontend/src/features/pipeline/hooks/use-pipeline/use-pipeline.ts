"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-client/query-keys";
import { getPipeline } from "@/services/pipeline-service";

export const usePipeline = () =>
  useQuery({
    queryKey: queryKeys.pipeline.detail(),
    queryFn: getPipeline,
  });
