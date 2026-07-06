import { apiClient } from "@/lib/api-client";
import type {
  ApiResponse,
  CursorPaginatedResponse,
  DeleteNotificationsPayload,
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

export const getUnreadNotificationCount = async (): Promise<number> => {
  const { data } = await apiClient.get<ApiResponse<{ count: number }>>("/notifications/unread-count");
  return data.data.count;
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

export const deleteNotification = async (id: string): Promise<void> => {
  await apiClient.delete(`/notifications/${id}`);
};

export const deleteNotifications = async (
  payload: DeleteNotificationsPayload,
): Promise<{ deleted: number }> => {
  const { data } = await apiClient.delete<ApiResponse<{ deleted: number }>>("/notifications", {
    data: payload,
  });
  return data.data;
};
