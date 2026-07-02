# JobTrack AI — Arquitetura

Visão geral da arquitetura do monorepo JobTrack AI.

## Monorepo

```
/
├── frontend/     # Next.js 15 + React 19
├── backend/      # Express 5 + TypeScript
├── assets/       # Referências visuais (prints UI)
├── docs/         # Documentação técnica
├── docker/       # Dockerfiles de desenvolvimento
└── docker-compose.yml
```

## Frontend

- **Framework:** Next.js 15 (App Router), React 19, TypeScript
- **Estilo:** Tailwind CSS v4, shadcn/ui, Lucide, Framer Motion
- **Estado servidor:** TanStack React Query (cache, revalidação, invalidação)
- **Estado global:** Zustand (apenas UI/global leve)
- **Formulários:** React Hook Form + Zod
- **Mock (dev):** MSW (Smart Mock Engine personalizado por perfil)

### Feature-based architecture

Cada domínio em `frontend/src/features/<nome>/`:

```
components/  hooks/  pages/  services/  types/  utils/  constants/  queries/  schemas/
```

Regra: componentes **não** calculam regra de negócio nem importam MSW/Axios diretamente.

### Fluxo de dados (frontend)

```
Componente → Hook → Service → React Query → API (MSW ou backend real)
```

No MVP com `NEXT_PUBLIC_ENABLE_MSW=true`, o MSW intercepta requisições e aplica o Smart Mock Engine (`features/recommendations`).

### Feature Jobs (Etapa 08)

```
JobsPage → JobsToolbarWidget / JobsResultsWidget → Hooks → jobs-service → MSW ou backend
```

- **Filtros na URL:** `nuqs` (`?search=react`, arrays comma-separated)
- **Listagem:** `useInfiniteQuery` com cursor pagination
- **Match score:** exibido no `JobCard`; calculado no MSW/backend, nunca no componente
- **Estados de engajamento:** `engagementState` (`new`, `viewed`, `favorited`, `applied`, `rejected`) computado no servidor
- **Mutations:** favoritar, aplicar, marcar visualizada via React Query

### Feature Job Details (Etapa 09)

```
JobDetailsPage → MainWidget / SidebarWidget → Hooks paralelos → job-details-service → MSW ou backend
```

- **Endpoints paralelos:** `GET /jobs/:id`, `/match`, `/related`, `/timeline`, `/insights`, `/learning-gaps`
- **Match na detail page:** apenas via `/match` (não recalculado na UI)
- **Layout:** coluna única no mobile com bottom actions; grid `1fr + 360px` com sidebar sticky no desktop
- **Mutations:** reutiliza `useJobMutations` (favoritar, aplicar, marcar visualizada)

### Feature Pipeline (Etapa 10)

```
PipelinePage → KPIs / Toolbar / Board widgets → hooks → pipeline-service → backend /pipeline/*
```

- **Contrato público:** `GET /pipeline`, `PATCH /pipeline/:id/status|favorite`, `DELETE /pipeline/:id`, `GET /pipeline/:id/timeline`
- **DnD:** `@dnd-kit` com optimistic update e rollback
- **Detalhe:** drawer mobile + side panel desktop (sem navegar para `/jobs/[id]`)
- **Backend:** fonte de verdade in-memory; MSW espelhado para testes Vitest

Ver [FRONTEND_GUIDE.md](./FRONTEND_GUIDE.md) e [BACKEND_GUIDE.md](./BACKEND_GUIDE.md).

## Backend

- **Runtime:** Node.js 22+
- **Framework:** Express 5
- **ORM:** Prisma (PostgreSQL)
- **Validação:** Zod
- **Arquitetura:** Clean Architecture + DDD (lightweight) — padrão oficial para novos módulos
- **Módulos legados:** `auth`, `profiles`, `jobs`, `pipeline`, `recommendations` (controller → service → repository)
- **Módulo template:** `system` (`/health`, `/version`, `/info`)
- **Eventos:** `EventBus` com `InMemoryEventBus` em `src/shared/events/`
- **Providers:** Gupy, LinkedIn, Programathor
- **Tempo real:** Socket.IO (preparado, não exposto no MVP)
- **Rate limit:** `express-rate-limit` em memória (sem Redis no MVP)

### Arquitetura em camadas (novos módulos)

```
Infrastructure  →  Application  →  Domain
     ↓                  ↓              ↓
 HTTP/Prisma       Use Cases      Entities
 Controllers        DTOs           Value Objects
 Routes             Mappers        Repository interfaces
 Schemas                           Domain Events
```

Dependências sempre apontam para dentro. Domain nunca importa Application nem Infrastructure.

### Estrutura de módulo (padrão oficial)

```
modules/<module>/
  domain/
    entities/
    repositories/      # interfaces (ports)
    value-objects/
    events/
  application/
    use-cases/
    dto/
    mappers/
  infrastructure/
    http/
      controllers/
      routes/
      schemas/
    repositories/      # implementações (Prisma, in-memory)
  index.ts
```

Template canônico: `backend/src/modules/system/`

### Fluxo de requisição (novo padrão)

```
HTTP → Middlewares → Routes → Controller → Use Case → Repository (interface)
                                                      ↓
                                            Repository impl (Prisma/in-memory)
```

### Fluxo de eventos

```
Use Case → eventBus.publish(DomainEvent) → Handlers inscritos (InMemoryEventBus)
```

Exemplo: `GetHealthUseCase` publica `SystemHealthChecked`.

### Legado vs novo

| Aspecto | Legado | Novo (obrigatório) |
|---------|--------|---------------------|
| Orquestração | `services/` | `application/use-cases/` |
| Persistência | `repositories/` (classe concreta) | interface em `domain/`, impl em `infrastructure/` |
| HTTP | `controllers/` + `routes/` | `infrastructure/http/` |
| Prisma | preparado, in-memory hoje | somente em `infrastructure/repositories/` |
| Eventos | acoplamento direto | `EventBus` |

Módulos legados permanecem até migração gradual (ver ADR-019).

### Fluxo de requisição (legado)

```
HTTP → Middlewares (CORS, helmet, rate limit) → Routes → Controller → Service → Repository
```

## Comunicação Frontend ↔ Backend

| Ambiente | Frontend | Backend | Dados |
|----------|----------|---------|-------|
| Dev (MSW) | `:3000` | opcional `:3333` | Fixtures + engine |
| Dev (Docker) | `:3000` | `:3333` | Postgres + API real parcial |
| Produção | Vercel | Vercel Services | Supabase PostgreSQL |

Variável chave: `NEXT_PUBLIC_API_URL` (sempre acessível pelo browser, ex.: `http://localhost:3333`).

## Banco de dados

- **Desenvolvimento (Docker):** PostgreSQL 17 via `docker-compose`
- **Produção:** Supabase PostgreSQL
- **Prisma:** schema em `backend/prisma/schema.prisma`; migrations executadas manualmente pelo desenvolvedor

## Autenticação (alvo)

- Google OAuth
- JWT + Refresh Token
- Sessão via **cookies HttpOnly** (não localStorage)
- CORS com `credentials: true`

## O que não faz parte do MVP

- **Redis** — removido da stack documentada; cache no cliente via React Query
- Docker de produção — deploy via Vercel + Vercel Services

## Referências visuais

Prints oficiais em [`assets/`](../assets/) (`jobtracker-desktop.png`, `jobtracker-mobile.png`).

## Documentos relacionados

- [ROADMAP.md](./ROADMAP.md)
- [DECISIONS.md](./DECISIONS.md)
- [DEPLOY.md](./DEPLOY.md)
