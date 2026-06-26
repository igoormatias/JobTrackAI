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
