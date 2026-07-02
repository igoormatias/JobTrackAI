export type TimelineEventType =
  | "created"
  | "stage_changed"
  | "priority_changed"
  | "favorited"
  | "unfavorited"
  | "hidden"
  | "restored"
  | "note_added"
  | "note_updated"
  | "applied"
  | "interview_scheduled"
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
