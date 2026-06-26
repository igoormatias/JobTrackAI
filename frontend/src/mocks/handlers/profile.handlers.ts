import { http, HttpResponse } from "msw";

import type { ApiResponse, Profile, UpdateProfilePayload } from "@/types";

import { getFixtureStore } from "../fixtures";

export const profileHandlers = [
  http.get("*/profile", () => {
    const store = getFixtureStore();
    return HttpResponse.json<ApiResponse<Profile>>({ data: store.profile });
  }),

  http.patch("*/profile", async ({ request }) => {
    const store = getFixtureStore();
    const payload = (await request.json()) as UpdateProfilePayload;

    store.profile = {
      ...store.profile,
      ...payload,
      updatedAt: new Date().toISOString(),
    };

    return HttpResponse.json<ApiResponse<Profile>>({
      data: store.profile,
      message: "Profile updated successfully",
    });
  }),
];
