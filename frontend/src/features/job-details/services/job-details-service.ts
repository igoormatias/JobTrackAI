import { apiClient } from "@/lib/api-client";
import type { ApiResponse, Job } from "@/types";

import type {
  JobInsight,
  JobMatchDto,
  JobTimelineStep,
  LearningGap,
} from "../types/job-details.types";

export const getJobDetails = async (id: string): Promise<Job> => {
  const { data } = await apiClient.get<ApiResponse<Job>>(`/jobs/${id}`);
  return data.data;
};

export const getJobMatch = async (id: string): Promise<JobMatchDto> => {
  const { data } = await apiClient.get<ApiResponse<JobMatchDto>>(`/jobs/${id}/match`);
  return data.data;
};

export const getRelatedJobs = async (id: string): Promise<Job[]> => {
  const { data } = await apiClient.get<ApiResponse<Job[]>>(`/jobs/${id}/related`);
  return data.data;
};

export const getJobTimeline = async (id: string): Promise<JobTimelineStep[]> => {
  const { data } = await apiClient.get<ApiResponse<JobTimelineStep[]>>(`/jobs/${id}/timeline`);
  return data.data;
};

export const getJobInsights = async (id: string): Promise<JobInsight[]> => {
  const { data } = await apiClient.get<ApiResponse<JobInsight[]>>(`/jobs/${id}/insights`);
  return data.data;
};

export const getLearningGaps = async (id: string): Promise<LearningGap[]> => {
  const { data } = await apiClient.get<ApiResponse<LearningGap[]>>(`/jobs/${id}/learning-gaps`);
  return data.data;
};
