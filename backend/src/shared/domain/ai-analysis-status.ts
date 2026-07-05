export const AI_ANALYSIS_STATUSES = [
  "PENDING",
  "PROCESSING",
  "COMPLETED",
  "FAILED",
  "CACHED",
] as const;

export type AiAnalysisStatus = (typeof AI_ANALYSIS_STATUSES)[number];

export const isAiAnalysisInProgress = (status: string | null | undefined): boolean =>
  status === "PENDING" || status === "PROCESSING";
