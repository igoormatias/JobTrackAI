# 🚀 JobTrack AI - Backend

> Backend responsável por toda a inteligência da plataforma JobTrack AI.

O backend foi desenvolvido seguindo princípios de arquitetura limpa, escalabilidade e alta performance, sendo responsável por autenticação, gerenciamento de usuários, agregação de vagas, cálculo de compatibilidade (Match Score), pipeline de candidaturas, atualizações em tempo real e integrações com múltiplas fontes de vagas.

---

# 📖 Sobre

O JobTrack AI não é apenas uma API de vagas.

Ele centraliza toda a lógica de negócio da plataforma, permitindo:

- Buscar vagas em múltiplas fontes
- Normalizar diferentes formatos de dados
- Calcular Match Score personalizado
- Gerenciar candidaturas
- Atualizar usuários em tempo real
- Servir como Backend for Frontend (BFF)

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

O projeto segue arquitetura modular baseada em Domínio.

```
src/

├── app/
│
├── config/
│
├── database/
│
├── modules/
│
│── auth/
│── users/
│── profiles/
│── jobs/
│── companies/
│── applications/
│── pipeline/
│── notifications/
│── websocket/
│── scheduler/
│── health/
│
├── providers/
│
│── gupy/
│── linkedin/
│── programathor/
│
├── shared/
│
├── middlewares/
│
├── utils/
│
└── server.ts
```

Cada módulo é completamente isolado.

---

# 📦 Estrutura de um módulo

```
jobs/

controllers/

routes/

services/

repositories/

schemas/

dto/

entities/

types/

utils/

constants/
```

Cada módulo contém todas as responsabilidades daquele domínio.

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

# 💼 Agregador de Vagas

O sistema suporta múltiplas fontes.

Cada integração é completamente desacoplada.

Exemplo:

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

## 🚀 MVP

### Infraestrutura

- [ ] Configuração do projeto
- [ ] Express + TypeScript
- [ ] Prisma
- [ ] PostgreSQL
- [ ] ESLint
- [ ] Prettier
- [ ] Husky

### Autenticação

- [ ] Google OAuth
- [ ] JWT
- [ ] Refresh Token

### Usuário

- [ ] Perfil
- [ ] Preferências

### Vagas

- [ ] Integração Gupy
- [ ] Integração LinkedIn
- [ ] Integração Programathor
- [ ] Normalização

### Match

- [ ] Match Engine
- [ ] Score

### Dashboard

- [ ] Estatísticas

### Pipeline

- [ ] CRUD
- [ ] Histórico

### Tempo Real

- [ ] WebSocket
- [ ] Activity Center

### Testes

- [ ] Unitários
- [ ] Integração

---

## 🤖 v2

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