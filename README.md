# JobTrack AI

Plataforma moderna de acompanhamento de carreira — monorepo com frontend Next.js, backend Express e PostgreSQL.

## Arquitetura

```
Browser
   │
   ▼
Frontend (Next.js :3000) ──► React Query ──► MSW (dev) ou API REST
   │
   ▼
Backend (Express :3333) ──► Prisma ──► PostgreSQL
```

Detalhes em [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Arquitetura do Backend

O backend segue **Clean Architecture + DDD (lightweight)** para novos módulos:

```
HTTP → Controller → Use Case → Repository (interface) → Prisma / in-memory
                              ↓
                         EventBus (Domain Events)
```

- **Organização:** `domain/` → `application/` → `infrastructure/` por módulo
- **Template oficial:** módulo `system` (`GET /health`, `/version`, `/info`)
- **Módulos legados** (`auth`, `jobs`, `pipeline`, etc.) usam `service/` até migração gradual
- **EventBus:** `InMemoryEventBus` para desacoplar ações importantes

Guias completos:

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — visão geral
- [docs/BACKEND_GUIDE.md](docs/BACKEND_GUIDE.md) — como criar módulos, endpoints e use cases
- [backend/README.md](backend/README.md) — referência do backend
- [docs/DECISIONS.md](docs/DECISIONS.md) — ADR-019 (migração evolutiva)

## Estrutura do projeto

```
/
├── frontend/          # Next.js 15, React 19, MSW, features
├── backend/           # Express 5, Prisma, módulos REST
├── assets/            # Prints de referência UI
├── docs/              # ROADMAP, ARCHITECTURE, DECISIONS, DEPLOY
├── docker/            # Dockerfiles (somente desenvolvimento)
├── .github/
├── package.json       # Scripts do monorepo
├── docker-compose.yml
├── vercel.json
└── README.md
```

## Pré-requisitos

- Node.js 22+
- [pnpm](https://pnpm.io/) (frontend)
- npm (backend)
- Docker Desktop (opcional, recomendado)

## Como executar localmente (sem Docker)

### 1. Variáveis de ambiente

```bash
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
```

### 2. Instalar dependências

```bash
pnpm --dir frontend install
npm --prefix backend install
```

### 3. PostgreSQL local

Configure `DATABASE_URL` em `backend/.env` (PostgreSQL na porta 5432).

### 4. Subir apps

```bash
npm run dev:local
```

- Frontend: http://localhost:3000
- Backend: http://localhost:3333
- Health backend: http://localhost:3333/health

Com `NEXT_PUBLIC_ENABLE_MSW=true`, o frontend usa mocks sem depender do backend para a maioria das telas.

## Como utilizar Docker (desenvolvimento)

```bash
# Na raiz do repositório
npm install          # scripts do monorepo (concurrently)
npm run docker:up    # ou: docker compose up -d
```

| Serviço    | URL |
|------------|-----|
| Frontend   | http://localhost:3000 |
| Backend    | http://localhost:3333 |
| Health FE  | http://localhost:3000/api/health |
| Health BE  | http://localhost:3333/health |
| Version BE | http://localhost:3333/version |
| Info BE    | http://localhost:3333/info |
| PostgreSQL | `postgres:5432` (rede interna Docker) |

### Scripts Docker

| Script | Descrição |
|--------|-----------|
| `npm run dev` | `docker compose up` (foreground) |
| `npm run docker:up` | Sobe em background |
| `npm run docker:down` | Para containers |
| `npm run docker:logs` | Logs em tempo real |
| `npm run docker:restart` | Reinicia serviços |

Volume persistente: `jobtrack_postgres_data`.

**Prisma:** migrations não rodam automaticamente. Quando houver models:

```bash
docker compose exec backend npx prisma migrate dev
```

Referência de variáveis: [.env.docker.example](.env.docker.example).

## Fluxo de desenvolvimento

1. Onboarding define o perfil do usuário.
2. Com MSW ativo, o Smart Mock Engine personaliza jobs, dashboard e notificações.
3. Alterações em `frontend/src` e `backend/src` refletem com hot reload (local ou Docker).
4. Atualize [docs/ROADMAP.md](docs/ROADMAP.md) ao concluir etapas.

## Scripts do monorepo

```bash
npm run build      # build frontend + backend
npm run lint       # lint em ambos
npm run test       # testes em ambos
```

Scripts específicos: ver [frontend/README.md](frontend/README.md) e [backend/README.md](backend/README.md).

## Deploy

Produção: **Vercel** (frontend) + **Vercel Services** (backend) + **Supabase PostgreSQL**.

Guia completo: [docs/DEPLOY.md](docs/DEPLOY.md).

## Documentação

| Documento | Conteúdo |
|-----------|----------|
| [docs/ROADMAP.md](docs/ROADMAP.md) | Etapas do projeto |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Arquitetura técnica |
| [docs/BACKEND_GUIDE.md](docs/BACKEND_GUIDE.md) | Guia do backend (Clean Architecture) |
| [docs/DECISIONS.md](docs/DECISIONS.md) | Decisões (ADR) |
| [docs/DEPLOY.md](docs/DEPLOY.md) | Deploy |

## Licença

MIT
