import { apiClient } from "@/lib/api-client";
import type { ApiResponse, CursorPaginatedResponse, Job, JobListParams } from "@/types";

export const listJobs = async (params?: JobListParams): Promise<CursorPaginatedResponse<Job>> => {
  const { data } = await apiClient.get<CursorPaginatedResponse<Job>>("/jobs", { params });
  return data;
};

export const getJob = async (id: string): Promise<Job> => {
  const { data } = await apiClient.get<ApiResponse<Job>>(`/jobs/${id}`);
  return data.data;
};

export const favoriteJob = async (id: string, isFavorite = true): Promise<Job> => {
  const { data } = await apiClient.patch<ApiResponse<Job>>(`/jobs/${id}/favorite`, { isFavorite });
  return data.data;
};

export const applyToJob = async (id: string): Promise<Job> => {
  const { data } = await apiClient.post<ApiResponse<Job>>(`/jobs/${id}/apply`);
  return data.data;
};

export const removeJobApplication = async (id: string): Promise<Job> => {
  const { data } = await apiClient.delete<ApiResponse<Job>>(`/jobs/${id}/apply`);
  return data.data;
};

export const markJobViewed = async (id: string): Promise<Job> => {
  const { data } = await apiClient.post<ApiResponse<Job>>(`/jobs/${id}/view`);
  return data.data;
};
