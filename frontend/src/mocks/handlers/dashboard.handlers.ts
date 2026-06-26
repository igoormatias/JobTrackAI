import { http, HttpResponse } from "msw";

import type { ApiResponse } from "@/types";

import { getFixtureStore } from "../fixtures";

export const dashboardHandlers = [
  http.get("*/dashboard", () => {
    const store = getFixtureStore();

    return HttpResponse.json<ApiResponse<typeof store.dashboard>>({
      data: store.dashboard,
    });
  }),
];
