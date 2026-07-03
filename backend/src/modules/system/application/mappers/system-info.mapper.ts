import type { SystemInfo } from "../../domain/entities/system-info.entity.js";
import type { HealthResponseDto } from "../dto/health-response.dto.js";
import type { InfoResponseDto } from "../dto/info-response.dto.js";
import type { VersionResponseDto } from "../dto/version-response.dto.js";

export const SystemInfoMapper = {
  toHealthResponse(systemInfo: SystemInfo): HealthResponseDto {
    return {
      status: systemInfo.status.toString() as HealthResponseDto["status"],
      uptime: systemInfo.uptime,
      version: systemInfo.version.toString(),
      checks: {
        database: { status: "skipped", message: "Use GetHealthUseCase for live checks" },
        environment: { status: "ok" },
        ai: { status: "skipped" },
      },
    };
  },

  toVersionResponse(systemInfo: SystemInfo): VersionResponseDto {
    return {
      version: systemInfo.version.toString(),
      name: systemInfo.name,
      environment: systemInfo.environment,
    };
  },

  toInfoResponse(systemInfo: SystemInfo): InfoResponseDto {
    return {
      name: systemInfo.name,
      description: systemInfo.description,
      architecture: systemInfo.architecture,
      modules: systemInfo.modules,
    };
  },
};
