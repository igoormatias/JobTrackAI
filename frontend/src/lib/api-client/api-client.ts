import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import type { QueryClient } from "@tanstack/react-query";

import {
  AUTH_SESSION_EXPIRED_EVENT,
  AUTH_SESSION_INVALID_EVENT,
  emitSessionExpired,
  emitSessionInvalid,
} from "@/features/auth/utils/auth-utils";

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

let sessionQueryClient: QueryClient | null = null;

const SESSION_PATHS = ["/auth/me", "/auth/refresh"];

const isSessionPath = (url?: string): boolean =>
  Boolean(url && SESSION_PATHS.some((path) => url.includes(path)));

export const configureApiClient = (queryClient: QueryClient): void => {
  sessionQueryClient = queryClient;
};

const clearSessionState = (): void => {
  void sessionQueryClient?.clear();
  emitSessionInvalid();
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
    const status = error.response?.status;

    if (status === 500 && isSessionPath(originalRequest?.url)) {
      clearSessionState();
      return Promise.reject(error);
    }

    if (!originalRequest || status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (originalRequest.url?.includes("/auth/refresh") || originalRequest.url?.includes("/auth/login")) {
      clearSessionState();
      emitSessionExpired();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      await apiClient.post("/auth/refresh");
      return apiClient(originalRequest);
    } catch (refreshError) {
      clearSessionState();
      emitSessionExpired();
      return Promise.reject(refreshError);
    }
  },
);

export { AUTH_SESSION_EXPIRED_EVENT, AUTH_SESSION_INVALID_EVENT };
