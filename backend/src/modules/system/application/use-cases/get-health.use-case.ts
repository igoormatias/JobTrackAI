import type { UseCase } from "../../../../shared/application/use-case.js";
import type { EventBus } from "../../../../shared/events/event-bus.interface.js";
import { SystemHealthCheckedEvent } from "../../domain/events/system-health-checked.event.js";
import type { SystemInfoRepository } from "../../domain/repositories/system-info.repository.js";
import type { HealthResponseDto } from "../dto/health-response.dto.js";
import { SystemInfoMapper } from "../mappers/system-info.mapper.js";

export class GetHealthUseCase implements UseCase<void, HealthResponseDto> {
  constructor(
    private readonly systemInfoRepository: SystemInfoRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(): Promise<HealthResponseDto> {
    const systemInfo = await this.systemInfoRepository.getSystemInfo();
    const response = SystemInfoMapper.toHealthResponse(systemInfo);

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
