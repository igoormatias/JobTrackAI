import type { JobPriority } from "../../../shared/domain/job-priority.js";
import type { JobVisibility } from "../../../shared/domain/job-visibility.js";
import type { PipelineStage } from "../../../shared/domain/pipeline-stage.js";
import { NotFoundError } from "../../../shared/errors/not-found-error.js";
import type {
  CreateTrackingInput,
  JobTrackingEntity,
  MoveTrackingStageInput,
  TrackingTimelineEvent,
  UpdateProcessInput,
  UpdateTimelineEventInput,
} from "../domain/entities/job-tracking.entity.js";
import {
  inMemoryJobTrackingRepository,
} from "../infrastructure/repositories/in-memory-job-tracking.repository.js";
import {
  prismaJobTrackingRepository,
  type CreateInterviewInput,
  type PrismaJobTrackingRepository,
  type UpdateInterviewInput,
} from "../infrastructure/repositories/prisma-job-tracking.repository.js";

export type TrackingListParams = {
  q?: string;
  companyId?: string;
  stage?: PipelineStage;
  area?: string;
  source?: string;
  isFavorite?: boolean;
  priority?: JobPriority;
  visibility?: JobVisibility | "all";
  sortBy?: "recent" | "match" | "company" | "updated" | "priority" | "salary";
  sortDirection?: "asc" | "desc";
};

const isTestEnv = process.env.NODE_ENV === "test";

type TrackingRepository = Pick<
  PrismaJobTrackingRepository,
  | "findAllByUserId"
  | "findById"
  | "findByUserAndJobId"
  | "create"
  | "moveStage"
  | "toggleFavorite"
  | "changePriority"
  | "setVisibility"
  | "updateNotes"
  | "updateProcess"
  | "updateTimelineEvent"
  | "archive"
  | "delete"
  | "createInterview"
  | "listInterviews"
  | "updateInterview"
>;

export class TrackingService {
  private readonly repository: TrackingRepository;

  constructor(repository?: TrackingRepository) {
    this.repository = (repository ??
      (isTestEnv ? inMemoryJobTrackingRepository : prismaJobTrackingRepository)) as TrackingRepository;
  }

  list(userId: string, params: TrackingListParams = {}): JobTrackingEntity[] {
    let result = this.repository.findAllByUserId(userId) as JobTrackingEntity[] | Promise<JobTrackingEntity[]>;
    if (result instanceof Promise) {
      throw new Error("Use listAsync for Prisma repository");
    }

    return this.applyListFilters(result, params);
  }

  async listAsync(userId: string, params: TrackingListParams = {}): Promise<JobTrackingEntity[]> {
    const result = await this.repository.findAllByUserId(userId);
    return this.applyListFilters(result, params);
  }

  private applyListFilters(result: JobTrackingEntity[], params: TrackingListParams): JobTrackingEntity[] {
    const query = params.q?.toLowerCase();

    if (query) {
      result = result.filter(
        (item) =>
          item.job.title.toLowerCase().includes(query) ||
          item.job.company.name.toLowerCase().includes(query),
      );
    }

    if (params.companyId) result = result.filter((item) => item.companyId === params.companyId);
    if (params.stage) result = result.filter((item) => item.stage === params.stage);
    if (params.area) result = result.filter((item) => item.job.area === params.area);
    if (params.source) result = result.filter((item) => item.job.source === params.source);
    if (params.isFavorite !== undefined) {
      result = result.filter((item) => item.isFavorite === params.isFavorite);
    }
    if (params.priority) result = result.filter((item) => item.priority === params.priority);
    if (params.visibility && params.visibility !== "all") {
      result = result.filter((item) => item.visibility === params.visibility);
    }

    const direction = params.sortDirection === "asc" ? 1 : -1;
    const sortBy = params.sortBy ?? "updated";

    result.sort((a, b) => {
      switch (sortBy) {
        case "match":
          return (a.job.matchScore.score - b.job.matchScore.score) * direction;
        case "company":
          return a.job.company.name.localeCompare(b.job.company.name) * direction;
        case "priority": {
          const order = { HIGH: 3, MEDIUM: 2, LOW: 1 };
          return (order[a.priority] - order[b.priority]) * direction;
        }
        case "recent":
          return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * direction;
        case "updated":
        default:
          return (new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()) * direction;
      }
    });

    return result;
  }

  async getById(userId: string, id: string): Promise<JobTrackingEntity> {
    const tracking = await this.repository.findById(userId, id);
    if (!tracking) throw new NotFoundError("Tracking not found");
    return tracking;
  }

  async create(input: CreateTrackingInput): Promise<JobTrackingEntity> {
    return this.repository.create(input);
  }

  async moveStage(userId: string, id: string, input: MoveTrackingStageInput): Promise<JobTrackingEntity> {
    return this.repository.moveStage(userId, id, input);
  }

  async toggleFavorite(userId: string, id: string): Promise<JobTrackingEntity> {
    return this.repository.toggleFavorite(userId, id);
  }

  async changePriority(userId: string, id: string, priority: JobPriority): Promise<JobTrackingEntity> {
    return this.repository.changePriority(userId, id, priority);
  }

  async setVisibility(userId: string, id: string, visibility: JobVisibility): Promise<JobTrackingEntity> {
    return this.repository.setVisibility(userId, id, visibility);
  }

  async updateNotes(userId: string, id: string, notes: string | null): Promise<JobTrackingEntity> {
    return this.repository.updateNotes(userId, id, notes);
  }

  async updateProcess(userId: string, id: string, input: UpdateProcessInput): Promise<JobTrackingEntity> {
    return this.repository.updateProcess(userId, id, input);
  }

  async updateTimelineEvent(
    userId: string,
    trackingId: string,
    eventId: string,
    input: UpdateTimelineEventInput,
  ): Promise<TrackingTimelineEvent> {
    return this.repository.updateTimelineEvent(userId, trackingId, eventId, input);
  }

  async getTimeline(userId: string, id: string): Promise<TrackingTimelineEvent[]> {
    const tracking = await this.getById(userId, id);
    return tracking.timeline;
  }

  async archive(userId: string, id: string): Promise<JobTrackingEntity> {
    return this.repository.archive(userId, id);
  }

  async delete(userId: string, id: string): Promise<void> {
    await this.repository.delete(userId, id);
  }

  async findByJobId(userId: string, jobId: string): Promise<JobTrackingEntity | null> {
    return this.repository.findByUserAndJobId(userId, jobId);
  }

  async createInterview(trackingId: string, userId: string, input: CreateInterviewInput) {
    return this.repository.createInterview(trackingId, userId, input);
  }

  async listInterviews(trackingId: string, userId: string) {
    return this.repository.listInterviews(trackingId, userId);
  }

  async updateInterview(
    trackingId: string,
    interviewId: string,
    userId: string,
    input: UpdateInterviewInput,
  ) {
    return this.repository.updateInterview(trackingId, interviewId, userId, input);
  }
}

export const trackingService = new TrackingService();
