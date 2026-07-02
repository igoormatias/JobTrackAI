import { describe, expect, it, vi } from "vitest";

import type { EventBus } from "../../../../shared/events/event-bus.interface.js";
import { SystemInfo } from "../../domain/entities/system-info.entity.js";
import { SystemHealthCheckedEvent } from "../../domain/events/system-health-checked.event.js";
import type { SystemInfoRepository } from "../../domain/repositories/system-info.repository.js";
import { AppVersion } from "../../domain/value-objects/app-version.vo.js";
import { ServiceStatus } from "../../domain/value-objects/service-status.vo.js";
import { GetHealthUseCase } from "./get-health.use-case.js";
import { GetInfoUseCase } from "./get-info.use-case.js";
import { GetVersionUseCase } from "./get-version.use-case.js";

const createSystemInfo = (): SystemInfo =>
  new SystemInfo({
    name: "JobTrack AI API",
    description: "Test API",
    version: AppVersion.create("1.0.0"),
    environment: "test",
    architecture: "Clean Architecture + DDD (lightweight)",
    modules: ["system", "auth"],
    status: ServiceStatus.ok(),
    uptime: 42,
  });

const createRepositoryMock = (
  systemInfo: SystemInfo = createSystemInfo(),
): SystemInfoRepository => ({
  getSystemInfo: vi.fn().mockResolvedValue(systemInfo),
});

describe("GetHealthUseCase", () => {
  it("should return health response and publish event", async () => {
    const repository = createRepositoryMock();
    const eventBus: EventBus = {
      publish: vi.fn().mockResolvedValue(undefined),
      subscribe: vi.fn(),
    };

    const useCase = new GetHealthUseCase(repository, eventBus);
    const result = await useCase.execute();

    expect(result).toEqual({
      status: "ok",
      uptime: 42,
      version: "1.0.0",
    });
    expect(eventBus.publish).toHaveBeenCalledWith(expect.any(SystemHealthCheckedEvent));
  });
});

describe("GetVersionUseCase", () => {
  it("should return version response", async () => {
    const repository = createRepositoryMock();
    const useCase = new GetVersionUseCase(repository);

    const result = await useCase.execute();

    expect(result).toEqual({
      version: "1.0.0",
      name: "JobTrack AI API",
      environment: "test",
    });
  });
});

describe("GetInfoUseCase", () => {
  it("should return info response", async () => {
    const repository = createRepositoryMock();
    const useCase = new GetInfoUseCase(repository);

    const result = await useCase.execute();

    expect(result).toEqual({
      name: "JobTrack AI API",
      description: "Test API",
      architecture: "Clean Architecture + DDD (lightweight)",
      modules: ["system", "auth"],
    });
  });
});
