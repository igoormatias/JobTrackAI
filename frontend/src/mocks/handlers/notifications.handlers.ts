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
import { paginateWithCursor } from "../utils/pagination";

const parseNotificationListParams = (searchParams: URLSearchParams): NotificationListParams => ({
  cursor: searchParams.get("cursor") ?? undefined,
  limit: Number(searchParams.get("limit") ?? 20) || 20,
  read: searchParams.get("read") === "true" ? true : searchParams.get("read") === "false" ? false : undefined,
  type: (searchParams.get("type") as NotificationType) ?? undefined,
});

export const notificationsHandlers = [
  http.get("*/notifications", ({ request }) => {
    const store = getFixtureStore();
    const params = parseNotificationListParams(new URL(request.url).searchParams);

    let notifications = [...store.notifications];

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
    const store = getFixtureStore();
    const payload = (await request.json()) as MarkNotificationsReadPayload;

    if (payload.all) {
      store.notifications = store.notifications.map((item) => ({ ...item, read: true }));
    } else if (payload.ids?.length) {
      store.notifications = store.notifications.map((item) =>
        payload.ids!.includes(item.id) ? { ...item, read: true } : item,
      );
    }

    return HttpResponse.json<ApiResponse<{ updated: number }>>({
      data: { updated: store.notifications.filter((item) => item.read).length },
      message: "Notifications marked as read",
    });
  }),
];
