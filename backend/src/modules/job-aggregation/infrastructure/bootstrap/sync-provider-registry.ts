import { env } from "../../../../config/env.js";
import { prisma } from "../../../../database/prisma.js";

export const syncProviderRegistryFromEnv = async (): Promise<void> => {
  await Promise.all([
    prisma.jobProviderRegistry.updateMany({
      where: { name: "gupy" },
      data: { enabled: env.ENABLE_PROVIDER_GUPY },
    }),
    prisma.jobProviderRegistry.updateMany({
      where: { name: "linkedin" },
      data: { enabled: env.ENABLE_PROVIDER_LINKEDIN },
    }),
    prisma.jobProviderRegistry.updateMany({
      where: { name: "programathor" },
      data: { enabled: env.ENABLE_PROVIDER_PROGRAMATHOR },
    }),
  ]);
};
