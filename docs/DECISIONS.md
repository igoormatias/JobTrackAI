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

- Etapa 14 = Release Candidate (E2E, CI/CD, deploy)
- Etapa 15 = AI Match Engine (enriquecimento sobre contrato V1)
- `docs/IMPLEMENTATION_STATUS.md` e `CHANGELOG.md` como fonte de status
- Cursor Rule `.cursor/rules/msw-test-only.mdc`

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
