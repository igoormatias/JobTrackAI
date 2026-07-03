export type DedupAction = "import" | "skip" | "update";

export type DedupResult = {
  action: DedupAction;
  reason: string;
  existingJobId?: string;
};
