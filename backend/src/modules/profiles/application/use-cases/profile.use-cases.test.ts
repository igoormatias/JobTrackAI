import { describe, expect, it, beforeEach, vi } from "vitest";

import type { EventBus } from "../../../../shared/events/event-bus.interface.js";
import { CreateProfileUseCase } from "./create-profile.use-case.js";
import { GetProfileUseCase } from "./get-profile.use-case.js";
import { UpdateProfileUseCase } from "./update-profile.use-case.js";
import { InMemoryProfileRepository } from "../../infrastructure/repositories/in-memory-profile.repository.js";

const createEventBus = (): EventBus => ({
  publish: vi.fn().mockResolvedValue(undefined),
  subscribe: vi.fn(),
});

describe("Profile use cases", () => {
  const repository = new InMemoryProfileRepository();

  beforeEach(() => {
    repository.reset();
    repository.seedUser("user_0001", {
      name: "Test User",
      email: "test@email.com",
      avatarUrl: null,
    });
  });

  it("creates a profile draft", async () => {
    const useCase = new CreateProfileUseCase(repository, createEventBus());
    const response = await useCase.execute({
      userId: "user_0001",
      input: { area: "frontend", skillNames: ["React"] },
    });

    expect(response.data.userId).toBe("user_0001");
    expect(response.data.area).toBe("frontend");
    expect(response.data.onboardingCompleted).toBe(false);
  });

  it("throws conflict when profile already exists", async () => {
    const useCase = new CreateProfileUseCase(repository, createEventBus());
    await useCase.execute({ userId: "user_0001", input: { area: "frontend" } });

    await expect(
      useCase.execute({ userId: "user_0001", input: { area: "backend" } }),
    ).rejects.toThrow("Profile already exists");
  });

  it("updates profile", async () => {
    const createUseCase = new CreateProfileUseCase(repository, createEventBus());
    await createUseCase.execute({ userId: "user_0001", input: { area: "frontend" } });

    const updateUseCase = new UpdateProfileUseCase(repository, createEventBus());
    const response = await updateUseCase.execute({
      userId: "user_0001",
      input: { seniority: "senior" },
    });

    expect(response.data.seniority).toBe("senior");
  });

  it("throws not found for missing profile", async () => {
    const useCase = new GetProfileUseCase(repository);
    await expect(useCase.execute("missing")).rejects.toThrow("Profile not found");
  });
});
