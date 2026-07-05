# JobTrack AI — Decisões Arquiteturais (ADR)

Registro de decisões técnicas relevantes. Adicione novas entradas quando houver mudanças importantes.

---

## ADR-001 — Redis removido do MVP

**Status:** Aceito  
**Data:** 2025

**Contexto:** O backend foi inicialmente planejado com Redis (Upstash) para cache, sessões e rate limiting.

**Decisão:** Redis **não** faz parte do MVP documentado nem do ambiente Docker de desenvolvimento.

**Motivos:**

- Baixa complexidade inicial para equipe e onboarding
- TanStack React Query cobre cache e revalidação no frontend
- Rate limiting usa `express-rate-limit` em memória no backend
- Código Redis no backend permanece **opcional** (`REDIS_URL` ausente = skip) sem impacto no fluxo principal

**Consequências:** Documentação e `.env.example` não incluem Redis. Reavaliar em escala (múltiplas instâncias do backend).

---

## ADR-002 — MSW como Smart Mock Engine até Match Engine real

**Status:** Aceito

**Decisão:** Regras de match, dashboard personalizado e notificações vivem em `frontend/src/features/recommendations` e são aplicadas nos handlers MSW on-read.

**Motivos:** Desenvolvimento frontend desacoplado do backend incompleto; UX demonstrável com perfil de onboarding.

**Consequências:** `GET /recommendations` no backend é stub; migração futura move lógica para o backend.

---

## ADR-003 — Docker apenas para desenvolvimento

**Status:** Aceito (Etapa 07.5)

**Decisão:** `docker-compose.yml` e Dockerfiles em `docker/` servem **somente** ambiente local de desenvolvimento.

**Produção:** Frontend na Vercel; backend em Vercel Services; banco no Supabase PostgreSQL.

---

## ADR-004 — Monorepo sem workspace unificado

**Status:** Aceito

**Decisão:** Frontend usa **pnpm**; backend usa **npm**. Scripts na raiz delegam com `pnpm --dir frontend` e `npm --prefix backend`.

**Motivos:** Evitar migração de lockfiles nesta etapa; cada app mantém seu gerenciador atual.

---

## ADR-005 — Migrations Prisma manuais

**Status:** Aceito

**Decisão:** O container do backend **não** executa `prisma migrate` automaticamente no startup.

**Motivos:** Controle explícito do desenvolvedor; evita alterações acidentais no banco compartilhado.

**Uso:** Quando houver models, rodar `npx prisma migrate dev` no host ou `docker compose exec backend npx prisma migrate dev`.

---

## ADR-006 — Sessão via cookies HttpOnly

**Status:** Aceito (alvo)

**Decisão:** Tokens de autenticação não devem ser persistidos em `localStorage` no cliente final.

**Motivos:** Mitigação de XSS; alinhamento com práticas OWASP para SPAs com backend próprio.

---

## ADR-007 — Assets de design na raiz do monorepo

**Status:** Aceito (Etapa 07.5)

**Decisão:** Referências visuais (`jobtracker-desktop.png`, `jobtracker-mobile.png`) ficam em `/assets` na raiz, compartilhadas entre documentação e times.

---

## ADR-008 — Parâmetro `search` na URL vs `q` na API

**Status:** Aceito (Etapa 08)

**Decisão:** A URL do browser usa `?search=` (nuqs); o service mapeia para `q` na API.

**Motivos:** UX e compartilhamento de links legíveis; compatibilidade com handlers MSW que aceitam ambos.

---

## ADR-009 — `engagementState` computado server-side

**Status:** Aceito (Etapa 08) — **parcialmente superseded por ADR-022**

**Decisão:** Estados de vaga (`new`, `viewed`, `favorited`, `applied`, `rejected`) são derivados no MSW/backend e retornados no objeto `Job`.

**Motivos:** Componentes permanecem apresentacionais; regras centralizadas para futura API real.

**Nota (ADR-022):** `engagementState` será simplificado na Etapa 12. O valor `applied` está **deprecated** — candidatura ocorre na plataforma de origem; acompanhamento via pipeline manual. Favorito, prioridade e visibilidade passam a ser atributos independentes em `JobEngagement`.

---

## ADR-010 — `JobCard` compartilhado entre Dashboard e Jobs

**Status:** Aceito (Etapa 08)

**Decisão:** `DashboardTopJobCard` compõe `JobCard` em variante `compact` em vez de duplicar markup.

