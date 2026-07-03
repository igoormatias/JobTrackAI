export const queryKeys = {
  auth: {
    all: ["auth"] as const,
    me: () => [...queryKeys.auth.all, "me"] as const,
    session: () => [...queryKeys.auth.all, "session"] as const,
  },
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
  jobDetails: {
    all: ["job-details"] as const,
    detail: (id: string) => [...queryKeys.jobDetails.all, "detail", id] as const,
    match: (id: string) => [...queryKeys.jobDetails.all, "match", id] as const,
    related: (id: string) => [...queryKeys.jobDetails.all, "related", id] as const,
    timeline: (id: string) => [...queryKeys.jobDetails.all, "timeline", id] as const,
    insights: (id: string) => [...queryKeys.jobDetails.all, "insights", id] as const,
    learningGaps: (id: string) => [...queryKeys.jobDetails.all, "learning-gaps", id] as const,
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
    boards: () => [...queryKeys.pipeline.all, "board"] as const,
    board: (params: Record<string, unknown>) => [...queryKeys.pipeline.boards(), params] as const,
    detail: (id: string) => [...queryKeys.pipeline.all, "detail", id] as const,
    timeline: (id: string) => [...queryKeys.pipeline.all, "timeline", id] as const,
  },
  tracking: {
    all: ["tracking"] as const,
    lists: () => [...queryKeys.tracking.all, "list"] as const,
    detail: (id: string) => [...queryKeys.tracking.all, "detail", id] as const,
    timeline: (id: string) => [...queryKeys.tracking.all, "timeline", id] as const,
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
  ai: {
    all: ["ai"] as const,
    careerAnalysis: (trackingId: string) => [...queryKeys.ai.all, "career-analysis", trackingId] as const,
  },
} as const;
