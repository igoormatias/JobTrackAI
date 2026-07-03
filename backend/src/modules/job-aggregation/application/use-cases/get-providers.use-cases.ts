import type { JobProviderPort } from "../../domain/ports/job-provider.port.js";
import type { ProviderRegistryRepository } from "../../domain/repositories/provider-registry.repository.js";
import type { ProviderDto } from "../dto/provider-response.dto.js";

export class GetProvidersUseCase {
  constructor(private readonly registryRepo: ProviderRegistryRepository) {}

  async execute(): Promise<ProviderDto[]> {
    const providers = await this.registryRepo.findAll();
    return providers.map((provider) => ({
      name: provider.name,
      displayName: provider.displayName,
      enabled: provider.enabled,
      lastHealthAt: provider.lastHealthAt?.toISOString() ?? null,
      lastRunAt: provider.lastRunAt?.toISOString() ?? null,
    }));
  }
}

export class GetProvidersHealthUseCase {
  constructor(
    private readonly providers: Map<string, JobProviderPort>,
    private readonly registryRepo: ProviderRegistryRepository,
  ) {}

  async execute(): Promise<Array<{ provider: string; status: string; message?: string; checkedAt: string }>> {
    const registry = await this.registryRepo.findAll();
    const results = await Promise.all(
      registry.map(async (entry) => {
        const provider = this.providers.get(entry.name);
        if (!provider) {
          return {
            provider: entry.name,
            status: "unhealthy" as const,
            message: "Provider adapter not registered",
            checkedAt: new Date().toISOString(),
          };
        }

        const health = await provider.health();
        await this.registryRepo.updateLastHealth(entry.name, health.checkedAt);
        return {
          provider: health.provider,
          status: health.status,
          message: health.message,
          checkedAt: health.checkedAt.toISOString(),
        };
      }),
    );

    return results;
  }
}
