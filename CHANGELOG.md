# Changelog

All notable changes to JobTrack AI are documented in this file.

## [Unreleased]

### Added (Etapa 19 — UX Stabilization & Smart Job Matching)

- Match Engine `rules-v2` — área/cargo dominam; cap incompatível ≤ 30
- `JobTitleNormalizer` + `SkillMatcher` (aliases síncronos)
- Pré-filtro por área no catálogo (sort=match) e dashboard
- UX responsiva: AppShell, dashboard grid, JobCard, busca estável
- `docs/MATCH_ENGINE.md`, `docs/UX_AUDIT_ETAPA19.md`, ADR-029

### Added (Etapa 18 — AI Career Intelligence)

- Módulo `ai` + Gemini (`GEMINI_API_KEY`, `GEMINI_MODEL`, `PROMPT_VERSION`)
- Skills Catalog: `Skill`, `SkillAlias`, `UserSkill` + `SkillNormalizer`
- Cache `AIAnalysis` + observabilidade `AIAnalysisUsageLog`
- `POST/GET /ai/career-analysis/:trackingId`
- Frontend: `CareerAnalysisCard` on-demand em Job Details e Pipeline

### Added (Etapa 17 — Job Aggregation Engine)

- Módulo `job-aggregation` com normalização, dedup, validação e persistência
- Gupy provider real; LinkedIn/Programathor stubs com `health()`
- Endpoints `/providers/*` (list, statistics, history, health, run)
- Scheduler interno (`ENABLE_SCHEDULER`, `SYNC_INTERVAL`)
- Dashboard: widget sincronização de vagas (`jobSync`)
- `SEED_CATALOG` condicional (default `false`)
- Prisma: `JobProviderRegistry`, `ProviderExecution`, `JobImport`, `Job.contentHash`

### Removed

- Etapa onboarding `blockedSkills` ("Competências que não deseja") e penalidade no Match Engine

## [v1.0.0-rc1] — 2026-07 (Etapa 15 — Release Candidate)

### Security

- Enforce `userId` ownership on all `/tracking/*` and legacy `/pipeline/*` mutations
- Production requires `JWT_SECRET` and `DATABASE_URL`
- Rate limit on `POST /auth/login`

### Quality

- GitHub Actions CI (lint, typecheck, build, unit + integration tests)
- `getRouteParam` helper for Express 5 route params
- Exclude `*.test.ts` from backend `tsc` build

### Frontend

- Pipeline error state with retry; Hidden jobs skeleton/empty/error
- Notifications header popover with mark-all-read
- Nav a11y (`aria-current`, collapsed sidebar labels)
- Removed placeholder pages and dead hooks

### DevOps

- Docker: `MSW=false`, `GOOGLE_CLIENT_ID` for backend
- `ENABLE_V2_FEATURES=false` disables Scheduler/WebSocket boot

### Etapa 14 — Jobs Catalog

- `job-catalog` module (Clean Architecture) with `JobCatalogRepository`
- Prisma-native filters, sort, and cursor pagination for `GET /jobs`
- Official catalog seed (~400 jobs) with `externalId` for V2 dedup
- Removed in-memory job generation from production runtime
- ADR-025

### Etapa 13 — MVP Stabilization

- Prisma persistence for jobs catalog, tracking, timeline, interviews, notifications
- Match Engine V1 (`engineVersion: rules-v1`)
- Dashboard, notifications, companies backend modules
- Google OAuth real (frontend SDK + backend token validation)
- MSW removed from runtime; tests only
- ADR-024

## [v0.2.0] — 2026-07

### Etapa 12 — Pipeline & Job Tracking

- Job Tracking domain (`/tracking/*`) — ADR-023
- Pipeline as Kanban view-only
- Unified AddToTrackingModal
- 10 pipeline stages (no `favorite` column)
- Prisma models Job, JobTracking, TimelineEvent (schema)

## [v0.1.0] — 2026-06

### MVP Foundation

- Monorepo (Next.js 15 + Express + Prisma)
- Auth (mock Google), onboarding, dashboard (MSW)
- Jobs, job details, pipeline, account (profile + settings)
- Smart Mock Engine for match score
- Design system and Docker dev environment

## [v1.0.0-rc1] — Planned (Etapa 15)

~~- E2E tests, CI/CD, staging/production deploy~~
~~- Performance hardening and release polish~~

Delivered in `v1.0.0-rc1` (see CHANGELOG).
