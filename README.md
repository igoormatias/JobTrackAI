# JobTrack AI

Plataforma **Career Tracker** para centralizar vagas de múltiplas fontes e organizar a jornada de busca por emprego.

## Visão do produto

JobTrack AI centraliza vagas provenientes de diferentes plataformas (Gupy, LinkedIn, Programathor e futuras integrações) e ajuda o usuário a organizar sua busca por emprego.

O sistema **não substitui** as plataformas originais. O usuário continua realizando sua candidatura **diretamente na plataforma de origem**.

Detalhes: [docs/PRODUCT_VISION.md](docs/PRODUCT_VISION.md)

## O que o sistema faz

- Centraliza, busca e filtra vagas de múltiplas fontes
- Permite favoritar, priorizar e ocultar vagas
- Abre vagas na plataforma original (nunca candidatura interna)
- Cadastro manual de vagas com mesmo fluxo das importadas
- Calcula Match Score personalizado (Match Engine `rules-v2` no backend)
- Dashboard com visão da busca
- Pipeline manual para acompanhar a jornada seletiva
- **Process Detail (v1.5)** — página dedicada por processo no pipeline
- Timeline automática de eventos
- Gestão de entrevistas no contexto do pipeline
- **Career Calendar (v1.5)** — agenda unificada + sync Google Calendar
- Notificações sobre eventos internos
- Perfil simplificado (Google + dados profissionais)

## O que o sistema NÃO faz

- Não aplica vagas pela plataforma JobTrack AI
- Não aplica vagas pela plataforma (candidatura na origem)
- **Currículo Inteligente (Etapa 22):** upload, editor, análise × vaga, sugestões com confirmação
- Não oferece perfil público, rede social ou ATS
- Não integra LinkedIn/GitHub/portfólio no perfil (V2)
- Não busca vagas em tempo real via providers reais no MVP (V2)

Lista completa: [docs/MVP_SCOPE.md](docs/MVP_SCOPE.md)

## Fluxo do usuário

```
Encontrou vaga → Favoritou → Definiu prioridade → Abriu vaga (origem)
  → Aplicou na plataforma original → Adicionou ao Pipeline → Atualizou estágio manualmente
```

## Escopo do MVP

| Incluído | Excluído (V2+) |
|----------|----------------|
| Jobs, filtros, favoritos, prioridade, ocultar, abrir vaga | Aplicar pela plataforma |
| Cadastro manual de vagas, pipeline, timeline | Providers reais, Match Engine real |
| Dashboard, Match Score (MSW) | WebSocket, Scheduler |
| Notificações internas, entrevistas | IA, Analytics, ML |
| Perfil simplificado | Upload currículo, perfil público, i18n |

## Roadmap

| Etapa | Nome | Status |
|-------|------|--------|
| 10.7 | Product Refinement (domínio oficial) | Concluída |
| 11 | Minha Conta | Concluída |
| 12 | Pipeline & Job Tracking | Concluída |
| 13 | MVP Stabilization | Concluída |
| 15 | AI Match Engine | Concluída |
| 21 | Product Polish & UX | Concluída |
| 22 | Currículo Inteligente (v1.4) | Concluída |
| 23 | Career Calendar & Polish (v1.5) | Concluída |
| XX | Google Calendar OAuth fix + Login v2 + Legal/SEO | Concluída |

- **V2** — Outlook calendar, providers avançados, Analytics, ML, i18n

Ver [docs/ROADMAP.md](docs/ROADMAP.md)

## Arquitetura

```
Browser
   │
   ▼
Frontend (Next.js :3000) ──► React Query ──► API REST (Express)
   │
   ▼
Backend (Express :3333) ──► Prisma ──► PostgreSQL
```

Detalhes: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

### Backend

Clean Architecture + DDD (lightweight) para novos módulos. Template: módulo `system`.

- [docs/BACKEND_GUIDE.md](docs/BACKEND_GUIDE.md)
- [backend/README.md](backend/README.md)
- ADR-019 (arquitetura) · ADR-020 (escopo produto) · ADR-022 (domínio refinado)

## Estrutura do projeto

```
/
├── frontend/          # Next.js 15, React 19, MSW, features
├── backend/           # Express 5, Prisma, módulos REST
├── assets/            # Prints de referência UI
├── docs/              # Documentação oficial
├── docker/            # Dockerfiles (somente desenvolvimento)
├── .cursor/rules/     # Cursor Rules (incl. escopo MVP)
├── package.json       # Scripts do monorepo
├── docker-compose.yml
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
- Health: http://localhost:3333/health

Com `NEXT_PUBLIC_ENABLE_MSW=false` (padrão), o frontend consome a API Express + Prisma. MSW é usado apenas em testes (ADR-024).

## Como utilizar Docker (desenvolvimento)

```bash
npm install
npm run docker:up
```

| Serviço    | URL |
|------------|-----|
| Frontend   | http://localhost:3000 |
| Backend    | http://localhost:3333 |
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

**Prisma:** migrations não rodam automaticamente. Referência: [.env.docker.example](.env.docker.example).

## Fluxo de desenvolvimento

1. Onboarding define o perfil do usuário.
2. O Match Engine (`rules-v2`) calcula compatibilidade no backend com dados reais — área e cargo têm peso dominante sobre tecnologias isoladas.
3. Alterações em `frontend/src` e `backend/src` refletem com hot reload.
4. Valide novas features contra [docs/MVP_SCOPE.md](docs/MVP_SCOPE.md).
5. Atualize [docs/ROADMAP.md](docs/ROADMAP.md) ao concluir etapas.

## Scripts do monorepo

```bash
npm run build      # build frontend + backend
npm run lint       # lint em ambos
npm run test       # testes em ambos
```

Scripts específicos: [frontend/README.md](frontend/README.md) · [backend/README.md](backend/README.md)

## Deploy

Produção: **Vercel** (frontend + backend monorepo) + **Supabase PostgreSQL**.

- Guia completo: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)
- Auditoria: [docs/PRODUCTION_AUDIT.md](docs/PRODUCTION_AUDIT.md)
- `NEXT_PUBLIC_API_URL=/api/backend` em produção

Guia: [docs/DEPLOY.md](docs/DEPLOY.md)

## Documentação

| Documento | Conteúdo |
|-----------|----------|
| [docs/PRODUCT_VISION.md](docs/PRODUCT_VISION.md) | Visão e princípios do produto |
| [docs/MVP_SCOPE.md](docs/MVP_SCOPE.md) | Escopo in/out do MVP |
| [docs/API_CONTRACT.md](docs/API_CONTRACT.md) | Contrato REST oficial |
| [docs/ROADMAP.md](docs/ROADMAP.md) | MVP e V2 |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Arquitetura técnica |
| [docs/DESIGN_GUIDELINES.md](docs/DESIGN_GUIDELINES.md) | Identidade visual e login |
| [docs/CALENDAR.md](docs/CALENDAR.md) | Google Calendar OAuth, sync e troubleshooting |
| [docs/FRONTEND_GUIDE.md](docs/FRONTEND_GUIDE.md) | Guia frontend |
| [docs/BACKEND_GUIDE.md](docs/BACKEND_GUIDE.md) | Guia backend |
| [docs/DECISIONS.md](docs/DECISIONS.md) | ADRs (ADR-020 = escopo · ADR-022 = domínio) |
| [docs/DEPLOY.md](docs/DEPLOY.md) | Deploy |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Guia completo Vercel + env vars |

## Licença

MIT
