/**
 * Hybrid search helpers: Full-Text (tsvector) + trigram similarity.
 * Ranking priority: title > company > technologies > location > description/searchText.
 */

export const sanitizeSearchQuery = (raw: string): string =>
  raw
    .trim()
    .replace(/[^\p{L}\p{N}\s.+#-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

export const toTsQueryTerms = (query: string): string => {
  const tokens = sanitizeSearchQuery(query)
    .split(/\s+/)
    .filter((token) => token.length >= 2)
    .slice(0, 8);
  if (tokens.length === 0) return "";
  // prefix matching: react:*
  return tokens.map((token) => `${token.replace(/'/g, "''")}:*`).join(" & ");
};

export type SearchRankWeights = {
  title: number;
  company: number;
  technology: number;
  location: number;
  description: number;
};

export const SEARCH_RANK_WEIGHTS: SearchRankWeights = {
  title: 1.0,
  company: 0.7,
  technology: 0.55,
  location: 0.35,
  description: 0.15,
};

/**
 * Builds a SQL fragment for hybrid ranking score (0..~3).
 * Uses plainto_tsquery for FTS and pg_trgm similarity for fuzzy matches.
 */
export const buildHybridRankSql = (queryParam: string): string => `
  (
    ${SEARCH_RANK_WEIGHTS.title} * COALESCE(similarity("title", ${queryParam}), 0) +
    ${SEARCH_RANK_WEIGHTS.company} * COALESCE(similarity("companyName", ${queryParam}), 0) +
    ${SEARCH_RANK_WEIGHTS.technology} * COALESCE(similarity(COALESCE("technologyText", ''), ${queryParam}), 0) +
    ${SEARCH_RANK_WEIGHTS.location} * COALESCE(similarity(COALESCE("location", ''), ${queryParam}), 0) +
    ${SEARCH_RANK_WEIGHTS.description} * COALESCE(similarity(COALESCE("searchText", ''), ${queryParam}), 0) +
    CASE
      WHEN "searchVector" @@ plainto_tsquery('simple', ${queryParam})
      THEN ts_rank_cd("searchVector", plainto_tsquery('simple', ${queryParam}))
      ELSE 0
    END
  )
`;

export const buildHybridWhereSql = (queryParam: string): string => `
  (
    "title" ILIKE '%' || ${queryParam} || '%'
    OR "companyName" ILIKE '%' || ${queryParam} || '%'
    OR COALESCE("companySlug", '') ILIKE '%' || ${queryParam} || '%'
    OR COALESCE("location", '') ILIKE '%' || ${queryParam} || '%'
    OR COALESCE("technologyText", '') ILIKE '%' || ${queryParam} || '%'
    OR COALESCE("searchText", '') ILIKE '%' || ${queryParam} || '%'
    OR COALESCE("description", '') ILIKE '%' || ${queryParam} || '%'
    OR "searchVector" @@ plainto_tsquery('simple', ${queryParam})
    OR similarity("title", ${queryParam}) > 0.2
    OR similarity("companyName", ${queryParam}) > 0.25
    OR similarity(COALESCE("technologyText", ''), ${queryParam}) > 0.2
  )
`;
