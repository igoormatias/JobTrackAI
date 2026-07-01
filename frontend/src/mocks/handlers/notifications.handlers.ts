import { http, HttpResponse } from "msw";

import type {
  ApiResponse,
  CursorPaginatedResponse,
  MarkNotificationsReadPayload,
  Notification,
  NotificationListParams,
  NotificationType,
} from "@/types";

import { getFixtureStore } from "../fixtures";
import { getPersonalizedNotifications } from "../utils/smart-mock-context";
import { paginateWithCursor } from "../utils/pagination";

const parseNotificationListParams = (searchParams: URLSearchParams): NotificationListParams => ({
  cursor: searchParams.get("cursor") ?? undefined,
  limit: Number(searchParams.get("limit") ?? 20) || 20,
  read: searchParams.get("read") === "true" ? true : searchParams.get("read") === "false" ? false : undefined,
  type: (searchParams.get("type") as NotificationType) ?? undefined,
});

let readNotificationIds = new Set<string>();

export const resetNotificationReadState = (): void => {
  readNotificationIds = new Set();
};

export const notificationsHandlers = [
  http.get("*/notifications", ({ request }) => {
    const store = getFixtureStore();
    const params = parseNotificationListParams(new URL(request.url).searchParams);

    let notifications = getPersonalizedNotifications(store.user.id, store.jobs, store.applications).map(
      (item) => ({
        ...item,
        read: item.read || readNotificationIds.has(item.id),
      }),
    );

    if (params.read !== undefined) {
      notifications = notifications.filter((item) => item.read === params.read);
    }

    if (params.type) {
      notifications = notifications.filter((item) => item.type === params.type);
    }

    notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const response = paginateWithCursor(notifications, {
      cursor: params.cursor,
      limit: params.limit,
      getId: (item) => item.id,
      getSortValue: (item) => item.createdAt,
    });

    return HttpResponse.json<CursorPaginatedResponse<Notification>>(response);
  }),

  http.patch("*/notifications/read", async ({ request }) => {
    const payload = (await request.json()) as MarkNotificationsReadPayload;
    const store = getFixtureStore();
    const notifications = getPersonalizedNotifications(store.user.id, store.jobs, store.applications);

    if (payload.all) {
      notifications.forEach((item) => readNotificationIds.add(item.id));
    } else if (payload.ids?.length) {
      payload.ids.forEach((id) => readNotificationIds.add(id));
    }

    const updatedCount = notifications.filter((item) => readNotificationIds.has(item.id)).length;

    return HttpResponse.json<ApiResponse<{ updated: number }>>({
      data: { updated: updatedCount },
      message: "Notifications marked as read",
    });
  }),
];