---

## ADR-011 — Virtualização condicional na listagem

**Status:** Aceito (Etapa 08)

**Decisão:** `@tanstack/react-virtual` ativado apenas quando a lista acumulada ultrapassa 30 itens.

**Motivos:** Performance em listas longas sem custo em páginas iniciais pequenas.

---

## ADR-012 — Endpoints paralelos na Job Details

**Status:** Aceito (Etapa 09)

**Decisão:** A página de detalhe consome `GET /jobs/:id` e sub-recursos (`/match`, `/related`, `/timeline`, `/insights`, `/learning-gaps`) em paralelo via React Query, em vez de um único aggregate.

**Motivos:** Cache granular, carregamento progressivo, reuso de endpoints em outros contextos futuros.

**Consequências:** Mais requisições na primeira visita; componentes permanecem apresentacionais.

---

## ADR-013 — Feature `job-details` separada de `jobs`

**Status:** Aceito (Etapa 09)

**Decisão:** Detalhe da vaga vive em `features/job-details`; listagem permanece em `features/jobs`.

**Motivos:** Separação de responsabilidades, evolução independente da página de detalhe.

---

## ADR-014 — Match na detail page só via `/match`

**Status:** Aceito (Etapa 09)

**Decisão:** Na rota `/jobs/[id]`, o score exibido vem exclusivamente de `GET /jobs/:id/match`, ignorando `job.matchScore` do payload principal.

**Motivos:** Consistência com endpoint dedicado; evita divergência se o job principal for cacheado sem score atualizado.

---

## ADR-015 — Contrato `/pipeline` como API pública

**Status:** Aceito (Etapa 10) — **estágios alvo atualizados em ADR-022**

**Decisão:** A UI consome apenas endpoints `/pipeline/*`. A entidade interna continua sendo `Application`; `/applications` permanece legado interno até remoção futura.

**Nota (ADR-022):** O estágio `"favorite"` no Kanban é **legado** e será removido na Etapa 12. Estágios alvo: `applied → hr → technical_interview → manager → client → offer → hired | rejected`. Favoritos são exclusivamente `JobEngagement.isFavorite`.

---

## ADR-016 — `@dnd-kit` para Kanban

**Status:** Aceito (Etapa 10)

**Decisão:** Drag and drop entre colunas via `@dnd-kit/core` com optimistic update no React Query.

---

## ADR-017 — Detalhe do pipeline in-page (drawer/panel)

**Status:** Aceito (Etapa 10)

**Decisão:** Abrir detalhes da candidatura em drawer (mobile) ou side panel (desktop), sem navegar para `/jobs/[id]`.

---

## ADR-018 — Backend como fonte de verdade do pipeline

**Status:** Aceito (Etapa 10)

**Decisão:** Lógica de KPIs, filtros e timeline no backend Express. MSW espelha contratos apenas para testes Vitest.

---

## ADR-019 — Arquitetura evolutiva Clean Architecture + DDD (lightweight)

**Status:** Aceito  
**Data:** 2026-06

**Contexto:** O backend usa hoje `controller → service → repository` por módulo. Funciona para o MVP, mas dificulta escalar regras de domínio, testar isoladamente e desacoplar efeitos colaterais (notificações, timeline, etc.).

**Decisão:**

- Adotar **Clean Architecture + DDD (lightweight)** como padrão **obrigatório para novos módulos**
- Estrutura: `domain/`, `application/`, `infrastructure/` com Use Cases, Entities, Value Objects e Repository interfaces
- Introduzir `EventBus` (`InMemoryEventBus`) para ações importantes
- Criar módulo `system` como template de referência (`/health`, `/version`, `/info`)
- **Não** refatorar módulos legados em massa — migração gradual ao receber features significativas

**Motivos:**

- Manter estabilidade e deploy contínuo
- Estabelecer padrão claro sem over-engineering
- Documentação e Cursor Rules como fonte oficial

**Consequências:**

- Novos módulos seguem `backend/.cursor/rules/backend-architecture.mdc`
- Módulo `health` deprecated em favor de `system` (API `/health` mantida)
- Exceções arquiteturais devem ser registradas neste arquivo
- Prisma permanece restrito a `infrastructure/repositories/`

---

## ADR-020 — Redefinição do Escopo do Produto

**Status:** Aceito  
**Data:** 2026-06 (Etapa 10.6)

