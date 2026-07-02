export const TIMELINE_EVENT_TYPES = [
  "created",
  "stage_changed",
  "priority_changed",
  "favorited",
  "unfavorited",
  "hidden",
  "restored",
  "note_added",
  "note_updated",
  "applied",
  "interview_scheduled",
  "offer_received",
  "rejected",
] as const;

export type TimelineEventType = (typeof TIMELINE_EVENT_TYPES)[number];
