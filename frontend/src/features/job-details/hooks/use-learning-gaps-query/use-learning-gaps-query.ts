"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-client/query-keys";

import { getLearningGaps } from "../../services/job-details-service";

export const useLearningGapsQuery = (id: string, enabled = true) =>
  useQuery({
    queryKey: queryKeys.jobDetails.learningGaps(id),
    queryFn: () => getLearningGaps(id),
    enabled: Boolean(id) && enabled,
  });
