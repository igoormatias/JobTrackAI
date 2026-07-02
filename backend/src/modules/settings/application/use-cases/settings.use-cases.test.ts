import { describe, expect, it, beforeEach, vi } from "vitest";

import type { EventBus } from "../../../../shared/events/event-bus.interface.js";
import type { UserSettingsEntity } from "../../domain/entities/user-settings.entity.js";
import type { UserSettingsRepository } from "../../domain/repositories/user-settings.repository.js";
import { GetSettingsUseCase } from "./get-settings.use-case.js";
import { UpdateSettingsUseCase } from "./update-settings.use-case.js";

class InMemorySettingsRepository implements UserSettingsRepository {
  private settings = new Map<string, UserSettingsEntity>();

  async findByUserId(userId: string) {
    return this.settings.get(userId) ?? null;
  }

  async createDefault(userId: string) {
    const settings: UserSettingsEntity = {
      id: `settings_${userId}`,
      userId,
      theme: "dark",
      jobRefreshFrequency: "1h",
      dashboardNotificationInterval: "1h",
      updatedAt: new Date().toISOString(),
    };
    this.settings.set(userId, settings);
    return settings;
  }

  async update(userId: string, input: Partial<UserSettingsEntity>) {
    const existing = this.settings.get(userId);
    if (!existing) return null;

    const updated = {
      ...existing,
      ...input,
      updatedAt: new Date().toISOString(),
    };
    this.settings.set(userId, updated);
    return updated;
  }

  reset(): void {
    this.settings.clear();
  }
}

const createEventBus = (): EventBus => ({
  publish: vi.fn().mockResolvedValue(undefined),
  subscribe: vi.fn(),
});

describe("Settings use cases", () => {
  const repository = new InMemorySettingsRepository();

  beforeEach(() => {
    repository.reset();
  });

  it("creates default settings when missing", async () => {
    const useCase = new GetSettingsUseCase(repository);
    const response = await useCase.execute("user_0001");

    expect(response.data.theme).toBe("dark");
    expect(response.data.jobRefreshFrequency).toBe("1h");
  });

  it("updates settings and publishes event", async () => {
    const getUseCase = new GetSettingsUseCase(repository);
    await getUseCase.execute("user_0001");

    const eventBus = createEventBus();
    const updateUseCase = new UpdateSettingsUseCase(repository, eventBus);
    const response = await updateUseCase.execute({
      userId: "user_0001",
      data: { theme: "light" },
    });

    expect(response.data.theme).toBe("light");
    expect(eventBus.publish).toHaveBeenCalled();
  });
});
