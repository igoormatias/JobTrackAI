import type { UseCase } from "../../../../shared/application/use-case.js";
import type { SystemInfoRepository } from "../../domain/repositories/system-info.repository.js";
import type { InfoResponseDto } from "../dto/info-response.dto.js";
import { SystemInfoMapper } from "../mappers/system-info.mapper.js";

export class GetInfoUseCase implements UseCase<void, InfoResponseDto> {
  constructor(private readonly systemInfoRepository: SystemInfoRepository) {}

  async execute(): Promise<InfoResponseDto> {
    const systemInfo = await this.systemInfoRepository.getSystemInfo();
    return SystemInfoMapper.toInfoResponse(systemInfo);
  }
}
