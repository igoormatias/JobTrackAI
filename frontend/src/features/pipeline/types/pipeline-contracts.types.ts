import type { Application, PipelineStage, TimelineEvent } from "@/types";

/** @planned-etapa-12 — POST /pipeline */
export type CreatePipelineApplicationPayload = {
  jobId: string;
  stage?: PipelineStage;
  notes?: string;
  appliedAt?: string;
};

/** @planned-etapa-12 — PATCH /pipeline/:id/notes */
export type UpdateApplicationNotesPayload = {
  notes: string | null;
};

/** @planned-etapa-12 — PATCH /pipeline/:id/timeline/:eventId */
export type UpdateTimelineEventPayload = {
  occurredAt: string;
};

/** @planned-etapa-12 */
export type PipelineServicePlanned = {
  createApplication(payload: CreatePipelineApplicationPayload): Promise<Application>;
  updateApplicationNotes(id: string, payload: UpdateApplicationNotesPayload): Promise<Application>;
  updateTimelineEvent(
    applicationId: string,
    eventId: string,
    payload: UpdateTimelineEventPayload,
  ): Promise<TimelineEvent>;
};
