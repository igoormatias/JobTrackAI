# 🚀 JobTrack AI - Backend

> Backend do **Career Tracker** JobTrack AI — centraliza vagas, calcula match e suporta acompanhamento manual do pipeline.

O usuário **candidata-se na plataforma de origem**. O backend não substitui Gupy, LinkedIn ou Programathor.

**Documentação:** [PRODUCT_VISION.md](../docs/PRODUCT_VISION.md) · [MVP_SCOPE.md](../docs/MVP_SCOPE.md) · [API_CONTRACT.md](../docs/API_CONTRACT.md) · ADR-022

### Domínio oficial (Etapa 10.7)

Enums em `src/shared/domain/`:

- `JobPriority`, `JobVisibility`, `JobSource` (inclui `manual`), `TimelineEventType`

Campos planejados em `Job`: `priority`, `visibility`, `hiddenAt`. Em `Application`: `lastStageUpdatedAt`.

Endpoints documentados em `API_CONTRACT.md` — implementação na Etapa 12 (sem novas rotas nesta etapa).

---

# 📖 Sobre

O JobTrack AI backend centraliza a lógica de:

- Autenticação (Google OAuth)
- Perfil simplificado
- Listagem e engajamento com vagas (favoritar, prioridade, visibilidade, visualizar — **não aplicar**)
- Match Score
- Pipeline de **acompanhamento manual**
- Notificações internas

**Fora do MVP (V2):** providers reais, scheduler, Match Engine real, WebSocket, IA, analytics.

---

# 🛠 Stack

## Runtime

- Node.js 22+
- TypeScript

---

## Framework

- Express.js

---

## Banco de Dados

- PostgreSQL

---

## ORM

- Prisma ORM

---

## Autenticação

- Google OAuth
- JWT
- Refresh Token

---

## Comunicação

- REST API
- WebSocket (Socket.IO)

---

## Validação

- Zod

---

## Cache

- TanStack React Query no frontend (cache de dados de API)
- Rate limiting em memória no backend (`express-rate-limit`)

Redis não faz parte do MVP. Ver [docs/DECISIONS.md](../docs/DECISIONS.md).

---

## Scheduler

- Node Cron

Responsável por:

- Buscar novas vagas
- Atualizar fontes
- Limpeza de cache
- Tarefas agendadas

---

## Logs

- Pino

---

## Upload

- Cloudflare R2 (futuro)

---

## Segurança

- Helmet
- CORS
- Compression
- Rate Limit
- Cookie Parser

---

## Testes

### Unitários

- Vitest

### Integração

- Supertest

---

## Qualidade de Código

- ESLint
- Prettier
- Husky
- lint-staged

---

# 🏗 Arquitetura

O backend segue **Clean Architecture + DDD (lightweight) + SOLID**. Simplicidade primeiro — sem over-engineering.

Documentação oficial sincronizada com `backend/.cursor/rules/backend-architecture.mdc`.

## Camadas e dependências

```
Infrastructure  →  Application  →  Domain
```

| Camada | Responsabilidade | Exemplos |
|--------|------------------|----------|
| **Domain** | Entidades, Value Objects, regras, interfaces de repository, domain events | `SystemInfo`, `AppVersion`, `SystemInfoRepository` |
| **Application** | Use Cases, DTOs, mappers | `GetHealthUseCase`, `HealthResponseDto` |
| **Infrastructure** | HTTP, Prisma, implementações de repository | `SystemController`, `StaticSystemInfoRepository` |

**Regras:**
- Controllers nunca contêm regra de negócio
- Use Cases nunca usam Prisma diretamente
- Prisma somente em `infrastructure/repositories/`
- Validação exclusiva com Zod
- Nunca usar `any`

## Estrutura do projeto

```
src/
├── app.ts
├── server.ts
├── config/
├── database/              # Prisma client
├── middlewares/
├── routes/                # Registro central de rotas
├── modules/
│   ├── system/            # Template canônico (nova arquitetura)
│   ├── auth/              # Legado
│   ├── jobs/              # Legado
│   ├── pipeline/          # Legado
│   ├── profiles/          # Clean Architecture (Etapa 11)
│   ├── settings/          # Clean Architecture (Etapa 11)
│   └── recommendations/   # Legado
├── providers/             # Integrações externas (Gupy, LinkedIn, etc.)
├── shared/
│   ├── application/       # UseCase interface
│   ├── domain/            # DomainEvent base
│   ├── events/            # EventBus + InMemoryEventBus
│   └── errors/
└── utils/
```

## Estrutura de um módulo (novo padrão — obrigatório)

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
    repositories/      # implementações
  index.ts