**Contexto:** Documentação e código descreviam aplicação de vagas pela plataforma, perfil amplo, integrações em tempo real e pipeline como "candidatura". Isso gerava feature creep e desalinhamento com a visão de Career Tracker.

**Decisão:**

- MVP = **Career Tracker** — centralizar vagas, match score, pipeline manual
- Candidatura **sempre** na plataforma de origem (botão **Abrir vaga**)
- Pipeline = acompanhamento manual da jornada, não candidatura automática
- Perfil simplificado (Google nome/foto + 6 campos profissionais)
- Notificações = eventos internos apenas

**Removido do MVP:**

- Aplicação pela plataforma, upload de currículo, carta de apresentação
- Perfil público, LinkedIn/GitHub/portfólio, idiomas, certificações
- Rede social, compartilhamento de perfil, ATS, cadastro manual de empresas

**Permanece V2:**

- Providers reais, Scheduler, WebSocket, IA, Analytics, ML, i18n, integrações avançadas

**Consequências:**

- Toda nova feature passa pelo filtro em `MVP_SCOPE.md` e `.cursor/rules/mvp-product-scope.mdc`
- Divergências de código (`POST /apply`, botão "Aplicar") documentadas como dívida técnica
- Documentação oficial: `PRODUCT_VISION.md`, `MVP_SCOPE.md`, `API_CONTRACT.md`
- Refinamento complementar: **ADR-022** (domínio oficial Etapa 10.7)

---

## ADR-021 — Minha Conta e persistência Prisma

**Status:** Aceito  
**Data:** 2026-06 (Etapa 11)

**Contexto:** Profile e settings eram in-memory no backend; frontend tinha placeholders em `features/profile` e `features/settings`. O tipo `UserSettings` incluía campos V2 (push, e-mail, i18n).

**Decisão:**

- Models Prisma: `User`, `Profile`, `UserSettings` com repositories Prisma
- Módulo `profiles` refatorado para Clean Architecture + evento `ProfileUpdated`
- Módulo greenfield `settings` + evento `SettingsUpdated`
- Feature frontend `features/account` (Perfil + Preferências)
- Auth faz `upsert` de User + default UserSettings no login Google
- Preferências MVP: tema (`system` suportado), refresh de vagas, intervalo dashboard

**Consequências:**

- Repositories in-memory de profile removidos; auth usa Prisma em produção e in-memory em testes
- Navegação agrupada: Minha Conta > Perfil / Preferências
- `GET /profile` retorna `user` read-only no DTO

---

## ADR-022 — Refinamento do Domínio (Etapa 10.7)

**Status:** Aceito  
**Data:** 2026-07 (Etapa 10.7)

**Contexto:** Após ADR-020, o produto foi redefinido como Career Tracker, mas o domínio ainda misturava conceitos (estágio `"favorite"` no pipeline vs. `isFavorite` booleano; ausência de prioridade e visibilidade; timeline limitada; cadastro manual não documentado). Era necessário consolidar o modelo antes das implementações das Etapas 12–13.

**Decisão:**

### Visão do produto

JobTrack AI **não** é plataforma de candidatura nem ATS. É um **Career Tracker** que centraliza vagas, organiza a busca, prioriza oportunidades e acompanha processos seletivos. Toda candidatura ocorre na plataforma de origem.

### Modelo de domínio — atributos independentes

Nunca utilizar um único status para representar todos os estados. O domínio divide-se em duas camadas:

**A. `JobEngagement`** (relação usuário × vaga):

| Atributo | Tipo | Default |
|----------|------|---------|
| `isFavorite` | `boolean` | `false` |
| `priority` | `HIGH \| MEDIUM \| LOW` | `MEDIUM` |
| `visibility` | `VISIBLE \| HIDDEN` | `VISIBLE` |
| `hiddenAt` | `string \| null` | `null` |

**B. `Application`** (acompanhamento da jornada seletiva):

| Atributo | Tipo | Notas |
|----------|------|-------|
| `stage` | `PipelineStage` | Estágio atual |
| `lastStageUpdatedAt` | `string` | Atualizado automaticamente em cada movimentação |
| `notes` | `string \| null` | Observações livres |
| `timeline` | `TimelineEvent[]` | Histórico auditável |
| `status` | `active \| archived \| withdrawn` | Estado da entrada |

Exemplo válido: vaga favorita + prioridade HIGH + estágio `technical_interview` + visível.

### Pipeline

