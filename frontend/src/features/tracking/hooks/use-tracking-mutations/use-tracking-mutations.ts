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
  updateTrackingVisibility,
  type CreateManualTrackingPayload,
  type CreateTrackingFromJobPayload,
} from "../../services/tracking-service";

export const useCreateTrackingMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTrackingFromJobPayload | CreateManualTrackingPayload) => createTracking(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.pipeline.all });
      await queryClient.invalidateQueries({ queryKey: queryKeys.tracking.all });
      await queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all });
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
    },
  });
};

export const useUpdateTrackingNotesMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes: string | null }) => updateTrackingNotes(id, notes),
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.pipeline.all });
      await queryClient.invalidateQueries({ queryKey: queryKeys.tracking.all });
    },
  });
};
