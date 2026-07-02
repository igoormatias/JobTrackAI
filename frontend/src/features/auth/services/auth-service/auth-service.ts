import { apiClient } from "@/lib/api-client";
import type { ApiResponse } from "@/types";

import type { AuthResponse, LoginPayload, OnboardingCompletePayload } from "../../types";

type AuthApiResponse = ApiResponse<AuthResponse>;

export const loginWithGoogle = async (payload: LoginPayload): Promise<AuthResponse> => {
  const { data } = await apiClient.post<AuthApiResponse>("/auth/login", payload);
  return data.data;
};

export const logout = async (): Promise<void> => {
  await apiClient.post("/auth/logout");
};

export const refreshSession = async (): Promise<AuthResponse> => {
  const { data } = await apiClient.post<AuthApiResponse>("/auth/refresh");
  return data.data;
};

export const getCurrentUser = async (): Promise<AuthResponse> => {
  const { data } = await apiClient.get<AuthApiResponse>("/auth/me");
  return data.data;
};

export const completeOnboarding = async (
  payload: OnboardingCompletePayload,
): Promise<{ user: AuthResponse["user"] }> => {
  const { data } = await apiClient.post<ApiResponse<{ user: AuthResponse["user"] }>>(
    "/auth/onboarding/complete",
    payload,
  );
  return data.data;
};
