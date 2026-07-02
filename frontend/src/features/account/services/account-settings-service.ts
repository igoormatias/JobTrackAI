import { apiClient } from "@/lib/api-client";
import type { ApiResponse, UpdateSettingsPayload, UserSettings } from "@/types";

export const getSettings = async (): Promise<UserSettings> => {
  const { data } = await apiClient.get<ApiResponse<UserSettings>>("/settings");
  return data.data;
};

export const updateSettings = async (payload: UpdateSettingsPayload): Promise<UserSettings> => {
  const { data } = await apiClient.patch<ApiResponse<UserSettings>>("/settings", payload);
  return data.data;
};
