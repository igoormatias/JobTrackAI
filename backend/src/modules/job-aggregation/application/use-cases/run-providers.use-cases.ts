import type { JobAggregationService } from "../services/job-aggregation.service.js";
import type { RunProviderResponseDto } from "../dto/provider-response.dto.js";
import { toProviderExecutionDto } from "../mappers/provider.mapper.js";

export class RunProviderUseCase {
  constructor(private readonly aggregationService: JobAggregationService) {}

  async execute(providerName: string): Promise<RunProviderResponseDto> {
    const execution = await this.aggregationService.runProvider(providerName);
    return { execution: toProviderExecutionDto(execution) };
  }
}

export class RunAllProvidersUseCase {
  constructor(private readonly aggregationService: JobAggregationService) {}

  async execute(): Promise<RunProviderResponseDto[]> {
    const executions = await this.aggregationService.runAllEnabled();
    return executions.map((execution) => ({ execution: toProviderExecutionDto(execution) }));
  }
}
