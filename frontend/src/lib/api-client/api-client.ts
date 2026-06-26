import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

import { AUTH_SESSION_EXPIRED_EVENT, emitSessionExpired } from "@/features/auth/utils/auth-utils";

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
  withCredentials: true,
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;

    if (!originalRequest || error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (originalRequest.url?.includes("/auth/refresh") || originalRequest.url?.includes("/auth/login")) {
      emitSessionExpired();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      await apiClient.post("/auth/refresh");
      return apiClient(originalRequest);
    } catch (refreshError) {
      emitSessionExpired();
      return Promise.reject(refreshError);
    }
  },
);

export { AUTH_SESSION_EXPIRED_EVENT };
