# Checklist — Domain & MVP

Source of truth (read when reviewing):

- `.cursor/rules/mvp-product-scope.mdc`
- `.cursor/rules/domain-model.mdc`
- `.cursor/rules/jobs-pipeline-separation.mdc`
- `.cursor/rules/msw-test-only.mdc`
- `docs/DECISIONS.md` (ADR-020, ADR-022, ADR-023, ADR-024)

## Product gate

- [ ] Change helps find, organize, prioritize, or track jobs — otherwise flag as out of MVP / V2
- [ ] No internal apply flow (`POST /jobs/:id/apply` or equivalent)
- [ ] No ATS / public profile / LinkedIn-GitHub profile / i18n / analytics-as-product unless already in scope docs
- [ ] “Open job” still goes to `sourceUrl` on the origin platform

## Jobs · Tracking · Pipeline

- [ ] Jobs = discovery only (no manual process registration on Jobs screen)
- [ ] Tracking owns favorites, priority, visibility, stage, notes, timeline (`/tracking/*`)
- [ ] Pipeline = Kanban view only (`GET /pipeline`); mutations stay on tracking
- [ ] No new `ManualJobs` module — manual + imported share `POST /tracking`
- [ ] Favorite is `isFavorite` + visual highlight — not a Kanban stage
- [ ] No single status field mixing favorite, priority, visibility, and stage

## Enums & aggregate

- [ ] `JobPriority`: HIGH | MEDIUM | LOW
- [ ] `JobVisibility`: VISIBLE | HIDDEN
- [ ] `JobSource`: gupy | linkedin | programathor | manual | referral | recruiter | company_site | other
- [ ] `PipelineStage`: discovery | applied | hr | technical_interview | manager | client | technical_test | offer | hired | closed
- [ ] No legacy stage `"favorite"`
- [ ] Stage moves update `lastStageUpdatedAt`; timeline events for stage/priority/favorite/visibility/notes

## MSW & runtime

- [ ] No MSW in app runtime (layout, providers, Docker/`NEXT_PUBLIC_ENABLE_MSW`)
- [ ] No `smart-mock-context` / `dashboard-builder` outside `src/mocks/` or `src/test/`
- [ ] MVP features talk to Express → Prisma, not browser mocks
