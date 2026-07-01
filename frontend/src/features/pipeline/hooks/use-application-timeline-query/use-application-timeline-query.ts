"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-client/query-keys";

import { getApplicationTimeline } from "../../services/pipeline-service";

export const useApplicationTimelineQuery = (id: string | null) =>
  useQuery({
    queryKey: queryKeys.pipeline.timeline(id ?? ""),
    queryFn: () => getApplicationTimeline(id!),
    enabled: Boolean(id),
  });
