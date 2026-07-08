-- Add indexable search columns (never JSONB LOWER / string_contains)
ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "searchText" TEXT;
ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "technologyText" TEXT;
ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "technologySlugs" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "requirementsText" TEXT;
ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "benefitsText" TEXT;
ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "descriptionHtml" TEXT;

CREATE INDEX IF NOT EXISTS "Job_technologySlugs_idx" ON "Job" USING GIN ("technologySlugs");

-- Enable trigram for fuzzy / ILIKE acceleration
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS "Job_title_trgm_idx" ON "Job" USING GIN ("title" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "Job_companyName_trgm_idx" ON "Job" USING GIN ("companyName" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "Job_searchText_trgm_idx" ON "Job" USING GIN ("searchText" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "Job_technologyText_trgm_idx" ON "Job" USING GIN ("technologyText" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "Job_location_trgm_idx" ON "Job" USING GIN ("location" gin_trgm_ops);

-- Full-text search vector (generated) + GIN index
ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "searchVector" tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('simple', coalesce("title", '')), 'A') ||
    setweight(to_tsvector('simple', coalesce("companyName", '')), 'A') ||
    setweight(to_tsvector('simple', coalesce("technologyText", '')), 'B') ||
    setweight(to_tsvector('simple', coalesce("location", '')), 'C') ||
    setweight(to_tsvector('simple', coalesce("searchText", '')), 'D')
  ) STORED;

CREATE INDEX IF NOT EXISTS "Job_searchVector_idx" ON "Job" USING GIN ("searchVector");

-- Backfill derived fields from existing scalar + metadata JSON (best-effort)
UPDATE "Job"
SET
  "searchText" = COALESCE(
    NULLIF(trim(concat_ws(' ', "title", "companyName", "location", "description")), ''),
    "title"
  ),
  "technologyText" = (
    SELECT string_agg(elem->>'name', ' ')
    FROM jsonb_array_elements(COALESCE("metadata"->'technologies', '[]'::jsonb)) AS elem
    WHERE elem->>'name' IS NOT NULL
  ),
  "technologySlugs" = COALESCE(
    (
      SELECT array_agg(DISTINCT lower(replace(coalesce(elem->>'slug', elem->>'name'), ' ', '-')))
      FROM jsonb_array_elements(COALESCE("metadata"->'technologies', '[]'::jsonb)) AS elem
      WHERE coalesce(elem->>'slug', elem->>'name') IS NOT NULL
    ),
    ARRAY[]::TEXT[]
  ),
  "requirementsText" = (
    SELECT string_agg(elem #>> '{}', E'\n')
    FROM jsonb_array_elements(COALESCE("metadata"->'requirements', '[]'::jsonb)) AS elem
  ),
  "benefitsText" = (
    SELECT string_agg(elem #>> '{}', E'\n')
    FROM jsonb_array_elements(COALESCE("metadata"->'benefits', '[]'::jsonb)) AS elem
  )
WHERE "searchText" IS NULL;
