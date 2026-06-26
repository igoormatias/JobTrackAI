import { apiClient } from "@/lib/api-client";
import type { ApiResponse, CreateProfilePayload, Profile, UpdateProfilePayload } from "@/types";

export const getProfile = async (): Promise<Profile> => {
  const { data } = await apiClient.get<ApiResponse<Profile>>("/profile");
  return data.data;
};

export const createProfile = async (payload: CreateProfilePayload): Promise<Profile> => {
  const { data } = await apiClient.post<ApiResponse<Profile>>("/profile", payload);
  return data.data;
};

export const updateProfile = async (payload: UpdateProfilePayload): Promise<Profile> => {
  const { data } = await apiClient.patch<ApiResponse<Profile>>("/profile", payload);
  return data.data;
};
