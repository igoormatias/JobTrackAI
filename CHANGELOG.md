# Changelog

All notable changes to JobTrack AI are documented in this file.

## [Unreleased]

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

- E2E tests, CI/CD, staging/production deploy
- Performance hardening and release polish
