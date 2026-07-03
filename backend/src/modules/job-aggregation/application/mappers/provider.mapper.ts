import type { ProviderExecution } from "../../domain/entities/provider-execution.entity.js";
import type { ProviderExecutionDto } from "../dto/provider-response.dto.js";

export const toProviderExecutionDto = (execution: ProviderExecution): ProviderExecutionDto => ({
  id: execution.id,
  providerName: execution.providerName,
  status: execution.status,
  startedAt: execution.startedAt.toISOString(),
  finishedAt: execution.finishedAt?.toISOString() ?? null,
  durationMs: execution.durationMs ?? null,
  foundCount: execution.foundCount,
  importedCount: execution.importedCount,
  duplicateCount: execution.duplicateCount,
  failedCount: execution.failedCount,
  errorMessage: execution.errorMessage ?? null,
});
