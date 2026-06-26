import { apiClient } from "@/lib/api-client";
import type {
  ApiResponse,
  Application,
  ApplicationListParams,
  CursorPaginatedResponse,
  UpdateApplicationPayload,
} from "@/types";

export const listApplications = async (
  params?: ApplicationListParams,
): Promise<CursorPaginatedResponse<Application>> => {
  const { data } = await apiClient.get<CursorPaginatedResponse<Application>>("/applications", {
    params,
  });
  return data;
};

export const updateApplication = async (
  id: string,
  payload: UpdateApplicationPayload,
): Promise<Application> => {
  const { data } = await apiClient.patch<ApiResponse<Application>>(`/applications/${id}`, payload);
  return data.data;
};
