"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-client/query-keys";

import { getTrackingById } from "../../services/tracking-service";

export const useTrackingByIdQuery = (trackingId: string) =>
  useQuery({
    queryKey: queryKeys.tracking.detail(trackingId),
    queryFn: () => getTrackingById(trackingId),
    enabled: Boolean(trackingId),
  });
