import type { QueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-client/query-keys";
import type { Application, PipelineData, PipelineStage } from "@/types";

export const updatePipelineCache = (
  queryClient: QueryClient,
  updater: (data: PipelineData) => PipelineData,
) => {
  queryClient.setQueriesData<PipelineData>({ queryKey: queryKeys.pipeline.all }, (oldData) => {
    if (!oldData) return oldData;
    return updater(oldData);
  });
};

export const moveApplicationInCache = (
  queryClient: QueryClient,
  applicationId: string,
  toStage: PipelineStage,
  updated?: Application,
) => {
  updatePipelineCache(queryClient, (data) => {
    let moved: Application | undefined = updated;

    const columns = data.columns.map((column) => {
      const applications = column.applications.filter((app) => {
        if (app.id === applicationId) {
          moved = updated ?? { ...app, stage: toStage, updatedAt: new Date().toISOString() };
          return false;
        }
        return true;
      });

      return { ...column, applications, count: applications.length };
    });

    if (!moved) return data;

    const nextColumns = columns.map((column) => {
      if (column.stage !== toStage) return column;
      const applications = [...column.applications, moved!];
      return { ...column, applications, count: applications.length };
    });

    return { ...data, columns: nextColumns };
  });
};

export const removeApplicationFromCache = (queryClient: QueryClient, applicationId: string) => {
  updatePipelineCache(queryClient, (data) => ({
    ...data,
    columns: data.columns.map((column) => {
      const applications = column.applications.filter((app) => app.id !== applicationId);
      return { ...column, applications, count: applications.length };
    }),
    totalApplications: Math.max(0, data.totalApplications - 1),
  }));
};
