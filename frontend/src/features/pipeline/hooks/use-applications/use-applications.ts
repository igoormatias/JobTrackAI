"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-client/query-keys";
import { listApplications, updateApplication } from "@/services/applications-service";
import type { ApplicationListParams, UpdateApplicationPayload } from "@/types";

export const useApplications = (params?: ApplicationListParams) =>
  useQuery({
    queryKey: queryKeys.applications.list(params ?? {}),
    queryFn: () => listApplications(params),
  });

export const useUpdateApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateApplicationPayload }) =>
      updateApplication(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.applications.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.pipeline.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
};
