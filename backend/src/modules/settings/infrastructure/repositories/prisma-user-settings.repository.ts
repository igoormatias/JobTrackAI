import type { UpdateUserSettingsInput } from "../../domain/entities/user-settings.entity.js";
import { prisma } from "../../../../database/prisma.js";
import type { UserSettingsRepository } from "../../domain/repositories/user-settings.repository.js";
import { UserSettingsMapper } from "../../application/mappers/user-settings.mapper.js";

export class PrismaUserSettingsRepository implements UserSettingsRepository {
  async findByUserId(userId: string) {
    const record = await prisma.userSettings.findUnique({ where: { userId } });
    return record ? UserSettingsMapper.toEntity(record) : null;
  }

  async createDefault(userId: string) {
    const record = await prisma.userSettings.create({
      data: { userId },
    });
    return UserSettingsMapper.toEntity(record);
  }

  async update(userId: string, input: UpdateUserSettingsInput) {
    try {
      const record = await prisma.userSettings.update({
        where: { userId },
        data: input,
      });
      return UserSettingsMapper.toEntity(record);
    } catch {
      return null;
    }
  }
}

export const prismaUserSettingsRepository = new PrismaUserSettingsRepository();
