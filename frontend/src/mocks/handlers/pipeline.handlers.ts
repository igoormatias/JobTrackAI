import { http, HttpResponse } from "msw";

import type { ApiResponse, PipelineData } from "@/types";

import { PIPELINE_STAGES, PIPELINE_STAGE_LABELS } from "../constants/mock-data";
import { getFixtureStore } from "../fixtures";

export const pipelineHandlers = [
  http.get("*/pipeline", () => {
    const store = getFixtureStore();

    const columns = PIPELINE_STAGES.map((stage) => {
      const applications = store.applications.filter((app) => app.stage === stage);

      return {
        stage,
        label: PIPELINE_STAGE_LABELS[stage],
        count: applications.length,
        applications,
      };
    });

    const data: PipelineData = {
      columns,
      totalApplications: store.applications.length,
    };

    return HttpResponse.json<ApiResponse<PipelineData>>({ data });
  }),
];
