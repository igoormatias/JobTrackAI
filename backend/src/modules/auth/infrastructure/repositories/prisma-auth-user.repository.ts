import { prisma } from "../../../../database/prisma.js";
import type { Profile } from "@prisma/client";

import type { AuthProfile } from "../../types/auth.types.js";
import type {
  AuthUserRepository,
  StoredAuthUser,
  UpsertGoogleUserInput,
} from "../../domain/repositories/auth-user.repository.js";

const mapProfileToAuthProfile = (profile: Profile | null): AuthProfile | null => {
  if (!profile) return null;

  return {
    professionalArea: profile.area ?? undefined,
    seniority: profile.seniority ?? undefined,
    salaryBand: profile.salaryBand ?? undefined,
    salaryExpectation: profile.salaryExpectation as AuthProfile["salaryExpectation"],
    location: profile.location,
    locationPreference: profile.locationPreference as AuthProfile["locationPreference"],
    skills: profile.skillNames,
    blockedSkills: profile.blockedSkills,
    modality: profile.modality ?? undefined,
  };
};

const mapUserToAuthUser = (
  user: { id: string; name: string; email: string; avatarUrl: string | null; createdAt: Date },
  profile: Profile | null,
): StoredAuthUser => ({
  id: user.id,
  name: user.name,
  email: user.email,
  avatar: user.avatarUrl,
  provider: "google",
  createdAt: user.createdAt.toISOString(),
  onboardingCompleted: profile?.onboardingCompleted ?? false,
  profile: mapProfileToAuthProfile(profile),
});

export class PrismaAuthUserRepository implements AuthUserRepository {
  async findByEmail(email: string): Promise<StoredAuthUser | null> {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });

    if (!user) return null;

    return mapUserToAuthUser(user, user.profile);
  }

  async findById(id: string): Promise<StoredAuthUser | null> {
    const user = await prisma.user.findUnique({
      where: { id },
      include: { profile: true },
    });

    if (!user) return null;

    return mapUserToAuthUser(user, user.profile);
  }

  async upsertFromGoogle(input: UpsertGoogleUserInput): Promise<StoredAuthUser> {
    const user = await prisma.user.upsert({
      where: { email: input.email },
      create: {
        email: input.email,
        name: input.name,
        avatarUrl: input.avatar,
        settings: { create: {} },
      },
      update: {
        name: input.name,
        avatarUrl: input.avatar,
      },
      include: {
        profile: true,
        settings: true,
      },
    });

    if (!user.settings) {
      await prisma.userSettings.create({ data: { userId: user.id } });
    }

    return mapUserToAuthUser(user, user.profile);
  }

  async updateProfile(
    userId: string,
    profile: AuthProfile,
    onboardingCompleted = true,
  ): Promise<StoredAuthUser | null> {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) return null;

    await prisma.profile.upsert({
      where: { userId },
      create: {
        userId,
        area: profile.professionalArea ?? null,
        seniority: profile.seniority ?? null,
        modality: profile.modality ?? null,
        location: profile.location ?? "",
        locationPreference: profile.locationPreference ?? undefined,
        salaryBand: profile.salaryBand ?? null,
        salaryExpectation: profile.salaryExpectation ?? undefined,
        skillNames: profile.skills ?? [],
        blockedSkills: profile.blockedSkills ?? [],
        onboardingCompleted,
      },
      update: {
        area: profile.professionalArea ?? null,
        seniority: profile.seniority ?? null,
        modality: profile.modality ?? null,
        location: profile.location ?? "",
        locationPreference: profile.locationPreference ?? undefined,
        salaryBand: profile.salaryBand ?? null,
        salaryExpectation: profile.salaryExpectation ?? undefined,
        skillNames: profile.skills ?? [],
        blockedSkills: profile.blockedSkills ?? [],
        onboardingCompleted,
      },
    });

    return this.findById(userId);
  }
}

export const prismaAuthUserRepository = new PrismaAuthUserRepository();
