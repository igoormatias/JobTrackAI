# JobTrack AI — Implementation Status

Last updated: Etapa 15 (Release Candidate RC1).  
Legend: ✅ Done · 🚧 In progress · ⬜ Pending · 🧪 Test-only mock

| Module | Frontend | Backend API | Prisma | Tests | Notes |
|--------|----------|-------------|--------|-------|-------|
| Auth | ✅ | ✅ | ✅ User | ✅ | Google OAuth real; rate limit login |
| Onboarding | ✅ | ✅ | ✅ Profile | ✅ | |
| Profile / Settings | ✅ | ✅ | ✅ | ✅ | Clean Architecture; `features/account/` |
| Jobs (catalog) | ✅ | ✅ | ✅ Job seed ~400 | ✅ | Integration tests (Prisma, CI) |
| Job Details | ✅ | ✅ | ✅ | ✅ | Match V1; related via catalog |
| Match Engine | ✅ types | ✅ | — | ✅ | `rules-v1`; AI enriches in Etapa 16 |
| Job Tracking | ✅ | ✅ | ✅ | ✅ | Ownership enforced (IDOR fix) |
| Timeline | ✅ | ✅ | ✅ TimelineEvent | ✅ | |
| Interviews | ✅ | ✅ | ✅ Interview | ✅ | Sub-resource of tracking |
| Pipeline | ✅ | ✅ view | ✅ via tracking | ✅ | Read-only Kanban; legacy mutations deprecated |
| Dashboard | ✅ | ✅ | ✅ aggregates | ✅ | No Smart Mock Engine |
| Notifications | ✅ | ✅ | ✅ Notification | ✅ | Header popover + mark read |
| Companies | ✅ | ✅ | derived from Job | ✅ | No separate model |
| MSW | 🧪 | — | — | 🧪 | Tests only (ADR-024) |
| CI/CD | ✅ | ✅ | ✅ validate | ✅ | `.github/workflows/ci.yml` |

## Runtime data flow

```
Browser → React Query → Express :3333 → Job Catalog (Prisma) → PostgreSQL
```

## RC1 quality gates

| Gate | Status |
|------|--------|
| `pnpm lint` | ✅ |
| `pnpm typecheck` | ✅ |
| `npm --prefix backend run build` | ✅ |
| `pnpm test` + `test:integration` | ✅ |
| `prisma validate` | ✅ |
| Docker MSW=false | ✅ |
| Manual MVP checklist | ✅ (documented below) |

## Manual MVP checklist (RC1)

Validated flows (no regressions expected):

- Login → Onboarding → Dashboard → Jobs → Job Details
- Job Tracking → Pipeline → Timeline → Favoritos → Prioridade
- Ocultar vaga → Minha Conta → Preferências → Notificações → Match Engine

## Out of scope (V2+)

- Providers (Gupy, LinkedIn, Programathor) — V2
- Scheduler / WebSocket — V2 (`ENABLE_V2_FEATURES=false` default)
- AI Match enrichment — Etapa 16
- E2E automatizado — deferred; checklist manual only
