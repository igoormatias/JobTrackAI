import { apiClient } from "@/lib/api-client";
import type { ApiResponse, Profile, UpdateProfilePayload } from "@/types";

export const getProfile = async (): Promise<Profile> => {
  const { data } = await apiClient.get<ApiResponse<Profile>>("/profile");
  return data.data;
};

export const updateProfile = async (payload: UpdateProfilePayload): Promise<Profile> => {
  const { data } = await apiClient.patch<ApiResponse<Profile>>("/profile", payload);
  return data.data;
};
