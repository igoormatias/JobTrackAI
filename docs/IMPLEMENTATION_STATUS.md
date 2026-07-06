# JobTrack AI — Implementation Status

Last updated: Etapa 15 (UX Pipeline, Responsividade, IA).  
Legend: ✅ Done · 🚧 In progress · ⬜ Pending · 🧪 Test-only mock

| Module | Frontend | Backend API | Prisma | Tests | Notes |
|--------|----------|-------------|--------|-------|-------|
| Auth | ✅ | ✅ | ✅ User | ✅ | Google OAuth real; rate limit login |
| Onboarding | ✅ | ✅ | ✅ Profile | ✅ | `blockedSkills` removido (Etapa 17) |
| Profile / Settings | ✅ | ✅ | ✅ | ✅ | Clean Architecture; `features/account/` |
| Jobs (catalog) | ✅ | ✅ | ✅ Job | ✅ | Catálogo global; `locationScope`; filtros sugeridos (Etapa 14) |
| Job Aggregation | — | ✅ | ✅ Registry/Execution/Import | ✅ | Gupy + LinkedIn import; dedup idempotente (Etapa XX) |
| Job Details | ✅ | ✅ | ✅ | ✅ | Match rules-v2; related via catalog |
| Match Engine | ✅ types | ✅ | — | ✅ | `rules-v2`; JobTitleNormalizer + SkillMatcher |
| AI Career | ✅ | ✅ | ✅ Skill/AIAnalysis | ✅ | Gemini on-demand; cache-first; Etapa 18 |
| Job Tracking | ✅ | ✅ | ✅ | ✅ | ApplicationProcess alias; campos processo expandidos (Etapa 14) |
| Process Detail | ✅ | ✅ | ✅ recruiterRole | ✅ | Seções CRM; entrevistas; ChangeStageSheet (Etapa 15) |
| Match Background | — | ✅ | ✅ aiAnalysisStatus | ✅ | IA após ProcessCreated; cache-first (v1.5) |
| Timeline | ✅ | ✅ | ✅ TimelineEvent | ✅ | |
| Interviews | ✅ | ✅ | ✅ Interview | ✅ | Calendar sync quando integrado (v1.5) |
| Calendar | ✅ | ✅ | ✅ CalendarIntegration | ✅ | Google ativo; Outlook stub (v1.5) |
| Pipeline | ✅ | ✅ view | ✅ via tracking | ✅ | Mobile: sem DnD; tap → detalhe; ações ⋮ (Etapa 15) |
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

## Etapa 14 — entregas

| Parte | Entrega |
|-------|---------|
| ADR-034 | ApplicationProcess = JobTracking; jobs globais; sem editar Job via processo |
| Catálogo | Manual/import → `upsertCatalogJob`; backfill script |
| Processo | `recruiterLinkedin`, `tags`, `salaryExpectation`; timeline padronizada |
| Explorar | `locationPreference`; banner filtros sugeridos; limpar com skip defaults |
| UI | "Iniciar processo"; "Ver vaga" no detalhe do processo |

## Etapa 15 — entregas

| Parte | Entrega |
|-------|---------|
| Process detail | 8 seções CRM; entrevistas; salário publicado; `recruiterRole` |
| Pipeline mobile | Sem DnD &lt; lg; tap → detalhe; `ChangeStageSheet` compartilhado |
| Card actions | Desktop ícones; mobile menu ⋮; editar via `?edit=1` |
| Login | `text-balance` removido; `break-words` / `min-w-0` |
| IA 500 | `buildSnapshot` hardened; P2021 → 503; `aiAnalysisStatus` em `generate` |

## Out of scope (V2+)

- Providers (Gupy, LinkedIn, Programathor) — V2
- Scheduler / WebSocket — V2 (`ENABLE_V2_FEATURES=false` default)
- AI Match enrichment — Etapa 16 (superseded by on-demand Etapa 18)
- E2E automatizado — deferred; checklist manual only
