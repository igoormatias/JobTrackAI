"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-client/query-keys";

import { listInterviews } from "../../services/tracking-service";

export const useTrackingInterviewsQuery = (trackingId: string | undefined) =>
  useQuery({
    queryKey: [...queryKeys.tracking.detail(trackingId ?? ""), "interviews"],
    queryFn: () => listInterviews(trackingId!),
    enabled: Boolean(trackingId),
  });
