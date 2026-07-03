import type { JobProviderRegistryEntry } from "../entities/job-provider-registry.entity.js";

export interface ProviderRegistryRepository {
  findAll(): Promise<JobProviderRegistryEntry[]>;
  findByName(name: string): Promise<JobProviderRegistryEntry | null>;
  updateLastRun(name: string, at: Date): Promise<void>;
  updateLastHealth(name: string, at: Date): Promise<void>;
  countJobsByProvider(): Promise<Array<{ provider: string; count: number }>>;
}
