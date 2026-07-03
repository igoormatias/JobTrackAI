export type ProviderDto = {
  name: string;
  displayName: string;
  enabled: boolean;
  lastHealthAt: string | null;
  lastRunAt: string | null;
};

export type ProviderHealthDto = {
  provider: string;
  status: "healthy" | "degraded" | "unhealthy";
  message?: string;
  checkedAt: string;
};

export type ProviderExecutionDto = {
  id: string;
  providerName: string;
  status: string;
  startedAt: string;
  finishedAt: string | null;
  durationMs: number | null;
  foundCount: number;
  importedCount: number;
  duplicateCount: number;
  failedCount: number;
  errorMessage: string | null;
};

export type ProviderStatisticsDto = {
  totalCatalogJobs: number;
  jobsByProvider: Array<{ provider: string; count: number }>;
  lastSyncAt: string | null;
  providerErrors24h: number;
  recentExecutions: ProviderExecutionDto[];
};

export type ProviderHistoryResponseDto = {
  data: ProviderExecutionDto[];
  meta: {
    nextCursor: string | null;
    hasMore: boolean;
  };
};

export type RunProviderResponseDto = {
  execution: ProviderExecutionDto;
};
