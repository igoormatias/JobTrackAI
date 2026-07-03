export type ProviderHealthState = "healthy" | "degraded" | "unhealthy";

export type ProviderHealthStatus = {
  provider: string;
  status: ProviderHealthState;
  message?: string;
  checkedAt: Date;
};
