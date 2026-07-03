import { prisma } from "../../../../database/prisma.js";
import type { CareerAnalysisContext, CareerAnalysisContextRepository } from "../../domain/repositories/skill-catalog.repository.js";

export class PrismaCareerAnalysisContextRepository implements CareerAnalysisContextRepository {
  async loadForUser(userId: string, trackingId: string): Promise<CareerAnalysisContext | null> {
    const tracking = await prisma.jobTracking.findFirst({
      where: { id: trackingId, userId },
      include: {
        job: true,
        timelineEvents: { orderBy: { occurredAt: "desc" }, take: 5 },
        user: { include: { profile: true } },
      },
    });

    if (!tracking?.user.profile) return null;

    return {
      trackingId: tracking.id,
      userId: tracking.userId,
      jobId: tracking.jobId,
      stage: tracking.stage,
      notes: tracking.notes,
      priority: tracking.priority,
      job: {
        id: tracking.job.id,
        title: tracking.job.title,
        companyName: tracking.job.companyName,
        description: tracking.job.description,
        area: tracking.job.area,
        seniority: tracking.job.seniority,
        modality: tracking.job.modality,
        metadata: tracking.job.metadata,
      },
      profile: {
        area: tracking.user.profile.area,
        seniority: tracking.user.profile.seniority,
        modality: tracking.user.profile.modality,
        location: tracking.user.profile.location,
        salaryBand: tracking.user.profile.salaryBand,
        skillNames: tracking.user.profile.skillNames,
      },
      timeline: tracking.timelineEvents.map((event) => ({
        type: event.type,
        title: event.title,
        occurredAt: event.occurredAt,
      })),
    };
  }
}

export const prismaCareerAnalysisContextRepository = new PrismaCareerAnalysisContextRepository();
