export const TIMELINE_EVENT_TYPES = [
  "created",
  "process_created",
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
  "offer",
  "rejected",
  "match_recalculated",
] as const;

export type TimelineEventType = (typeof TIMELINE_EVENT_TYPES)[number];
