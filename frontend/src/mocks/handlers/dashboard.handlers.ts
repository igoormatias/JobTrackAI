import { http, HttpResponse } from "msw";

import type { ApiResponse } from "@/types";

import { getFixtureStore } from "../fixtures";
import { getPersonalizedDashboard } from "../utils/smart-mock-context";

export const dashboardHandlers = [
  http.get("*/dashboard", () => {
    const store = getFixtureStore();
    const dashboard = getPersonalizedDashboard(store.jobs, store.applications);

    return HttpResponse.json<ApiResponse<typeof dashboard>>({
      data: dashboard,
    });
  }),
];
