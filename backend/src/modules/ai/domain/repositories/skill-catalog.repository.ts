import type { SkillRecord, SkillStatus, UserSkillRecord, SkillLevel } from "../entities/career-analysis.entity.js";

export interface SkillCatalogRepository {
  findBySlug(slug: string): Promise<SkillRecord | null>;
  findByAlias(aliasSlug: string): Promise<SkillRecord | null>;
  createCustom(name: string, slug: string): Promise<SkillRecord>;
  listAliases(): Promise<Array<{ aliasSlug: string; skillSlug: string }>>;
  search(query: string, limit?: number): Promise<SkillRecord[]>;
}

export interface UserSkillRepository {
  listByUserId(userId: string): Promise<UserSkillRecord[]>;
  upsertMany(
    userId: string,
    skills: Array<{ skillId: string; level: SkillLevel; status: SkillStatus }>,
  ): Promise<void>;
  deleteNotInSkillIds(userId: string, skillIds: string[]): Promise<void>;
}

export type CareerAnalysisContext = {
  trackingId: string;
  userId: string;
  jobId: string;
  stage: string;
  notes: string | null;
  priority: string;
  job: {
    id: string;
    title: string;
    companyName: string;
    description: string | null;
    area: string | null;
    seniority: string | null;
    modality: string | null;
    metadata: unknown;
  };
  profile: {
    area: string | null;
    seniority: string | null;
    modality: string | null;
    location: string;
    salaryBand: string | null;
    skillNames: string[];
  };
  timeline: Array<{ type: string; title: string; occurredAt: Date }>;
};

export interface CareerAnalysisContextRepository {
  loadForUser(userId: string, trackingId: string): Promise<CareerAnalysisContext | null>;
}
