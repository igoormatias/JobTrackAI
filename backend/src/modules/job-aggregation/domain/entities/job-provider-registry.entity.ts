export type JobProviderRegistryEntry = {
  id: string;
  name: string;
  displayName: string;
  enabled: boolean;
  lastHealthAt?: Date | null;
  lastRunAt?: Date | null;
  config?: Record<string, unknown> | null;
};
