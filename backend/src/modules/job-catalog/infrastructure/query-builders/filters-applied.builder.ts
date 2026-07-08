import type { CatalogListFilters } from "../../domain/value-objects/catalog-list-filters.js";
import { normalizeCatalogFilters } from "./catalog-where.builder.js";

export type FiltersAppliedMeta = Record<string, string | number | boolean | string[]>;

export const buildFiltersAppliedMeta = (filters: CatalogListFilters): FiltersAppliedMeta => {
  const normalized = normalizeCatalogFilters(filters);
  const applied: FiltersAppliedMeta = {};

  if (normalized.q?.trim()) applied.q = normalized.q.trim();
  if (normalized.areas?.length) applied.areas = normalized.areas;
  if (normalized.companyIds?.length) applied.companyIds = normalized.companyIds;
  if (normalized.seniorities?.length) applied.seniorities = normalized.seniorities;
  if (normalized.modalities?.length) applied.modalities = normalized.modalities;
  if (normalized.skills?.length) applied.skills = normalized.skills;
  if (normalized.sources?.length) applied.sources = normalized.sources;
  if (normalized.location) applied.location = normalized.location;
  if (normalized.locationScope) applied.locationScope = normalized.locationScope;
  if (normalized.locationState) applied.locationState = normalized.locationState;
  if (normalized.locationCity) applied.locationCity = normalized.locationCity;
  if (normalized.salaryMin !== undefined && normalized.salaryMin > 0) {
    applied.salaryMin = normalized.salaryMin;
  }
  if (normalized.salaryMax !== undefined && normalized.salaryMax > 0) {
    applied.salaryMax = normalized.salaryMax;
  }
  if (normalized.dateFrom) applied.dateFrom = normalized.dateFrom;
  if (normalized.dateTo) applied.dateTo = normalized.dateTo;
  if (normalized.isFavorite !== undefined) applied.isFavorite = normalized.isFavorite;
  if (normalized.visibility) applied.visibility = normalized.visibility;
  if (normalized.priority) applied.priority = normalized.priority;
  if (normalized.suggested) applied.suggested = true;
  if (normalized.sortBy) applied.sortBy = normalized.sortBy;
  if (normalized.sortDirection) applied.sortDirection = normalized.sortDirection;

  return applied;
};
