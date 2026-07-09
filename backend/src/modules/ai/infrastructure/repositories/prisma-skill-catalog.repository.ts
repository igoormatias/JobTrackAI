import { prisma } from "../../../../database/prisma.js";
import type { SkillLevel, SkillRecord, SkillStatus, UserSkillRecord } from "../../domain/entities/career-analysis.entity.js";
import type { SkillCatalogRepository, UserSkillRepository } from "../../domain/repositories/skill-catalog.repository.js";

const mapSkill = (record: {
  id: string;
  slug: string;
  name: string;
  status: string;
  area: string | null;
}): SkillRecord => ({
  id: record.id,
  slug: record.slug,
  name: record.name,
  status: record.status as SkillRecord["status"],
  area: record.area,
});

export class PrismaSkillCatalogRepository implements SkillCatalogRepository {
  async findBySlug(slug: string): Promise<SkillRecord | null> {
    const record = await prisma.skill.findUnique({ where: { slug } });
    return record ? mapSkill(record) : null;
  }

  async findByAlias(aliasSlug: string): Promise<SkillRecord | null> {
    const alias = await prisma.skillAlias.findUnique({
      where: { aliasSlug },
      include: { skill: true },
    });
    return alias?.skill ? mapSkill(alias.skill) : null;
  }

  async createCustom(name: string, slug: string): Promise<SkillRecord> {
    const record = await prisma.skill.upsert({
      where: { slug },
      create: { slug, name, status: "CUSTOM" },
      update: { name },
    });
    return mapSkill(record);
  }

  async listAliases(): Promise<Array<{ aliasSlug: string; skillSlug: string }>> {
    const aliases = await prisma.skillAlias.findMany({ include: { skill: true } });
    return aliases.map((a) => ({ aliasSlug: a.aliasSlug, skillSlug: a.skill.slug }));
  }

  async search(query: string, limit = 20): Promise<SkillRecord[]> {
    const normalized = query.trim();
    if (!normalized) {
      const records = await prisma.skill.findMany({
        take: limit,
        orderBy: { name: "asc" },
      });
      return records.map(mapSkill);
    }

    const records = await prisma.skill.findMany({
      where: {
        OR: [
          { name: { contains: normalized, mode: "insensitive" } },
          { slug: { contains: normalized, mode: "insensitive" } },
        ],
      },
      take: limit,
      orderBy: { name: "asc" },
    });
    return records.map(mapSkill);
  }
}

export class PrismaUserSkillRepository implements UserSkillRepository {
  async listByUserId(userId: string): Promise<UserSkillRecord[]> {
    const records = await prisma.userSkill.findMany({
      where: { userId },
      include: { skill: true },
    });

    return records.map((record) => ({
      skillSlug: record.skill.slug,
      skillName: record.skill.name,
      level: record.level as SkillLevel,
      status: record.status as SkillStatus,
    }));
  }

  async upsertMany(
    userId: string,
    skills: Array<{ skillId: string; level: SkillLevel; status: SkillStatus }>,
  ): Promise<void> {
    await prisma.$transaction(
      skills.map((skill) =>
        prisma.userSkill.upsert({
          where: { userId_skillId: { userId, skillId: skill.skillId } },
          create: {
            userId,
            skillId: skill.skillId,
            level: skill.level,
            status: skill.status,
          },
          update: { level: skill.level, status: skill.status },
        }),
      ),
    );
  }

  async deleteNotInSkillIds(userId: string, skillIds: string[]): Promise<void> {
    await prisma.userSkill.deleteMany({
      where: {
        userId,
        ...(skillIds.length > 0 ? { skillId: { notIn: skillIds } } : {}),
      },
    });
  }
}

export const prismaSkillCatalogRepository = new PrismaSkillCatalogRepository();
export const prismaUserSkillRepository = new PrismaUserSkillRepository();
