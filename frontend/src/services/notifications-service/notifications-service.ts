import { apiClient } from "@/lib/api-client";
import type {
  ApiResponse,
  CursorPaginatedResponse,
  MarkNotificationsReadPayload,
  Notification,
  NotificationListParams,
} from "@/types";

export const listNotifications = async (
  params?: NotificationListParams,
): Promise<CursorPaginatedResponse<Notification>> => {
  const { data } = await apiClient.get<CursorPaginatedResponse<Notification>>("/notifications", {
    params,
  });
  return data;
};

export const markNotificationsRead = async (
  payload: MarkNotificationsReadPayload,
): Promise<{ updated: number }> => {
  const { data } = await apiClient.patch<ApiResponse<{ updated: number }>>(
    "/notifications/read",
    payload,
  );
  return data.data;
};
