export { queryKeys } from "@/lib/query-client/query-keys";

export const dashboardQueryKeys = {
  all: ["dashboard"] as const,
  detail: () => ["dashboard", "detail"] as const,
};
