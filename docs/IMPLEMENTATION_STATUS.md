# JobTrack AI — Implementation Status

Last updated: Etapa 13 (Layout e Filtro Salarial).  
Legend: ✅ Done · 🚧 In progress · ⬜ Pending · 🧪 Test-only mock

| Module | Frontend | Backend API | Prisma | Tests | Notes |
|--------|----------|-------------|--------|-------|-------|
| Auth | ✅ | ✅ | ✅ User | ✅ | Google OAuth real; rate limit login |
| Onboarding | ✅ | ✅ | ✅ Profile | ✅ | `blockedSkills` removido (Etapa 17) |
| Profile / Settings | ✅ | ✅ | ✅ | ✅ | Clean Architecture; `features/account/` |
| Jobs (catalog) | ✅ | ✅ | ✅ Job | ✅ | Filtro salarial inclusivo; meta `salaryCoverageRatio` (Etapa 13) |
| Job Aggregation | — | ✅ | ✅ Registry/Execution/Import | ✅ | Gupy + LinkedIn import; dedup idempotente (Etapa XX) |
| Job Details | ✅ | ✅ | ✅ | ✅ | Match rules-v2; related via catalog |
| Match Engine | ✅ types | ✅ | — | ✅ | `rules-v2`; JobTitleNormalizer + SkillMatcher |
| AI Career | ✅ | ✅ | ✅ Skill/AIAnalysis | ✅ | Gemini on-demand; cache-first; Etapa 18 |
| Job Tracking | ✅ | ✅ | ✅ | ✅ | Ownership enforced; rulesMatch persistido (v1.5) |
| Process Detail | ✅ | ✅ | ✅ | ✅ | `/pipeline/[trackingId]`; PATCH `/process` (v1.5) |
| Match Background | — | ✅ | ✅ aiAnalysisStatus | ✅ | IA após ProcessCreated; cache-first (v1.5) |
| Timeline | ✅ | ✅ | ✅ TimelineEvent | ✅ | |
| Interviews | ✅ | ✅ | ✅ Interview | ✅ | Calendar sync quando integrado (v1.5) |
| Calendar | ✅ | ✅ | ✅ CalendarIntegration | ✅ | Google ativo; Outlook stub (v1.5) |
| Pipeline | ✅ | ✅ view | ✅ via tracking | ✅ | Mobile: alterar status sem DnD (Etapa XX) |
| Dashboard | ✅ | ✅ | ✅ aggregates + jobSync | ✅ | Cards com dados do tracking; KPI entrevistas unificado |
| Notifications | ✅ | ✅ | ✅ Notification | ✅ | Header popover + mark read |
| Companies | ✅ | ✅ | derived from Job | ✅ | No separate model |
| Job Import (URL) | ✅ | ✅ | ✅ Job | ✅ | Gupy + LinkedIn; dedup `isExisting`; Programathor stub |
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
- Import URL duplicada → abre job existente; filtros inteligentes ao entrar em `/jobs`
- Pipeline mobile → alterar status via modal/sheet; sync calendário atualiza dashboard

## Etapa XX — entregas

| Parte | Entrega |
|-------|---------|
| Login | Grid responsivo, auth card alinhado, erros consistentes |
| Pipeline mobile | Select "Status do processo" no EditProcessModal + atalho no card |
| Dedup | `DedupStrategy` update vs skip; import confirm idempotente |
| Filtros | `GET /profile/job-search-hints` + defaults ao entrar em `/jobs` |
| Dashboard | Entrevistas via `CareerEventsService`; empresas/tecnologias do tracking |
| Import | LinkedIn extractor real; Programathor "em breve" |
| Notificações | Scroll reset ao abrir popover + skeleton loading |
| Sync | `invalidateCareerSurfaces` centralizado (profile, import, favoritos, realtime) |

## Etapa 13 — entregas

| Parte | Entrega |
|-------|---------|
| Layout | `EmptyState` sem `text-balance`; wrappers `min-w-0` em Jobs/Dashboard |
| Filtro salarial | Query OR preserva vagas sem salário; extração `baseSalary` JSON-LD |
| UX salário | Ocultar filtro quando cobertura &lt; 10%; sem default de `salaryMin` no perfil |

## Out of scope (V2+)

- Providers (Gupy, LinkedIn, Programathor) — V2
- Scheduler / WebSocket — V2 (`ENABLE_V2_FEATURES=false` default)
- AI Match enrichment — Etapa 16 (superseded by on-demand Etapa 18)
- E2E automatizado — deferred; checklist manual only
