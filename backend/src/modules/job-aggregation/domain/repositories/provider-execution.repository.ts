import type {
  CreateProviderExecutionInput,
  FinishProviderExecutionInput,
  ProviderExecution,
} from "../entities/provider-execution.entity.js";

export type ProviderHistoryQuery = {
  providerName?: string;
  cursor?: string;
  limit?: number;
};

export type ProviderHistoryResult = {
  data: ProviderExecution[];
  nextCursor: string | null;
  hasMore: boolean;
};

export interface ProviderExecutionRepository {
  create(input: CreateProviderExecutionInput): Promise<ProviderExecution>;
  finish(id: string, input: FinishProviderExecutionInput): Promise<ProviderExecution>;
  findHistory(query: ProviderHistoryQuery): Promise<ProviderHistoryResult>;
  findLastFinishedAt(): Promise<Date | null>;
  countFailedSince(since: Date): Promise<number>;
}