O Pipeline **não representa candidatura** — apenas acompanhamento manual da jornada.

**Fluxo oficial:**

```
Encontrou vaga → Favoritou → Definiu prioridade → Abriu vaga (origem)
  → Aplicou na plataforma original → Adicionou ao Pipeline
  → Atualizou estágio (DnD) → Timeline + lastStageUpdatedAt automáticos
```

**Estágio `"favorite"` legado:** permanece no código até Etapa 12; alvo é remoção da coluna Kanban.

### Ações MVP em vagas

| Ação | Endpoint |
|------|----------|
| Favoritar / desfavoritar | `PATCH /jobs/:id/favorite` |
| Definir prioridade | `PATCH /jobs/:id/priority` |
| Ocultar / restaurar | `PATCH /jobs/:id/visibility` |
| Abrir vaga | `sourceUrl` no client (sem endpoint) |

### Cadastro manual de vagas (MVP)

`POST /jobs` com `source: "manual"`. Campos: empresa, cargo, URL, descrição, data da candidatura, status inicial, observações. Mesmo fluxo das vagas importadas — nunca fluxo separado.

### Timeline — tipos oficiais

`TimelineEventType`: `created`, `stage_changed`, `priority_changed`, `favorited`, `unfavorited`, `hidden`, `restored`, `note_added`, `note_updated`, `applied`, `interview_scheduled`, `offer_received`, `rejected`.

`occurredAt` editável via `PATCH /pipeline/:id/timeline/:eventId` (implementação Etapa 12).

### Importação futura (V2)

Importar por URL e Providers automáticos — fora do MVP.

**Motivos:**

- Evitar refatorações futuras ao implementar Etapas 12–13
- Separar claramente engajamento com vaga vs. acompanhamento seletivo
- Preparar timeline para IA e Analytics (V2)

**Consequências:**

- Contratos de types/schemas atualizados de forma aditiva (Etapa 10.7)
- UI, persistência Prisma e endpoints novos ficam para Etapas 12–13
- Toda nova feature deve seguir este domínio oficial
- Documentação: `PRODUCT_VISION.md`, `MVP_SCOPE.md`, `API_CONTRACT.md`, `ARCHITECTURE.md`
- Cursor Rules: `mvp-product-scope.mdc`, `domain-model.mdc`

---

## ADR-023 — Job Tracking como domínio central (Etapa 12)

**Status:** Aceito  
**Data:** 2026-07 (Etapa 12)

**Contexto:** Jobs (descoberta) e Pipeline (Kanban) compartilhavam regras de engajamento e estágio. ADR-022 separou `JobEngagement` e `Application`, mas a API ainda espalhava mutações entre `/jobs` e `/pipeline`.

**Decisão:**

### Três camadas

| Camada | Responsabilidade | API |
|--------|------------------|-----|
| **Job** | Oportunidade imutável (provider-agnostic) | `GET /jobs`, match, detalhes |
| **JobTracking** | Estado do usuário: favorito, prioridade, visibilidade, estágio, notas, timeline | `POST/GET/PATCH /tracking/*` |
| **Pipeline** | Visualização Kanban agrupada por estágio | `GET /pipeline` (view) |

### Agregado `JobTracking`

Substitui `JobEngagement` + `Application` no código e persistência. Um único fluxo para vagas importadas e processos manuais (`POST /tracking`).

### Estágios (slug + label PT)

`discovery` → `closed` (10 estágios). **Sem** estágio `favorite` — favorito é `isFavorite` com destaque visual.

### Eventos

`TrackingCreated`, `TrackingStageChanged`, `TimelineCreated`, `TimelineUpdated`, `JobFavorited`, `PriorityChanged`, `JobHidden`, `JobRestored`, `NoteAdded`.

**Consequências:**

- ADR-022 permanece nos princípios (ortogonalidade, sem candidatura interna)
- `POST /jobs/:id/apply` removido; `PATCH /jobs/:id/favorite` vira alias temporário
- Documentação e Cursor Rules atualizados para separação Jobs / Tracking / Pipeline

---

## ADR-024 — MVP Stabilization (Etapa 13)

**Status:** Aceito  
**Data:** 2026-07 (Etapa 13)

**Contexto:** O MVP tinha núcleo funcional (Jobs, Tracking, Pipeline, Dashboard) mas dependia de repositórios in-memory, MSW no browser e Smart Mock Engine para match/dashboard. Isso impedia consistência entre sessões, deploy e validação real do produto.

