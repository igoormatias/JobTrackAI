import { env } from "../../../../config/env.js";
import { SystemInfo } from "../../domain/entities/system-info.entity.js";
import type { SystemInfoRepository } from "../../domain/repositories/system-info.repository.js";
import { AppVersion } from "../../domain/value-objects/app-version.vo.js";
import { ServiceStatus } from "../../domain/value-objects/service-status.vo.js";

const LEGACY_MODULES = ["auth", "jobs", "pipeline", "profiles", "recommendations"];
const NEW_ARCHITECTURE_MODULES = ["system"];

export class StaticSystemInfoRepository implements SystemInfoRepository {
  async getSystemInfo(): Promise<SystemInfo> {
    return new SystemInfo({
      name: "JobTrack AI API",
      description: "Backend da plataforma JobTrack AI — gestão de carreira e vagas.",
      version: AppVersion.create(process.env.npm_package_version ?? "0.1.0"),
      environment: env.NODE_ENV,
      architecture: "Clean Architecture + DDD (lightweight)",
      modules: [...NEW_ARCHITECTURE_MODULES, ...LEGACY_MODULES],
      status: ServiceStatus.ok(),
      uptime: process.uptime(),
    });
  }
}

export const staticSystemInfoRepository = new StaticSystemInfoRepository();
