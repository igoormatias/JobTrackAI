import type { Request, Response } from "express";

import { getTitleSearchHintsForArea } from "../../../../match/domain/services/job-title-normalizer.service.js";
import type { ProfessionalArea } from "../../../domain/entities/profile.entity.js";
import { prismaProfileRepository } from "../../repositories/prisma-profile.repository.js";

const parseLocationPreference = (
  value: unknown,
): { scope: "country" | "state" | "city"; state?: string; city?: string } | null => {
  if (!value || typeof value !== "object") return null;
  const pref = value as { scope?: string; state?: string; city?: string };
  if (pref.scope !== "country" && pref.scope !== "state" && pref.scope !== "city") return null;
  return {
    scope: pref.scope,
    state: pref.state,
    city: pref.city,
  };
};

export const getJobSearchHints = async (req: Request, res: Response): Promise<void> => {
  const userId = req.auth!.userId;
  const profile = await prismaProfileRepository.findByUserId(userId);
  const area = profile?.area as ProfessionalArea | null | undefined;
  const locationPreference = parseLocationPreference(profile?.locationPreference);

  res.json({
    data: {
      area: area ?? null,
      titleHints: getTitleSearchHintsForArea(area),
      skillNames: profile?.skillNames ?? [],
      seniority: profile?.seniority ?? null,
      modality: profile?.modality ?? null,
      locationPreference,
      salaryExpectation: profile?.salaryExpectation ?? null,
    },
  });
};
