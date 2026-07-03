# JobTrack AI — Roadmap

Este documento acompanha as etapas do MVP e evoluções planejadas (V2). Atualize sempre que uma etapa for concluída.

**Visão do produto:** [PRODUCT_VISION.md](./PRODUCT_VISION.md)  
**Escopo MVP:** [MVP_SCOPE.md](./MVP_SCOPE.md)  
**Domínio oficial:** [DECISIONS.md](./DECISIONS.md) — ADR-022

## Legenda

- ✅ Concluído
- 🚧 Em andamento
- ⬜ Pendente

---

## MVP

Objetivo: Career Tracker — centralizar vagas, ajudar a encontrar oportunidades, priorizar oportunidades e acompanhar manualmente a jornada seletiva. O usuário **candidata-se sempre na plataforma de origem**.

### Infraestrutura e base

#### ✅ Foundation

Estrutura inicial do monorepo, Next.js 15, Express, TypeScript, ESLint, Prettier e Husky.

#### ✅ Design System

Componentes UI compartilhados (shadcn/ui, Tailwind v4), layout AppShell, tipografia e tokens visuais.

#### ✅ Dev Environment + Docker (Etapa 07.5)

Docker Compose para desenvolvimento (frontend, backend, PostgreSQL 17), health checks, hot reload e documentação do monorepo.

#### ✅ Product Alignment (Etapa 10.6)

Visão do produto, escopo MVP consolidado, documentação sincronizada, Cursor Rules de escopo, ADR-020.

#### ✅ Product Refinement (Etapa 10.7)

Domínio oficial refinado: favorito, prioridade, visibilidade, timeline, cadastro manual. Contratos de types/schemas atualizados. ADR-022. Cursor Rules de domínio.

### Frontend — features MVP

#### ✅ Mock API (MSW)

Handlers MSW com fixtures, paginação, factories e integração com React Query.

#### ✅ Auth

Login Google OAuth, rotas protegidas, middleware, sessão via contexto e cookies.

#### ✅ Onboarding

Fluxo de perfil profissional, validação Zod e persistência via MSW/backend stub.

#### ✅ Smart Mock Engine (Etapa 06)

Match score determinístico, dashboard/notificações/jobs personalizados por perfil.

#### ✅ Dashboard (Etapa 07)

Home com KPIs, insight, melhores vagas, entrevistas, timeline, empresas, tecnologias e gráfico Recharts.

#### ✅ Jobs (Etapa 08)

Listagem com busca global, filtros avançados (URL via nuqs), ordenação, infinite scroll, JobCard reutilizável e favoritos.

#### ✅ Job Details (Etapa 09)

Página de detalhe com match score, insights, learning gaps, vagas relacionadas, timeline e ações (favoritar, **abrir vaga** na origem).

#### ✅ Pipeline (Etapa 10)

Kanban de acompanhamento manual com drag and drop, KPIs, filtros, drawer/panel de detalhes e histórico por estágio.

#### ✅ Minha Conta (Etapa 11)

Perfil simplificado + Preferências (`features/account`, Prisma User/Profile/UserSettings, módulos `profiles` e `settings` em Clean Architecture).

**Entregue:**

- [x] Abas Perfil / Preferências na área da conta (`AccountTabsNav`)
- [x] Estrutura `queries/` e `services/` em `features/account`
- [x] Testes de componentes e hooks
- [x] Alinhamento de schemas (senioridade, labels)
- [x] Integração React Query + Backend + Prisma + EventBus

#### ✅ Pipeline & Job Tracking (Etapa 12)

Domínio **Job Tracking** (ADR-023) — núcleo do MVP:

- [x] Módulo `tracking` + API `/tracking/*`
- [x] Pipeline como view Kanban (`GET /pipeline`)
- [x] Modal unificado (Jobs + Pipeline manual)
- [x] Timeline automática + modal de data no DnD
- [x] Remoção estágio `favorite`; 10 estágios oficiais
- [x] Abrir vaga + Adicionar ao Pipeline (sem `POST /apply`)
- [x] Prisma Job + JobTracking + TimelineEvent
- [x] Cursor Rules + ADR-023

