import { apiClient } from "@/lib/api-client";
import type { ApiResponse, Application, PipelineData, PipelineListParams, PipelineStage, TimelineEvent } from "@/types";

export type {
  CreatePipelineApplicationPayload,
  PipelineServicePlanned,
  UpdateApplicationNotesPayload,
  UpdateTimelineEventPayload,
} from "../types/pipeline-contracts.types";

export const getPipeline = async (params?: PipelineListParams): Promise<PipelineData> => {
  const { data } = await apiClient.get<ApiResponse<PipelineData>>("/pipeline", { params });
  return data.data;
};

export const moveApplication = async (id: string, stage: PipelineStage): Promise<Application> => {
  const { data } = await apiClient.patch<ApiResponse<Application>>(`/pipeline/${id}/status`, { stage });
  return data.data;
};

export const favoriteApplication = async (id: string): Promise<Application> => {
  const { data } = await apiClient.patch<ApiResponse<Application>>(`/pipeline/${id}/favorite`);
  return data.data;
};

export const archiveApplication = async (id: string): Promise<Application> => {
  const { data } = await apiClient.patch<ApiResponse<Application>>(`/pipeline/${id}/archive`);
  return data.data;
};

export const deleteApplication = async (id: string): Promise<void> => {
  await apiClient.delete(`/pipeline/${id}`);
};

export const getApplicationTimeline = async (id: string): Promise<TimelineEvent[]> => {
  const { data } = await apiClient.get<ApiResponse<TimelineEvent[]>>(`/pipeline/${id}/timeline`);
  return data.data;
};

// @planned-etapa-12 — contratos em ../types/pipeline-contracts.types.ts
// createApplication, updateApplicationNotes, updateTimelineEvent