**Decisão:**

- **Persistência Prisma** para núcleo: `Job` (catálogo seed), `JobTracking`, `TimelineEvent`, `Interview`, `Notification`, `JobView`
- **MSW** restrito a testes (Vitest) — runtime consome Express + Prisma
- **Match Engine V1** (`engineVersion: "rules-v1"`) no backend; contrato estável para Etapa 15 (AI enriquece, não substitui)
- **Google OAuth real** em todos os ambientes (dev, produção e testes usam stub/mocks apenas nos testes automatizados)
- **Dashboard** calculado via agregações Prisma (sem Smart Mock Engine)
- **Notificações** internas via EventBus + Prisma
- **Entrevistas** sub-recurso de Tracking (`/tracking/:id/interviews`)

**Consequências:**

- Etapa 15 = Release Candidate (E2E, CI/CD, deploy)
- Etapa 16 = AI Match Engine (enriquecimento sobre contrato V1)
- `docs/IMPLEMENTATION_STATUS.md` e `CHANGELOG.md` como fonte de status
- Cursor Rule `.cursor/rules/msw-test-only.mdc`

---

## ADR-025 — Job Catalog (Etapa 14)

**Status:** Aceito  
**Data:** 2026-07 (Etapa 14)

**Contexto:** O MVP ainda carregava vagas com filtros em memória e gerava jobs fake no import do backend. O catálogo precisava ser a fonte única de verdade para descoberta de vagas, preparada para ingestão por Providers na V2.

**Decisão:**

- **Job Catalog** como módulo oficial (`modules/job-catalog`) com `JobCatalogRepository`
- **Implementação MVP:** `PrismaJobCatalogRepository` + seed Prisma (~400 vagas)
- **Busca:** filtros, ordenação e paginação via Prisma (match sort usa subconjunto limitado do catálogo + Match Engine V1)
- **V2:** `ProviderJobCatalogRepository` alimenta o mesmo modelo `Job` via providers + scheduler (não altera use cases)
- **Sem** geração in-memory em runtime; repositório in-memory apenas em testes

**Consequências:**

- Providers (Gupy, LinkedIn, Programathor) e Scheduler permanecem V2
- API `GET /jobs` mantém contrato público
- `externalId` + `@@unique([source, externalId])` para deduplicação futura

---

## ADR-026 — Release Candidate RC1 (Etapa 15)

**Status:** Aceito  
**Data:** 2026-07 (Etapa 15)

**Contexto:** Após Jobs Catalog (Etapa 14), o MVP estava funcional mas com gaps de segurança (IDOR em tracking), build (`Express 5` params), CI ausente, código morto, MSW drift no Docker, e UX inconsistente.

**Decisão:**

- **Sem novas features** — apenas qualidade, estabilidade e deploy readiness
- **Ownership obrigatório** em todas as mutations/reads de `JobTracking` por `userId`
- **`getRouteParam` helper** para `req.params` no Express 5
- **CI GitHub Actions** — frontend + backend + prisma validate; integration tests com Postgres
- **MSW test-only** — runtime e Docker com `NEXT_PUBLIC_ENABLE_MSW=false`
- **V2 desligado no boot** — `ENABLE_V2_FEATURES=false` (Scheduler, WebSocket)
- **E2E automatizado fora do RC1** — checklist manual MVP
- Tag lógica: `v1.0.0-rc1`

**Consequências:**

- Rotas `PATCH /pipeline/:id/*` permanecem deprecated (mutations via `/tracking/*`)
- Arquitetura híbrida (legado + Clean Architecture) documentada; refatoração incremental pós-RC1
- Etapa 16 = AI Match Engine enrichment

---

## ADR-027 — Job Aggregation Engine (Etapa 17)

**Status:** Aceito  
**Data:** 2026-07 (Etapa 17)

**Contexto:** O catálogo MVP dependia de seed estático (~400 vagas). Para evoluir o produto, vagas devem ser importadas de providers reais com normalização, deduplicação e histórico de execução.

**Decisão:**

- Novo módulo `job-aggregation` (Clean Architecture) como orquestrador único de providers
- **Gupy** com `search()` real; **LinkedIn** e **Programathor** com arquitetura completa + stub
- Tabelas `JobProviderRegistry`, `ProviderExecution`, `JobImport`; `Job.contentHash` para dedup
- Endpoints `GET/POST /providers/*` com auth + rate limit
- Scheduler interno opcional (`ENABLE_SCHEDULER`, `SYNC_INTERVAL`)
- Seed condicional (`SEED_CATALOG=false` em produção)
- Remoção de `blockedSkills` do onboarding e Match Engine

