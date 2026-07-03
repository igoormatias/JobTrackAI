"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-client/query-keys";

import { getCareerAnalysis } from "../../services/career-analysis-service";

export const useCareerAnalysisQuery = (trackingId?: string) =>
  useQuery({
    queryKey: queryKeys.ai.careerAnalysis(trackingId ?? ""),
    queryFn: () => getCareerAnalysis(trackingId!),
    enabled: Boolean(trackingId),
  });
