import { queryKeys } from "./query-keys";
import type { QueryClient } from "@tanstack/react-query";

export const invalidateCareerSurfaces = (queryClient: QueryClient): void => {
  void queryClient.invalidateQueries({ queryKey: queryKeys.calendar.all });
  void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
  void queryClient.invalidateQueries({ queryKey: queryKeys.pipeline.all });
  void queryClient.invalidateQueries({ queryKey: queryKeys.tracking.all });
  void queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all });
};
