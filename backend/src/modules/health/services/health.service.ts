import type { HealthResponseDto } from "../dto/health-response.dto.js";

export class HealthService {
  getHealth(version: string): HealthResponseDto {
    return {
      status: "ok",
      uptime: process.uptime(),
      version,
    };
  }
}
