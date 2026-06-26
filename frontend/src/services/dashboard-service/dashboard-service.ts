import { apiClient } from "@/lib/api-client";
import type { ApiResponse, DashboardData } from "@/types";

export const getDashboard = async (): Promise<DashboardData> => {
  const { data } = await apiClient.get<ApiResponse<DashboardData>>("/dashboard");
  return data.data;
};