#### ✅ MVP Stabilization (Etapa 13)

Consolidar MVP com persistência real, sem mocks em runtime:

- [x] Prisma: Job catalog seed, Tracking, Interview, Notification
- [x] Match Engine V1 (`rules-v1`)
- [x] Dashboard + Notificações + Empresas no backend
- [x] Google OAuth real
- [x] MSW apenas em testes
- [x] Entrevistas no domínio Tracking
- [x] ADR-024 + IMPLEMENTATION_STATUS + CHANGELOG

#### ✅ Jobs Catalog (Etapa 14)

Catálogo oficial persistido em Prisma — sem vagas fake em runtime:

- [x] Módulo `job-catalog` (Clean Architecture) + `JobCatalogRepository`
- [x] `PrismaJobCatalogRepository` com filtros, ordenação e paginação via Prisma
- [x] Seed oficial ~400 vagas (`prisma/seeders/`)
- [x] `externalId` + índices para filtros e dedup V2
- [x] `ProviderJobCatalogRepository` documentado (stub V2)
- [x] Remoção de geração in-memory em runtime
- [x] ADR-025

#### ✅ Release Candidate (Etapa 15 — RC1)

- CI/CD (GitHub Actions): lint, typecheck, build, test, test:integration
- Segurança: ownership em `/tracking/*` e `/pipeline/*`, env production hardened, rate limit login
- Build limpo: `getRouteParam` (Express 5), testes excluídos do `tsc`
- UX: estados loading/empty/error padronizados, notificações no header, a11y nav
- Limpeza: placeholders, repos in-memory runtime, MSW runtime removido
- Checklist manual MVP (sem suite E2E automatizada)
- ADR-026

#### ✅ Job Aggregation Engine (Etapa 17)

- Módulo `job-aggregation` (Clean Architecture)
- Gupy provider real; LinkedIn/Programathor arquitetura + stub
- Normalização, deduplicação, scheduler interno
- Endpoints `GET/POST /providers/*`
- Dashboard sincronização; seed opcional (`SEED_CATALOG`)
- Remoção `blockedSkills` do onboarding
- ADR-027

#### ✅ AI Career Intelligence (Etapa 18)

- Módulo `ai` (Clean Architecture) + Gemini via `AIProvider`
- Skills Catalog (`Skill`, `SkillAlias`, `UserSkill`) + `SkillNormalizer`
- Cache persistente `AIAnalysis` + `PROMPT_VERSION`
- `POST/GET /ai/career-analysis/:trackingId` (on-demand)
- UX: botão "Gerar análise IA" em Job Details e Pipeline
- ADR-028

#### ✅ UX Stabilization & Smart Job Matching (Etapa 19)

- Match Engine `rules-v2` — área/cargo dominam; cap incompatível ≤ 30
- `JobTitleNormalizer` + `SkillMatcher` (aliases síncronos)
- Auditoria UX responsiva (`docs/UX_AUDIT_ETAPA19.md`)
- Dashboard, JobCard, AppShell, busca estável (`searchDraft`)
- `docs/MATCH_ENGINE.md` + ADR-029 + Cursor Rule `match-engine.mdc`

#### ✅ Production Stabilization (Etapa 20)

- Logger environment-aware (sem `pino-pretty` na Vercel)
- Env validation com mensagens claras + aliases `AUTH_SECRET`
- Health check com Prisma (`GET /health` → 503 se DB down)
- Request logger com correlation ID
- Auth: `/auth/me` 401, logout idempotente, frontend session sync
- `docs/DEPLOYMENT.md`, `docs/PRODUCTION_AUDIT.md`, Cursor Rule `production-deploy.mdc`

---

## Pós-MVP v1.x

### ✅ Product Polish & UX (Etapa 21)

