import type { Profile as PrismaProfile, User } from "@prisma/client";
import { Prisma } from "@prisma/client";

import type {
  OnboardingProgress,
  Profile,
  ProfileLocation,
  ProfileWithUser,
  SalaryRange,
} from "../../domain/entities/profile.entity.js";

const parseJson = <T>(value: Prisma.JsonValue | null): T | null => {
  if (value === null || value === undefined) return null;
  return value as T;
};

export class ProfileMapper {
  static toEntity(record: PrismaProfile): Profile {
    return {
      id: record.id,
      userId: record.userId,
      headline: "",
      area: (record.area as Profile["area"]) ?? null,
      seniority: (record.seniority as Profile["seniority"]) ?? null,
      modality: (record.modality as Profile["modality"]) ?? null,
      location: record.location,
      locationPreference: parseJson<ProfileLocation>(record.locationPreference),
      salaryExpectation: parseJson<SalaryRange>(record.salaryExpectation),
      salaryBand: (record.salaryBand as Profile["salaryBand"]) ?? null,
      skillNames: record.skillNames,
      bio: "",
      linkedinUrl: null,
      githubUrl: null,
      onboardingProgress: parseJson<OnboardingProgress>(record.onboardingProgress),
      onboardingCompleted: record.onboardingCompleted,
      extensions: {},
      updatedAt: record.updatedAt.toISOString(),
    };
  }

  static toProfileWithUser(record: PrismaProfile, user: User): ProfileWithUser {
    return {
      ...ProfileMapper.toEntity(record),
      user: {
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
      },
    };
  }
}