**Motivos:** Centralizar importação sem acoplar use cases a `fetch`/Prisma; permitir sync manual e automático; preparar novos providers.

**Consequências:**

- Runtime em produção depende de sync ou seed dev explícito
- LinkedIn/Programathor retornam `health: degraded` até implementação real (V2+)
- Etapa 18 = AI Career Intelligence

---

## ADR-028 — AI Career Intelligence (Etapa 18)

**Status:** Aceito  
**Data:** 2026-07 (Etapa 18)

**Contexto:** Usuários precisam de explicações e recomendações contextualizadas por vaga/tracking, sem substituir o Match Engine determinístico.

**Decisão:**

- Módulo `ai` com port `AIProviderPort` e `GeminiProvider`
- Match Score permanece `rules-v1`; IA produz `engineVersion: ai-career-v1` apenas na análise
- Cache `AIAnalysis` por `(trackingId, contentHash)` + `PROMPT_VERSION`
- Trigger manual — nunca auto-run em listagens
- `skillNames` mantido; `UserSkill` sincronizado em background

**Consequências:**

- App funcional sem `GEMINI_API_KEY` (503 `AI_NOT_CONFIGURED` no POST)
- Free Tier: rate limit + debounce em cache miss; meta >90% cache hit

---

## ADR-029 — Match Engine rules-v2 (Etapa 19)

**Status:** Aceito  
**Data:** 2026-07 (Etapa 19)

**Contexto:** O `rules-v1` priorizava skills (+15 cada) com área em apenas +5, sem penalidade. Vagas DevOps com React apareciam para perfis Frontend no dashboard e catálogo.

**Decisão:**

- **`rules-v2`** substitui `rules-v1` como `MATCH_ENGINE_VERSION`
- **`JobTitleNormalizer`** — inferência de área a partir do título com aliases estáticos
- **`SkillMatcher`** — aliases síncronos (ReactJS→React, etc.) no módulo match
- **Área-first** — `job.area` autoritativo; cap score ≤ 30 quando incompatível
- **Pré-filtro** no catálogo (sort=match) e dashboard quando `profile.area` definido
- IA continua explicando match; cache invalidado pela nova versão do engine

**Consequências:**

- Documentação em `docs/MATCH_ENGINE.md`
- Cursor Rule `.cursor/rules/match-engine.mdc`
- Frontend exibe `rules-v2` em badges de match

---

## ADR-030 — Product Polish & Realtime híbrido (Etapa 21)

**Status:** Aceito  
**Data:** 2026-07 (Etapa 21)

**Contexto:** Pós-MVP, elevar qualidade do produto: URLs confiáveis, vagas frescas, SEO, import por URL, notificações. Vercel serverless não suporta WebSocket persistente.

**Decisão:**

- **`sourceUrl`** permanece campo único; nunca reconstruir URLs de provider
- **Job freshness** — `expiresAt`, `lastCheckedAt`, `markStaleByProvider` no sync
- **Sort default `recent`** — publishedAt → match → priority
- **URL import** — módulo `job-import` com extractors por provider
- **Realtime híbrido** — Socket.IO em `server.ts` (local); **polling** React Query na Vercel
- **PWA/SEO** — manifest + metadata; sem service worker offline nesta etapa

**Consequências:**

- `docs/PROVIDERS.md`, `docs/WEBSOCKET.md`, `docs/PWA.md`, `docs/SEO.md`
- Cursor Rules: `job-url-persistence`, `job-freshness`, `job-sorting`, `url-import-normalization`

---

## ADR-031 — Resume Intelligence (Etapa 22)

**Status:** Aceito  
**Data:** 2026-07 (Etapa 22 — pós-MVP)

**Contexto:** Após conclusão do MVP (Etapas 1–21), o produto evolui para otimizar aderência do currículo às vagas desejadas. Upload de currículo estava explicitamente fora do MVP (ADR-020); passa a ser escopo pós-MVP.

**Decisão:**

