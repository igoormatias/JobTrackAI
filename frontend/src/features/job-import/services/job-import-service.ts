import { apiClient } from "@/lib/api-client";
import type { Job } from "@/types";

export type JobImportPreview = {
  title: string;
  company: string;
  description: string;
  source: string;
  sourceUrl: string;
  modality: string | null;
  location: string | null;
  externalId: string;
  provider: string;
  warnings?: string[];
};

export type ConfirmJobImportPayload = {
  url: string;
  addToPipeline?: boolean;
};

export type ConfirmJobImportResult = {
  job: Job;
  tracking?: {
    id: string;
    stage: string;
  };
  isExisting?: boolean;
};

export const previewJobImport = async (url: string): Promise<JobImportPreview> => {
  const response = await apiClient.post<{ data: JobImportPreview }>("/jobs/import/preview", { url });
  return response.data.data;
};

export const confirmJobImport = async (
  payload: ConfirmJobImportPayload,
): Promise<ConfirmJobImportResult> => {
  const response = await apiClient.post<{ data: ConfirmJobImportResult; message: string }>(
    "/jobs/import/confirm",
    payload,
  );
  return response.data.data;
};
