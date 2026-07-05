"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { queryKeys } from "@/lib/query-client/query-keys";
import type { JobPriority, JobVisibility, PipelineStage } from "@/types";

import {
  createTracking,
  moveTrackingStage,
  toggleTrackingFavorite,
  updateTrackingNotes,
  updateTrackingPriority,
  updateTrackingProcess,
  updateTrackingVisibility,
  type CreateManualTrackingPayload,
  type CreateTrackingFromJobPayload,
  type UpdateProcessPayload,
} from "../../services/tracking-service";

const invalidateNotifications = (queryClient: ReturnType<typeof useQueryClient>): void => {
  void queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
};

export const useCreateTrackingMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTrackingFromJobPayload | CreateManualTrackingPayload) => createTracking(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.pipeline.all });
      await queryClient.invalidateQueries({ queryKey: queryKeys.tracking.all });
      await queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all });
      invalidateNotifications(queryClient);
      toast.success("Processo adicionado ao acompanhamento");
    },
    onError: () => toast.error("Não foi possível adicionar o processo"),
  });
};

export const useMoveTrackingStageMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, stage, occurredAt }: { id: string; stage: PipelineStage; occurredAt: string }) =>
      moveTrackingStage(id, { stage, occurredAt }),
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.pipeline.all });
      await queryClient.invalidateQueries({ queryKey: queryKeys.tracking.all });
      invalidateNotifications(queryClient);
    },
  });
};

export const useTrackingFavoriteMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => toggleTrackingFavorite(id),
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.pipeline.all });
      await queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all });
      invalidateNotifications(queryClient);
    },
  });
};

export const useTrackingPriorityMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, priority }: { id: string; priority: JobPriority }) => updateTrackingPriority(id, priority),
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.pipeline.all });
      await queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all });
      invalidateNotifications(queryClient);
    },
  });
};

export const useTrackingVisibilityMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, visibility }: { id: string; visibility: JobVisibility }) =>
      updateTrackingVisibility(id, visibility),
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.pipeline.all });
      await queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all });
      invalidateNotifications(queryClient);
    },
  });
};

export const useUpdateTrackingNotesMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes: string | null }) => updateTrackingNotes(id, notes),
    onSettled: async (_data, _error, variables) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.pipeline.all });
      await queryClient.invalidateQueries({ queryKey: queryKeys.tracking.all });
      await queryClient.invalidateQueries({ queryKey: queryKeys.tracking.detail(variables.id) });
      invalidateNotifications(queryClient);
    },
  });
};

export const useUpdateTrackingProcessMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateProcessPayload }) =>
      updateTrackingProcess(id, payload),
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.pipeline.all });
      await queryClient.invalidateQueries({ queryKey: queryKeys.tracking.all });
      await queryClient.invalidateQueries({ queryKey: queryKeys.tracking.detail(variables.id) });
      invalidateNotifications(queryClient);
      toast.success("Processo atualizado");
    },
    onError: () => toast.error("Não foi possível atualizar o processo"),
  });
};
