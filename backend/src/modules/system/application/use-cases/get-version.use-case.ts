import type { UseCase } from "../../../../shared/application/use-case.js";
import type { SystemInfoRepository } from "../../domain/repositories/system-info.repository.js";
import type { VersionResponseDto } from "../dto/version-response.dto.js";
import { SystemInfoMapper } from "../mappers/system-info.mapper.js";

export class GetVersionUseCase implements UseCase<void, VersionResponseDto> {
  constructor(private readonly systemInfoRepository: SystemInfoRepository) {}

  async execute(): Promise<VersionResponseDto> {
    const systemInfo = await this.systemInfoRepository.getSystemInfo();
    return SystemInfoMapper.toVersionResponse(systemInfo);
  }
}
