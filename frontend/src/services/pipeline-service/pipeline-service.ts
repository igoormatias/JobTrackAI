import { apiClient } from "@/lib/api-client";
import type { ApiResponse, PipelineData } from "@/types";

export const getPipeline = async (): Promise<PipelineData> => {
  const { data } = await apiClient.get<ApiResponse<PipelineData>>("/pipeline");
  return data.data;
};
