export type ProviderExecutionStatus = "running" | "completed" | "failed";

export type ProviderExecution = {
  id: string;
  providerName: string;
  status: ProviderExecutionStatus;
  startedAt: Date;
  finishedAt?: Date | null;
  durationMs?: number | null;
  foundCount: number;
  importedCount: number;
  duplicateCount: number;
  failedCount: number;
  errorMessage?: string | null;
};

export type CreateProviderExecutionInput = {
  providerName: string;
};

export type FinishProviderExecutionInput = {
  status: ProviderExecutionStatus;
  foundCount: number;
  importedCount: number;
  duplicateCount: number;
  failedCount: number;
  errorMessage?: string | null;
};
