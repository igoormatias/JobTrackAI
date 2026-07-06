export type DedupAction = "import" | "skip" | "update" | "attach_alternate";

export type DedupResult = {
  action: DedupAction;
  reason: string;
  existingJobId?: string;
};
