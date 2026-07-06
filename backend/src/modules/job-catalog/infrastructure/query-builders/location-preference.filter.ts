import type { Prisma } from "@prisma/client";

export type LocationPreferenceFilter = {
  scope: "country" | "state" | "city";
  state?: string;
  city?: string;
};

export const buildBrazilCountryLocationFilter = (): Prisma.JobWhereInput => ({
  OR: [
    { modality: "remote" },
    { location: { contains: "brasil", mode: "insensitive" } },
    { location: { contains: "remoto", mode: "insensitive" } },
    { location: { contains: "home office", mode: "insensitive" } },
    { location: null },
    { location: "" },
  ],
});

export const buildLocationPreferenceFilter = (
  preference: LocationPreferenceFilter,
): Prisma.JobWhereInput | undefined => {
  if (preference.scope === "country") {
    return buildBrazilCountryLocationFilter();
  }

  if (preference.scope === "state" && preference.state) {
    return {
      OR: [
        { modality: "remote" },
        { location: { contains: preference.state, mode: "insensitive" } },
        buildBrazilCountryLocationFilter(),
      ],
    };
  }

  if (preference.scope === "city" && preference.city) {
    return {
      OR: [
        { modality: "remote" },
        { location: { contains: preference.city, mode: "insensitive" } },
        preference.state
          ? { location: { contains: preference.state, mode: "insensitive" } }
          : undefined,
      ].filter(Boolean) as Prisma.JobWhereInput[],
    };
  }

  return undefined;
};
