import type { DashboardDataDto } from "../../application/dto/dashboard-response.dto.js";

export interface DashboardRepository {
  getDashboardData(userId: string): Promise<DashboardDataDto>;
}
