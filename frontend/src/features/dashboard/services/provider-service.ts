import { apiClient } from "@/lib/api-client/api-client";

export type ProviderExecutionResult = {
  execution: {
    id: string;
    providerName: string;
    status: string;
    startedAt: string;
    finishedAt: string | null;
    importedCount: number;
    duplicateCount: number;
    failedCount: number;
    errorMessage: string | null;
  };
};

export const runProviderSync = async (): Promise<ProviderExecutionResult[]> => {
  const { data } = await apiClient.post<{ data: ProviderExecutionResult[] }>("/providers/run");
  return data.data;
};