```

**Template de referência:** `src/modules/system/`

## Módulo system (template canônico)

| Endpoint | Use Case | Descrição |
|----------|----------|-----------|
| `GET /health` | `GetHealthUseCase` | `{ status, uptime, version }` |
| `GET /version` | `GetVersionUseCase` | `{ version, name, environment }` |
| `GET /info` | `GetInfoUseCase` | Metadados da API e módulos |

Publica `SystemHealthChecked` via EventBus.

## Módulos legados (deprecated para novos)

Módulos existentes usam `controller → service → repository`. Permanecem funcionais até migração gradual (ADR-019).

```
modules/<feature>/
  controllers/
  services/        # equivalente a use-cases
  repositories/
  routes/
  schemas/
  dto/
  index.ts
```

## Fluxo de requisição

**Novo padrão:**

```
HTTP → Middlewares → Routes → Controller → Use Case → Repository → Response
```

**Legado:**

```
HTTP → Middlewares → Routes → Controller → Service → Repository → Response
```

## Fluxo de eventos

```
Use Case → eventBus.publish(DomainEvent) → Handlers inscritos
```

Implementação: `InMemoryEventBus` em `src/shared/events/`.

Exemplos futuros: `ApplicationCreated`, `PipelineStageChanged`, `InterviewScheduled`.

---

# 📘 Guias de desenvolvimento

## Como criar um novo módulo

1. Copiar estrutura de `src/modules/system/`
2. Definir entities, value objects e repository interface em `domain/`
3. Implementar use cases em `application/use-cases/`
4. Implementar repository em `infrastructure/repositories/`
5. Criar controller, routes e schemas em `infrastructure/http/`
6. Registrar em `src/routes/index.ts`
7. Adicionar testes unitários + integração
8. Atualizar docs se necessário

## Como criar um novo endpoint

1. Use Case em `application/use-cases/`
2. Método no Controller + schema Zod
3. Rota em `infrastructure/http/routes/`
4. Teste de integração

## Como criar um Domain Event

1. Estender `DomainEvent` em `domain/events/`
2. Publicar no Use Case via `eventBus.publish()`
3. Registrar handler no bootstrap do módulo (`routes/*.ts`)

## Como registrar eventos

```typescript
import { eventBus } from "../../shared/events/event-bus.js";

eventBus.subscribe("MeuEvento", async (event) => {
  // handler
});
```

Ver guia completo: [docs/BACKEND_GUIDE.md](../docs/BACKEND_GUIDE.md)

---

# 🔐 Autenticação

Login utilizando Google OAuth.

Fluxo:

```
Google

↓

Backend

↓

Validação

↓

JWT

↓

Refresh Token

↓

Frontend
```

---

# 👤 Usuário

Cada usuário possui:

- Perfil profissional
- Área de atuação
- Competências
- Senioridade
- Localização
- Pretensão salarial
- Preferências

Essas informações são utilizadas pelo Match Engine.

---

# 💼 Agregador de Vagas (V2)

Providers reais (Gupy, LinkedIn, Programathor) estão planejados para **V2**. No MVP, vagas vêm de MSW/fixtures no frontend.

Estrutura preparada em `src/providers/`:

```
providers/

gupy/

linkedin/

programathor/
```

Todos implementam a mesma interface.

```ts
interface JobProvider {
    fetchJobs(): Promise<Job[]>;
}
```

Assim novas fontes podem ser adicionadas facilmente.

---

# 🔄 Normalização

Cada plataforma possui um formato diferente.

Antes de salvar, todas as vagas passam por uma camada de normalização.

Resultado:

```
LinkedIn

↓

Normalizer

↓

Job

↓

Banco
```

A API sempre retorna o mesmo formato.

---

# 🎯 Match Engine

Um dos principais diferenciais do projeto.

Responsável por calcular automaticamente a compatibilidade entre o perfil do usuário e cada vaga.

O algoritmo considera:

- Área profissional
- Competências
- Tecnologias
- Senioridade
- Modalidade
- Localização
- Faixa salarial
- Requisitos obrigatórios

Resultado:

```
Job

↓

Parser

↓

Análise

↓

Score

↓

Banco
```

---

# 📋 Pipeline

Gerenciamento completo das candidaturas.

Status:

- Favorita
- Aplicada
- RH
- Entrevista
- Teste Técnico
- Gestor
- Cliente
- Oferta
- Reprovada

Cada alteração gera histórico.

---

# 🔔 Activity Center

Centraliza todas as atividades.

Exemplos:

- Novas vagas
- Mudança de status
- Pipeline
- Próximas entrevistas
- Atualizações futuras da IA

---

# ⚡ Atualização em Tempo Real

Utilizando WebSocket.

Quando novas vagas forem encontradas:

```
Worker

↓

Banco

↓

WebSocket

↓

Frontend

↓

Dashboard

↓

Lista

↓

Notificações
```

---

# ⏱ Atualização Automática

Cada usuário pode configurar a frequência.

Opções:

- Tempo real
- 5 minutos
- 15 minutos
- 30 minutos
- 1 hora
- Manual

---

# 🔍 Busca

A API suporta:

- Pesquisa textual
- Paginação
- Ordenação
- Filtros
- Busca por tecnologias
- Localização
- Modalidade
- Área profissional
- Senioridade
- Faixa salarial

---

# 📡 API REST

Principais recursos.

```
/auth

/users

/profile

/jobs

/companies

/applications

/pipeline

/dashboard

/notifications

/settings

/health
```

---

# 📊 Dashboard

Fornece métricas para o Frontend.

- Novas vagas
- Match Score
- Aplicações
- Pipeline
- Estatísticas
- Empresas
- Tecnologias

---

# 🔴 WebSocket

Eventos disponíveis.

```
jobs:new

jobs:update

pipeline:update

dashboard:update

notifications:new
```

---

# 🚀 Performance

Boas práticas implementadas.

- Paginação Cursor
- Índices no PostgreSQL
- Compressão Gzip
- Queries otimizadas
- DTOs
- Validação antes da persistência
- Rate Limiting (em memória)

---

# 🔒 Segurança

- JWT
- Refresh Token
- Helmet
- CORS
- Rate Limit
- Sanitização
- Validação com Zod
- Proteção contra SQL Injection (Prisma)
- Proteção contra XSS

---

# 🧪 Testes

## Unitários

- Services
- Helpers
- Match Engine
- Normalizers

---

## Integração

- Endpoints
- Autenticação
- Banco
- WebSocket

---

# 📦 Scripts

```bash
# instalar
npm install

# desenvolvimento
npm run dev

# build
npm run build

# produção
npm run start

# lint
npm run lint

# testes
npm run test

# cobertura
npm run test:coverage

# integração
npm run test:integration

# prisma
npm run prisma:generate
```

---

# 🐳 Docker (desenvolvimento)

O backend sobe via Docker Compose na raiz do monorepo:

```bash
# na raiz do repositório
npm run docker:up
```

- Porta: **3333**
- Health: `GET /health`
- `DATABASE_URL` no container aponta para o serviço `postgres`
- Migrations Prisma: executar manualmente (`docker compose exec backend npx prisma migrate dev`)

Documentação: [README.md](../README.md) e [docs/DEPLOY.md](../docs/DEPLOY.md).

---

# 🚀 Deploy

Produção via **Vercel Services** + **Supabase PostgreSQL**. Sem Docker em produção.

Detalhes: [docs/DEPLOY.md](../docs/DEPLOY.md).

---

# 🎯 Princípios

- SOLID
- Clean Code
- Clean Architecture
- Modularização
- Domain Driven Design (conceitos)
- Baixo acoplamento
- Alta coesão
- Escalabilidade
- Testabilidade

---

# 🗺 Roadmap

Sincronizado com [docs/ROADMAP.md](../docs/ROADMAP.md).

## MVP

- Auth, perfil simplificado, jobs (listagem/favoritos/prioridade/visibilidade), pipeline manual
- Match Score (MSW; engine real em **V2**)
- Cadastro manual de vagas (contrato — Etapa 12)
- Notificações internas, entrevistas (Etapas 12–13)
- **Não inclui:** providers reais, WebSocket, aplicar vagas pela API

### Próximas etapas

| Etapa | Nome |
|-------|------|
| 12 | Pipeline Refinado |
| 13 | Release Candidate MVP |

## V2

- Providers (Gupy, LinkedIn, Programathor), importação por URL
- Scheduler, WebSocket
- **Match Engine real**
- IA, Analytics, Machine Learning
- Internacionalização, integrações avançadas

---

## 🤖 v2 (legado — ver docs/ROADMAP.md)

- [ ] IA
- [ ] Resumo das vagas
- [ ] Insights
- [ ] Analytics
- [ ] Recomendações
- [ ] Comparação currículo × vaga

---

## 🚀 v3

- [ ] Push Notifications
- [ ] API pública
- [ ] Filas com BullMQ
- [ ] Workers distribuídos
- [ ] Integração com novas plataformas
- [ ] Machine Learning para Match Score

---

# 🚀 Deploy

Arquitetura sugerida:

- **API:** Vercel
- **Banco:** Vercel
- **Frontend:** Vercel

---

# 📄 Licença

MIT License

---

## ❤️ Desenvolvido com Node.js, Express, TypeScript e PostgreSQL.