import type { Job } from "../types/job.types.js";
import type { JobInsight, JobMatchDto, JobTimelineStep, LearningGap } from "../types/job-details.types.js";

export type JobMatchResponseDto = {
  data: JobMatchDto;
};

export type JobRelatedResponseDto = {
  data: Job[];
};

export type JobTimelineResponseDto = {
  data: JobTimelineStep[];
};

export type JobInsightsResponseDto = {
  data: JobInsight[];
};

export type LearningGapsResponseDto = {
  data: LearningGap[];
};
