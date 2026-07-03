import type { MatchProfileInput } from "../../../match/domain/services/match-engine.service.js";
import { prismaProfileRepository } from "../../../profiles/infrastructure/repositories/prisma-profile.repository.js";

export const loadMatchProfileForUser = async (userId: string): Promise<MatchProfileInput | null> => {
  const profile = await prismaProfileRepository.findByUserId(userId);
  if (!profile) return null;
  return {
    area: profile.area,
    seniority: profile.seniority,
    modality: profile.modality,
    location: profile.location,
    locationPreference: profile.locationPreference as MatchProfileInput["locationPreference"],
    salaryExpectation: profile.salaryExpectation as MatchProfileInput["salaryExpectation"],
    skillNames: profile.skillNames,
  };
};
