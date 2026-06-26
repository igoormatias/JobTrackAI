import { http, HttpResponse } from "msw";

import type { ApiResponse, UpdateSettingsPayload, UserSettings } from "@/types";

import { getFixtureStore } from "../fixtures";

export const settingsHandlers = [
  http.get("*/settings", () => {
    const store = getFixtureStore();
    return HttpResponse.json<ApiResponse<UserSettings>>({ data: store.settings });
  }),

  http.patch("*/settings", async ({ request }) => {
    const store = getFixtureStore();
    const payload = (await request.json()) as UpdateSettingsPayload;

    store.settings = {
      ...store.settings,
      ...payload,
      updatedAt: new Date().toISOString(),
    };

    return HttpResponse.json<ApiResponse<UserSettings>>({
      data: store.settings,
      message: "Settings updated successfully",
    });
  }),
];
