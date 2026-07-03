import type { CareerAnalysisService } from "../services/career-analysis.service.js";
import type { CareerAnalysisResponseDto } from "../dto/career-analysis-response.dto.js";

export class GetCareerAnalysisUseCase {
  constructor(private readonly service: CareerAnalysisService) {}

  async execute(userId: string, trackingId: string): Promise<CareerAnalysisResponseDto | null> {
    return this.service.getLatest(userId, trackingId);
  }
}

export class GenerateCareerAnalysisUseCase {
  constructor(private readonly service: CareerAnalysisService) {}

  async execute(
    userId: string,
    trackingId: string,
    refresh: boolean,
  ): Promise<CareerAnalysisResponseDto> {
    return this.service.generate(userId, trackingId, refresh);
  }
}
