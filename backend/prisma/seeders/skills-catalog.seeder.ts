import type { PrismaClient } from "@prisma/client";

import { TECH_POOL } from "./catalog-data.js";

export const slugifySkill = (value: string): string =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const ALIAS_MAP: Record<string, string> = {
  "next-js": "nextjs",
  "node-js": "nodejs",
  react: "react",
  typescript: "typescript",
  "spring-boot": "springboot",
  "tailwind-css": "tailwindcss",
  "react-native": "reactnative",
};

export async function seedSkillsCatalog(prisma: PrismaClient): Promise<void> {
  const existing = await prisma.skill.count();
  if (existing > 0) return;

  for (const name of TECH_POOL) {
    const slug = slugifySkill(name);
    const skill = await prisma.skill.create({
      data: {
        slug,
        name,
        status: "OFFICIAL",
      },
    });

    const aliases = new Set<string>([slug, slug.replace(/-/g, ""), slug.replace(/\./g, "")]);
    const mapped = ALIAS_MAP[slug];
    if (mapped) aliases.add(mapped);

    for (const aliasSlug of aliases) {
      if (aliasSlug === slug) continue;
      await prisma.skillAlias.create({
        data: { aliasSlug, skillId: skill.id },
      });
    }
  }
}