- Identidade visual (logo SVG, favicon, OG)
- SEO completo (metadata, JSON-LD, robots, sitemap)
- PWA manifest preparado
- Job freshness (`expiresAt`, `lastCheckedAt`, `markStaleByProvider`)
- Ordenação default `recent` (data → match → prioridade)
- Fix `sourceUrl` / Abrir vaga + importação por URL (Gupy)
- Provider sync incremental + dashboard sync stats
- Notificações `job_closed` + Realtime híbrido (Socket local / polling Vercel)
- `docs/PROVIDERS.md`, `docs/WEBSOCKET.md`, `docs/PWA.md`, `docs/SEO.md`
- ADR-030 + Cursor Rules (URL, freshness, sorting, import)

---

### ✅ Currículo Inteligente / Resume Intelligence v1.4 (Etapa 22)

- Módulo `resume` — currículo estruturado, versionamento, upload PDF/DOCX/TXT
- Análise currículo × vaga (Match Engine + Gemini + cache)
- Sugestões com aceitar/rejeitar/editar (nunca auto-aplicar)
- UI **Currículo Inteligente** em Minha Conta
- ADR-031 + `docs/RESUME_INTELLIGENCE.md`

---

#### ~~Release Candidate MVP (Etapa 13)~~ — renumerado para Etapas 13–15

~~- Notificações (feed de eventos internos)~~
~~- Entrevistas (gestão no contexto do pipeline)~~
~~- Performance (bundle, cache, prefetch)~~
~~- Testes (E2E e integração ampliada)~~
~~- Deploy (CI/CD, staging/production)~~

### Backend — MVP

#### ✅ Arquitetura oficial (Etapa 10.5)

Clean Architecture + módulo `system` template, EventBus, Cursor Rules.

#### ✅ Contratos de domínio (Etapa 10.7)

Enums e types oficiais: `JobPriority`, `JobVisibility`, `TimelineEventType`, `JobSource.manual`. Schemas Zod para endpoints planejados.

### Qualidade e entrega MVP

Cobertos na Etapa 13 (Release Candidate).

### Alinhamento de código pendente

Dívida documentada em [MVP_SCOPE.md](./MVP_SCOPE.md#dívida-técnica-documentada-alinhamento-futuro):

- [ ] Botão "Aplicar" → **Abrir vaga** (`JobCard`, Job Details) — Etapa 12
- [ ] Deprecar `POST /jobs/:id/apply` no código — Etapa 12
- [ ] Remover estágio `"favorite"` do pipeline Kanban — Etapa 12
- [ ] Implementar prioridade, visibilidade, cadastro manual — Etapa 12
- [x] Remover etapa `blockedSkills` do onboarding — Etapa 17
- [ ] Alinhar `engagementState: applied` com fluxo manual do pipeline

---

## V2

Funcionalidades **fora do MVP**. Não implementar antes de concluir o escopo MVP.

### Integrações e infraestrutura

- ✅ **Importação por URL** — Etapa 21 (Gupy real; LinkedIn/Programathor stub)
- ✅ **WebSocket** — Etapa 21 (local); polling fallback Vercel
- ⬜ **Integrações avançadas** — novas fontes e normalização em produção

### Inteligência e dados

- ⬜ **Match Engine (real)** — substituir Smart Mock Engine por algoritmo no backend
- ⬜ **IA** — resumos de vagas, insights com LLM
- ⬜ **Analytics** — métricas de uso e conversão (usa timeline como fonte)
- ⬜ **Machine Learning** — match avançado e recomendações

### Produto

- ⬜ **Internacionalização (i18n)**
- ⬜ **Activity Center** em tempo real
- ⬜ Upload de currículo, carta de apresentação
- ⬜ Perfil público, LinkedIn/GitHub/portfólio
- ⬜ Idiomas, certificações, rede social
- ⬜ ATS, cadastro manual de empresas
- ⬜ Settings avançados

---

## Manutenção

Ao concluir uma etapa:

1. Marque o status neste arquivo.
2. Atualize [ARCHITECTURE.md](./ARCHITECTURE.md) se a arquitetura mudar.
3. Registre decisões em [DECISIONS.md](./DECISIONS.md).
4. Valide contra [MVP_SCOPE.md](./MVP_SCOPE.md) antes de novas features.
5. Sincronize os READMEs da raiz, frontend e backend.
