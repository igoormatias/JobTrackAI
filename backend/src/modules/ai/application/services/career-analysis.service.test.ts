import { describe, expect, it, vi, beforeEach } from "vitest";

import { AppError } from "../../../../shared/errors/app-error.js";
import type { CareerAnalysisRecord, CareerAnalysisResult } from "../../domain/entities/career-analysis.entity.js";
import type { AIAnalysisRepository } from "../../domain/repositories/ai-analysis.repository.js";
import type {
  CareerAnalysisContext,
  CareerAnalysisContextRepository,
  UserSkillRepository,
} from "../../domain/repositories/skill-catalog.repository.js";
import type { AIProviderPort } from "../../domain/ports/ai-provider.port.js";
import { SkillNormalizer } from "../../domain/services/skill-normalizer.service.js";
import { CareerAnalysisService } from "../services/career-analysis.service.js";

const analysisResult: CareerAnalysisResult = {
  summary: "Ok",
  matchExplanation: "Match",
  strengths: [],
  weaknesses: [],
  missingSkills: [],
  learningRecommendations: [],
  interviewPreparation: [],
  careerInsights: [],
  nextSteps: [],
  confidence: 0.8,
};

const context: CareerAnalysisContext = {
  userId: "user-1",
  stage: "applied",
  notes: null,
  priority: "MEDIUM",
  job: {
    id: "job-1",
    title: "Dev",
    companyName: "Acme",
    description: "desc",
    area: "frontend",
    seniority: "senior",
    modality: "remote",
    metadata: { technologies: [{ name: "React", slug: "react" }], requirements: ["React"] },
  },
  profile: {
    area: "frontend",
    seniority: "senior",
    modality: "remote",
    location: "SP",
    salaryBand: null,
    skillNames: ["React"],
  },
  timeline: [],
};

const storedRecord = (overrides: Partial<CareerAnalysisRecord> = {}): CareerAnalysisRecord => ({
  id: "analysis-1",
  trackingId: "track-1",
  contentHash: "hash-1",
  result: analysisResult,
  provider: "gemini",
  model: "gemini-2.5-flash",
  promptVersion: "career-v1",
  matchEngineVersion: "rules-v2",
  confidence: 0.8,
  generatedAt: new Date("2026-01-01"),
  ...overrides,
});

describe("CareerAnalysisService", () => {
  let contextRepo: CareerAnalysisContextRepository;
  let analysisRepo: AIAnalysisRepository;
  let userSkillRepo: UserSkillRepository;
  let provider: AIProviderPort;
  let service: CareerAnalysisService;

  beforeEach(() => {
    contextRepo = {
      loadForUser: vi.fn().mockResolvedValue(context),
    };
    analysisRepo = {
      findByTrackingAndHash: vi.fn().mockResolvedValue(null),
      findLatestByTracking: vi.fn().mockResolvedValue(null),
      upsert: vi.fn().mockImplementation(async (input) =>
        storedRecord({ contentHash: input.contentHash, result: input.result }),
      ),
      logUsage: vi.fn().mockResolvedValue(undefined),
      countRealUsageSince: vi.fn().mockResolvedValue(0),
      findLastRealUsageAt: vi.fn().mockResolvedValue(null),
    };
    userSkillRepo = {
      listByUserId: vi.fn().mockResolvedValue([]),
      upsertMany: vi.fn(),
      deleteNotInSkillIds: vi.fn(),
    };
    provider = {
      providerName: "gemini",
      analyzeCareer: vi.fn().mockResolvedValue({ ...analysisResult, promptTokens: 10, completionTokens: 20 }),
    };

    const catalog = {
      findBySlug: vi.fn().mockResolvedValue({ id: "1", slug: "react", name: "React", status: "OFFICIAL" as const }),
      findByAlias: vi.fn().mockResolvedValue(null),
      createCustom: vi.fn(),
      listAliases: vi.fn().mockResolvedValue([]),
    };

    service = new CareerAnalysisService(
      contextRepo,
      analysisRepo,
      userSkillRepo,
      provider,
      new SkillNormalizer(catalog),
    );
  });

  it("returns cache hit without calling provider", async () => {
    vi.mocked(analysisRepo.findByTrackingAndHash).mockResolvedValue(storedRecord());

    const result = await service.generate("user-1", "track-1", false);

    expect(result.cached).toBe(true);
    expect(provider.analyzeCareer).not.toHaveBeenCalled();
  });

  it("returns stale latest when refresh=false and hash miss", async () => {
    vi.mocked(analysisRepo.findLatestByTracking).mockResolvedValue(storedRecord());

    const result = await service.generate("user-1", "track-1", false);

    expect(result.stale).toBe(true);
    expect(provider.analyzeCareer).not.toHaveBeenCalled();
  });

  it("calls provider on cache miss with refresh=true", async () => {
    const result = await service.generate("user-1", "track-1", true);

    expect(provider.analyzeCareer).toHaveBeenCalled();
    expect(result.cached).toBe(false);
    expect(analysisRepo.upsert).toHaveBeenCalled();
  });

  it("throws when tracking not found", async () => {
    vi.mocked(contextRepo.loadForUser).mockResolvedValue(null);
    await expect(service.generate("user-1", "missing", true)).rejects.toThrow("Tracking not found");
  });

  it("enforces daily rate limit", async () => {
    vi.mocked(analysisRepo.countRealUsageSince).mockResolvedValue(99);

    await expect(service.generate("user-1", "track-1", true)).rejects.toBeInstanceOf(AppError);
  });
});
