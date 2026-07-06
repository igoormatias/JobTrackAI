import type { Request, Response } from "express";

import { getTitleSearchHintsForArea } from "../../../match/domain/services/job-title-normalizer.service.js";
import type { ProfessionalArea } from "../../domain/entities/profile.entity.js";
import { prismaProfileRepository } from "../../infrastructure/repositories/prisma-profile.repository.js";

export const getJobSearchHints = async (req: Request, res: Response): Promise<void> => {
  const userId = req.auth!.userId;
  const profile = await prismaProfileRepository.findByUserId(userId);
  const area = profile?.area as ProfessionalArea | null | undefined;

  res.json({
    data: {
      area: area ?? null,
      titleHints: getTitleSearchHintsForArea(area),
      skillNames: profile?.skillNames ?? [],
      seniority: profile?.seniority ?? null,
      modality: profile?.modality ?? null,
      location: profile?.location ?? null,
      salaryExpectation: profile?.salaryExpectation ?? null,
    },
  });
};
