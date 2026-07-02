import { Prisma } from "@prisma/client";

import { prisma } from "../../../../database/prisma.js";
import type {
  CreateProfileInput,
  Profile,
  UpdateProfileInput,
} from "../../domain/entities/profile.entity.js";
import type { ProfileRepository } from "../../domain/repositories/profile.repository.js";
import { ProfileMapper } from "../../application/mappers/profile.mapper.js";

const toJsonInput = (value: unknown): Prisma.InputJsonValue | typeof Prisma.JsonNull => {
  if (value === null || value === undefined) {
    return Prisma.JsonNull;
  }

  return value as Prisma.InputJsonValue;
};

export class PrismaProfileRepository implements ProfileRepository {
  async findByUserId(userId: string): Promise<Profile | null> {
    const record = await prisma.profile.findUnique({ where: { userId } });
    return record ? ProfileMapper.toEntity(record) : null;
  }

  async findWithUserByUserId(userId: string) {
    const record = await prisma.profile.findUnique({
      where: { userId },
      include: { user: true },
    });

    if (!record) return null;

    return ProfileMapper.toProfileWithUser(record, record.user);
  }

  async create(userId: string, input: CreateProfileInput): Promise<Profile> {
    const record = await prisma.profile.create({
      data: {
        userId,
        area: input.area ?? null,
        seniority: input.seniority ?? null,
        modality: input.modality ?? null,
        location: input.location ?? "",
        locationPreference: toJsonInput(input.locationPreference),
        salaryBand: input.salaryBand ?? null,
        salaryExpectation: toJsonInput(input.salaryExpectation),
        skillNames: input.skillNames ?? [],
        blockedSkills: input.blockedSkills ?? [],
        onboardingProgress: toJsonInput(input.onboardingProgress),
        onboardingCompleted: input.onboardingCompleted ?? false,
      },
    });

    return ProfileMapper.toEntity(record);
  }

  async update(userId: string, input: UpdateProfileInput): Promise<Profile | null> {
    try {
      const record = await prisma.profile.update({
        where: { userId },
        data: {
          ...(input.area !== undefined ? { area: input.area } : {}),
          ...(input.seniority !== undefined ? { seniority: input.seniority } : {}),
          ...(input.modality !== undefined ? { modality: input.modality } : {}),
          ...(input.location !== undefined ? { location: input.location } : {}),
          ...(input.locationPreference !== undefined
            ? { locationPreference: toJsonInput(input.locationPreference) }
            : {}),
          ...(input.salaryBand !== undefined ? { salaryBand: input.salaryBand } : {}),
          ...(input.salaryExpectation !== undefined
            ? { salaryExpectation: toJsonInput(input.salaryExpectation) }
            : {}),
          ...(input.skillNames !== undefined ? { skillNames: input.skillNames } : {}),
          ...(input.blockedSkills !== undefined ? { blockedSkills: input.blockedSkills } : {}),
          ...(input.onboardingProgress !== undefined
            ? { onboardingProgress: toJsonInput(input.onboardingProgress) }
            : {}),
          ...(input.onboardingCompleted !== undefined
            ? { onboardingCompleted: input.onboardingCompleted }
            : {}),
        },
      });

      return ProfileMapper.toEntity(record);
    } catch {
      return null;
    }
  }

  async markComplete(userId: string): Promise<Profile | null> {
    return this.update(userId, { onboardingCompleted: true });
  }
}

export const prismaProfileRepository = new PrismaProfileRepository();
