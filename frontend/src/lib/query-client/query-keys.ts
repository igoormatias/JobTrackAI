export const queryKeys = {
  dashboard: {
    all: ["dashboard"] as const,
    detail: () => [...queryKeys.dashboard.all, "detail"] as const,
  },
  jobs: {
    all: ["jobs"] as const,
    lists: () => [...queryKeys.jobs.all, "list"] as const,
    list: (params: Record<string, unknown>) => [...queryKeys.jobs.lists(), params] as const,
    details: () => [...queryKeys.jobs.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.jobs.details(), id] as const,
  },
  companies: {
    all: ["companies"] as const,
    lists: () => [...queryKeys.companies.all, "list"] as const,
    list: (params: Record<string, unknown>) => [...queryKeys.companies.lists(), params] as const,
  },
  profile: {
    all: ["profile"] as const,
    detail: () => [...queryKeys.profile.all, "detail"] as const,
  },
  applications: {
    all: ["applications"] as const,
    lists: () => [...queryKeys.applications.all, "list"] as const,
    list: (params: Record<string, unknown>) => [...queryKeys.applications.lists(), params] as const,
    details: () => [...queryKeys.applications.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.applications.details(), id] as const,
  },
  pipeline: {
    all: ["pipeline"] as const,
    detail: () => [...queryKeys.pipeline.all, "detail"] as const,
  },
  notifications: {
    all: ["notifications"] as const,
    lists: () => [...queryKeys.notifications.all, "list"] as const,
    list: (params: Record<string, unknown>) => [...queryKeys.notifications.lists(), params] as const,
  },
  settings: {
    all: ["settings"] as const,
    detail: () => [...queryKeys.settings.all, "detail"] as const,
  },
} as const;
