"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-client/query-keys";

import { generateCareerAnalysis } from "../../services/career-analysis-service";
import type { CareerAnalysisResponse } from "../../types/career-analysis.types";

export const useGenerateCareerAnalysisMutation = (trackingId: string) => {
  const queryClient = useQueryClient();

  return useMutation<CareerAnalysisResponse, Error, boolean>({
    mutationFn: (refresh) => generateCareerAnalysis(trackingId, refresh),
    onSuccess: (data: CareerAnalysisResponse) => {
      queryClient.setQueryData(queryKeys.ai.careerAnalysis(trackingId), data);
    },
  });
};
