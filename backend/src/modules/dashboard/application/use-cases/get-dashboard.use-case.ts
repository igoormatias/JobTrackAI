import type { UseCase } from "../../../../shared/application/use-case.js";
import type { DashboardRepository } from "../../domain/repositories/dashboard.repository.js";
import type { DashboardResponseDto } from "../dto/dashboard-response.dto.js";

export class GetDashboardUseCase implements UseCase<string, DashboardResponseDto> {
  constructor(private readonly dashboardRepository: DashboardRepository) {}

  async execute(userId: string): Promise<DashboardResponseDto> {
    const data = await this.dashboardRepository.getDashboardData(userId);
    return { data };
  }
}
