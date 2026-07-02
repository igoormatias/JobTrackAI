import type { Prisma } from "@prisma/client";

import type { CatalogListFilters } from "../../domain/value-objects/catalog-list-filters.js";

const toArray = (value?: string | string[]): string[] | undefined => {
  if (!value) return undefined;
  return Array.isArray(value) ? value : value.split(",").filter(Boolean);
};

export const normalizeCatalogFilters = (filters: CatalogListFilters): CatalogListFilters => ({
  ...filters,
  q: filters.q ?? filters.search,
  areas: filters.areas ?? toArray(filters.areas as unknown as string),
  companyIds: filters.companyIds ?? toArray(filters.companyIds as unknown as string),
  seniorities: filters.seniorities ?? toArray(filters.seniorities as unknown as string),
  modalities: filters.modalities ?? toArray(filters.modalities as unknown as string),
  skills: filters.skills ?? toArray(filters.skills as unknown as string),
  sources: filters.sources ?? (toArray(filters.sources as unknown as string) as CatalogListFilters["sources"]),
});

export type CatalogWhereContext = {
  includeJobIds?: string[];
  excludeJobIds?: string[];
};

export const buildCatalogWhere = (
  filters: CatalogListFilters,
  context: CatalogWhereContext = {},
): Prisma.JobWhereInput => {
  const normalized = normalizeCatalogFilters(filters);
  const and: Prisma.JobWhereInput[] = [
    {
      OR: [{ isCatalog: true }, { userId: filters.userId }],
      status: "active",
    },
  ];

  if (context.includeJobIds) {
    and.push({ id: { in: context.includeJobIds } });
  }

  if (context.excludeJobIds?.length) {
    and.push({ id: { notIn: context.excludeJobIds } });
  }

  const query = normalized.q?.trim().toLowerCase();
  if (query) {
    and.push({
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { companyName: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
        { location: { contains: query, mode: "insensitive" } },
      ],
    });
  }

  if (normalized.areas?.length) {
    and.push({ area: { in: normalized.areas } });
  }

  if (normalized.companyIds?.length) {
    and.push({ companySlug: { in: normalized.companyIds } });
  }

  if (normalized.seniorities?.length) {
    and.push({ seniority: { in: normalized.seniorities } });
  }

  if (normalized.modalities?.length) {
    and.push({ modality: { in: normalized.modalities } });
  }

  if (normalized.sources?.length) {
    and.push({ source: { in: normalized.sources } });
  }

  if (normalized.location) {
    and.push({ location: { contains: normalized.location, mode: "insensitive" } });
  }

  if (normalized.salaryMin !== undefined) {
    and.push({ salaryMax: { gte: normalized.salaryMin } });
  }

  if (normalized.salaryMax !== undefined) {
    and.push({ salaryMin: { lte: normalized.salaryMax } });
  }

  if (normalized.dateFrom) {
    and.push({ publishedAt: { gte: new Date(normalized.dateFrom) } });
  }

  if (normalized.dateTo) {
    and.push({ publishedAt: { lte: new Date(normalized.dateTo) } });
  }

  if (normalized.skills?.length) {
    for (const skill of normalized.skills) {
      and.push({
        OR: [
          { title: { contains: skill, mode: "insensitive" } },
          { description: { contains: skill, mode: "insensitive" } },
        ],
      });
    }
  }

  return { AND: and };
};

export const buildCatalogOrderBy = (
  sortBy: CatalogListFilters["sortBy"] = "date",
  sortDirection: CatalogListFilters["sortDirection"] = "desc",
): Prisma.JobOrderByWithRelationInput[] => {
  const direction = sortDirection === "asc" ? "asc" : "desc";

  switch (sortBy) {
    case "salary":
      return [{ salaryMax: direction }, { id: direction }];
    case "title":
      return [{ title: direction }, { id: direction }];
    case "company":
      return [{ companyName: direction }, { id: direction }];
    case "date":
    default:
      return [{ publishedAt: direction }, { id: direction }];
  }
};

export const encodeCursor = (publishedAt: Date, id: string): string =>
  `${publishedAt.toISOString()}|${id}`;

export const decodeCursor = (cursor: string): { publishedAt: Date; id: string } | null => {
  const [publishedAt, id] = cursor.split("|");
  if (!publishedAt || !id) return null;
  const date = new Date(publishedAt);
  if (Number.isNaN(date.getTime())) return null;
  return { publishedAt: date, id };
};

export const buildCursorWhere = (
  cursor: string,
  sortDirection: CatalogListFilters["sortDirection"] = "desc",
): Prisma.JobWhereInput | undefined => {
  const decoded = decodeCursor(cursor);
  if (!decoded) return undefined;

  const operator = sortDirection === "asc" ? "gt" : "lt";

  return {
    OR: [
      { publishedAt: { [operator]: decoded.publishedAt } },
      {
        AND: [{ publishedAt: decoded.publishedAt }, { id: { [operator]: decoded.id } }],
      },
    ],
  };
};
