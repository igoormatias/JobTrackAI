export type TimelineEventType =
  | "created"
  | "applied"
  | "stage_changed"
  | "interview_scheduled"
  | "note_added"
  | "offer_received"
  | "rejected";

export type TimelineEvent = {
  id: string;
  applicationId: string;
  type: TimelineEventType;
  title: string;
  description: string | null;
  metadata: Record<string, string | number | boolean | null>;
  occurredAt: string;
};