- **Currículo Inteligente** (UI) / módulo `resume` (código) — perfil profissional estruturado, não arquivo bruto
- **Nunca alterar currículo automaticamente** — IA gera sugestões; usuário aceita, edita ou rejeita
- **Versionamento imutável** — toda alteração confirmada cria `ResumeVersion`
- **Cache-first Gemini** — hash `(resumeVersion + job + profile + promptVersion + model)` antes de chamar API
- **Match Engine `rules-v2`** permanece fonte do match score; IA interpreta gaps e ATS
- **Skills Catalog** — normalização via `SkillNormalizer`; slugs oficiais no JSON estruturado
- **Fronteira Etapa 18** — `/ai/career-analysis/:trackingId` inalterado; análise currículo×vaga via `/resume/analyze-job`
- Upload PDF/DOCX/TXT parse in-memory (sem R2 v1); persistir apenas JSON estruturado

**Motivos:**

- Ajuda usuário a priorizar vagas e acompanhar processos com currículo mais aderente
- Reutiliza AIProvider, Match Engine, job-import, Skills Catalog
- Transparência e controle do usuário sobre versão final

**Consequências:**

- `docs/RESUME_INTELLIGENCE.md`
- Cursor Rule `.cursor/rules/resume-intelligence.mdc`
- MVP_SCOPE atualizado — upload/análise de currículo em pós-MVP implementado
- UI: menu **Currículo Inteligente** em Minha Conta; rotas `/resume/*`

---

## ADR-032 — Career Calendar & Match background (Etapa 23 / v1.5)

**Status:** Aceito  
**Data:** 2026-07 (Etapa 23 — v1.5 Product Polish)

**Contexto:** Usuários precisam ver entrevistas em agenda e sincronizar com calendário externo. Processos no pipeline careciam de página de detalhe e match persistido. Análise IA on-demand (Etapa 18) exigia espera na criação do processo.

**Decisão:**

- **Módulo `calendar`** — `CalendarProviderPort`; `GoogleCalendarProvider` ativo; `OutlookCalendarProvider` stub V2+
- **OAuth calendário separado** — escopo `calendar.events`; tokens criptografados em `CalendarIntegration`; login Google não concede calendário
- **Sync entrevistas** — create/update em Google Calendar; `Interview.syncStatus` + `calendarEventId`
- **Career Calendar** — `/calendar`; eventos locais (entrevistas) + remotos (Google)
- **Process Detail** — `/pipeline/[trackingId]`; `PATCH /tracking/:id/process` para metadados (recrutador, feedback, links); estágio e vaga fora deste PATCH
- **Match imediato** — `rulesMatchScore` persistido na criação do tracking (`rules-v2`)
- **IA background** — `ProcessCreatedEvent` → `TrackingAnalysisBackgroundHandler`; cache-first (`refresh: false`); `aiAnalysisStatus` + realtime
- **URL merge** — `source-url-merge.utils` preserva URLs career-page Gupy; nunca reconstruir URLs

**Consequências:**

- `docs/CALENDAR.md`
- Cursor Rules: `calendar-provider`, `tracking-match-background`, `process-edit-boundaries`
- `job-url-persistence.mdc` reforçado
- Prisma: `CalendarIntegration`, campos processo/IA em `JobTracking`, calendar em `Interview`

---

## ADR-033 — Google Calendar `primary` + validação `events.list` (fix OAuth 500)

**Status:** Aceito  
**Data:** 2026-07

**Contexto:** Callback OAuth retornava HTTP 500 com `ACCESS_TOKEN_SCOPE_INSUFFICIENT` ao chamar `calendarList.list` com escopo apenas `calendar.events`.

**Decisão:**

- Usar `calendarId = "primary"` (API de events aceita com `calendar.events`)
- Validar conexão com `events.list` em vez de `calendarList.list`
- Escopos OAuth: `openid`, `email`, `profile`, `calendar.events` + `include_granted_scopes`
- Persistir `scope`, `lastSyncAt`, `lastError`, `accountEmail` em `CalendarIntegration`
- `CalendarTokenService` renova access token proativamente antes da expiração
- Erros de domínio (`CalendarScopeInsufficientError`, etc.) → 422 amigável, nunca 500 opaco

**Consequências:**

- `GET /calendar/debug` (dev), `POST /calendar/sync`
- Páginas `/terms` e `/privacy` para OAuth app verification

---

## Template para novas decisões

```markdown
## ADR-XXX — Título

**Status:** Proposto | Aceito | Substituído  
**Data:** YYYY-MM-DD

**Contexto:** ...

**Decisão:** ...

**Motivos:** ...

**Consequências:** ...
```
