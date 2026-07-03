export type HealthCheckItemDto = {
  status: "ok" | "error" | "skipped";
  latencyMs?: number;
  message?: string;
};

export type HealthResponseDto = {
  status: "ok" | "degraded" | "error";
  uptime: number;
  version: string;
  checks: {
    database: HealthCheckItemDto;
    environment: HealthCheckItemDto;
    ai: HealthCheckItemDto;
  };
};
