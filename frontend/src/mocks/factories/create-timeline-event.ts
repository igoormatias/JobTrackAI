import type { TimelineEvent, TimelineEventType } from "@/types";

import { createId } from "../utils/mock-utils";

export type CreateTimelineEventInput = {
  applicationId: string;
  index: number;
  type: TimelineEventType;
  title: string;
  description?: string | null;
  occurredAt: string;
  metadata?: Record<string, string | number | boolean | null>;
};

export const createTimelineEvent = ({
  applicationId,
  index,
  type,
  title,
  description = null,
  occurredAt,
  metadata = {},
}: CreateTimelineEventInput): TimelineEvent => ({
  id: createId("timeline", index),
  applicationId,
  type,
  title,
  description,
  metadata,
  occurredAt,
});
