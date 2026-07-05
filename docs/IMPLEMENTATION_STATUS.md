# JobTrack AI — Implementation Status

Last updated: Etapa 23 (Career Calendar & Product Polish v1.5).  
Legend: ✅ Done · 🚧 In progress · ⬜ Pending · 🧪 Test-only mock

| Module | Frontend | Backend API | Prisma | Tests | Notes |
|--------|----------|-------------|--------|-------|-------|
| Auth | ✅ | ✅ | ✅ User | ✅ | Google OAuth real; rate limit login |
| Onboarding | ✅ | ✅ | ✅ Profile | ✅ | `blockedSkills` removido (Etapa 17) |
| Profile / Settings | ✅ | ✅ | ✅ | ✅ | Clean Architecture; `features/account/` |
| Jobs (catalog) | ✅ | ✅ | ✅ Job | ✅ | Providers + seed opcional |
| Job Aggregation | — | ✅ | ✅ Registry/Execution/Import | ✅ | Gupy real; stubs LinkedIn/Programathor |
| Job Details | ✅ | ✅ | ✅ | ✅ | Match rules-v2; related via catalog |
| Match Engine | ✅ types | ✅ | — | ✅ | `rules-v2`; JobTitleNormalizer + SkillMatcher |
| AI Career | ✅ | ✅ | ✅ Skill/AIAnalysis | ✅ | Gemini on-demand; cache-first; Etapa 18 |
| Job Tracking | ✅ | ✅ | ✅ | ✅ | Ownership enforced; rulesMatch persistido (v1.5) |
| Process Detail | ✅ | ✅ | ✅ | ✅ | `/pipeline/[trackingId]`; PATCH `/process` (v1.5) |
| Match Background | — | ✅ | ✅ aiAnalysisStatus | ✅ | IA após ProcessCreated; cache-first (v1.5) |
| Timeline | ✅ | ✅ | ✅ TimelineEvent | ✅ | |
| Interviews | ✅ | ✅ | ✅ Interview | ✅ | Calendar sync quando integrado (v1.5) |
| Calendar | ✅ | ✅ | ✅ CalendarIntegration | ✅ | Google ativo; Outlook stub (v1.5) |
| Pipeline | ✅ | ✅ view | ✅ via tracking | ✅ | Read-only Kanban; legacy mutations deprecated |
| Dashboard | ✅ | ✅ | ✅ aggregates + jobSync | ✅ | Widget sincronização providers |
| Notifications | ✅ | ✅ | ✅ Notification | ✅ | Header popover + mark read |
| Companies | ✅ | ✅ | derived from Job | ✅ | No separate model |
| Job Import (URL) | ✅ | ✅ | ✅ Job | ✅ | Gupy extractor; source-url merge (v1.5) |
| Resume Intelligence | ✅ | ✅ | ✅ Resume* | ✅ | Currículo Inteligente; Etapa 22 |
| Realtime | ✅ polling | ✅ socket* | — | ✅ | *Socket local; `tracking:analysis-update` (v1.5) |
| CI/CD | ✅ | ✅ | ✅ validate | ✅ | `.github/workflows/ci.yml` |

## Runtime data flow

```
Browser → React Query → Express :3333 → Job Catalog (Prisma) ← Job Aggregation ← Providers
                                                              → PostgreSQL
```

Sync manual: `POST /providers/run` · Automático: `ENABLE_SCHEDULER=true`

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
- Job Tracking → Pipeline → Process Detail → Timeline → Favoritos → Prioridade
- Career Calendar → conectar Google → agendar entrevista → sync calendário
- Ocultar vaga → Minha Conta → Preferências → Notificações → Match Engine

## Out of scope (V2+)

- Providers (Gupy, LinkedIn, Programathor) — V2
- Scheduler / WebSocket — V2 (`ENABLE_V2_FEATURES=false` default)
- AI Match enrichment — Etapa 16 (superseded by on-demand Etapa 18)
- E2E automatizado — deferred; checklist manual only
