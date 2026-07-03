import type { UseCase } from "../../../../shared/application/use-case.js";
import { env } from "../../../../config/env.js";
import type { EventBus } from "../../../../shared/events/event-bus.interface.js";
import { SystemHealthCheckedEvent } from "../../domain/events/system-health-checked.event.js";
import type { SystemInfoRepository } from "../../domain/repositories/system-info.repository.js";
import type { HealthResponseDto } from "../dto/health-response.dto.js";
import { checkDatabaseHealth } from "../../infrastructure/health/database-health.check.js";

export class GetHealthUseCase implements UseCase<void, HealthResponseDto> {
  constructor(
    private readonly systemInfoRepository: SystemInfoRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(): Promise<HealthResponseDto> {
    const systemInfo = await this.systemInfoRepository.getSystemInfo();
    const database = await checkDatabaseHealth();

    const environment = {
      status: env.NODE_ENV === "production" && !env.DATABASE_URL ? ("error" as const) : ("ok" as const),
      message:
        env.NODE_ENV === "production" && !env.DATABASE_URL
          ? "DATABASE_URL is not configured"
          : undefined,
    };

    const ai = env.GEMINI_API_KEY
      ? { status: "ok" as const }
      : { status: "skipped" as const, message: "GEMINI_API_KEY not configured" };

    const checks = { database, environment, ai };

    const hasError = Object.values(checks).some((check) => check.status === "error");
    const status = hasError ? "error" : "ok";

    const response: HealthResponseDto = {
      status,
      uptime: systemInfo.uptime,
      version: systemInfo.version.toString(),
      checks,
    };

    await this.eventBus.publish(
      new SystemHealthCheckedEvent({
        status: response.status,
        version: response.version,
        uptime: response.uptime,
      }),
    );

    return response;
  }
}
