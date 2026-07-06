import { prisma } from "../../../database/prisma.js";
import { logger } from "../../../config/logger.js";
import { toMatchJobInput } from "../../jobs/infrastructure/mappers/job.mapper.js";
import {
  isAreaCompatible,
  matchEngineService,
  type MatchProfileInput,
} from "../../match/domain/services/match-engine.service.js";
import type { NotificationService } from "./notification.service.js";

const MATCH_THRESHOLD = 75;
const MAX_PER_USER_PER_SYNC = 5;

export type ImportedJobKey = {
  source: string;
  externalId: string;
};

export class NewJobNotificationService {
  constructor(private readonly notificationService: NotificationService) {}

  async notifyForImportedJobs(
    providerName: string,
    imported: ImportedJobKey[],
  ): Promise<number> {
    if (imported.length === 0) return 0;

    const jobs = await prisma.job.findMany({
      where: {
        OR: imported.map((item) => ({
          source: item.source,
          externalId: item.externalId,
        })),
        isCatalog: true,
        status: "active",
      },
    });

    if (jobs.length === 0) return 0;

    const profiles = await prisma.profile.findMany({
      where: { onboardingCompleted: true },
      select: {
        userId: true,
        area: true,
        seniority: true,
        modality: true,
        location: true,
        skillNames: true,
      },
    });

    if (profiles.length === 0) return 0;

    let created = 0;
    const perUserCount = new Map<string, number>();

    for (const profile of profiles) {
      const matchProfile: MatchProfileInput = {
        area: profile.area,
        seniority: profile.seniority,
        modality: profile.modality,
        location: profile.location,
        skillNames: profile.skillNames,
      };

      const matches: Array<{ job: (typeof jobs)[number]; score: number }> = [];

      for (const job of jobs) {
        const jobInput = toMatchJobInput(job);
        if (!isAreaCompatible(matchProfile, jobInput)) continue;

        const result = matchEngineService.compute(matchProfile, jobInput);
        if (result.score >= MATCH_THRESHOLD) {
          matches.push({ job, score: result.score });
        }
      }

      if (matches.length === 0) continue;

      matches.sort((a, b) => b.score - a.score);

      const alreadySent = perUserCount.get(profile.userId) ?? 0;
      const remaining = MAX_PER_USER_PER_SYNC - alreadySent;
      if (remaining <= 0) continue;

      for (const { job, score } of matches.slice(0, remaining)) {
        await this.notificationService.create({
          userId: profile.userId,
          type: "new_job",
          title: "Nova vaga compatível",
          message: `${job.title} · ${job.companyName} — match ${score}%`,
          actionUrl: `/jobs/${job.id}`,
          metadata: {
            jobId: job.id,
            matchScore: score,
            provider: providerName,
          },
        });

        created += 1;
        perUserCount.set(profile.userId, (perUserCount.get(profile.userId) ?? 0) + 1);
      }
    }

    if (created > 0) {
      logger.info(
        { provider: providerName, importedJobs: imported.length, notifications: created },
        "New job match notifications sent",
      );
    }

    return created;
  }
}
