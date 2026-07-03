# 🚀 JobTrack AI

> **A modern career management platform that helps professionals find opportunities, organize applications and track their hiring journey.**

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=nextdotjs)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38BDF8?logo=tailwindcss)
![React Query](https://img.shields.io/badge/TanStack_Query-Latest-FF4154)
![License](https://img.shields.io/badge/license-MIT-success)

---

## 📖 Sobre o projeto

O **JobTrack AI** é um **Career Tracker inteligente** — centraliza vagas de múltiplas plataformas e ajuda o usuário a organizar sua jornada de busca por emprego.

O sistema **não substitui** as plataformas originais. O usuário candidata-se **diretamente na plataforma de origem** (Gupy, LinkedIn, Programathor, etc.).

Visão completa: [docs/PRODUCT_VISION.md](../docs/PRODUCT_VISION.md) · Escopo MVP: [docs/MVP_SCOPE.md](../docs/MVP_SCOPE.md) · Domínio: [docs/DECISIONS.md](../docs/DECISIONS.md) (ADR-022)

### Domínio oficial (Etapa 10.7)

Types compartilhados em `src/types/`:

| Conceito | Type | Valores |
|----------|------|---------|
| Prioridade | `JobPriority` | `HIGH` · `MEDIUM` · `LOW` |
| Visibilidade | `JobVisibility` | `VISIBLE` · `HIDDEN` |
| Origem | `JobSource` | inclui `manual` |
| Timeline | `TimelineEventType` | Ver `API_CONTRACT.md` |

Favoritos devem ter destaque visual (borda/badge/background — Design System). Contratos planejados em `features/jobs/types/job-contracts.types.ts` e `features/pipeline/types/pipeline-contracts.types.ts` (implementação Etapa 12).

O projeto foi pensado para atender profissionais de tecnologia como:

- 💻 Front-end
- ⚙️ Back-end
- 🌐 Full Stack
- 📱 Mobile
- 🧪 QA
- ☁️ DevOps
- 🎨 UX/UI
- 📋 Product Owner
- 📈 Product Manager
- 🔄 Scrum Master
- 👨‍💼 Tech Lead
- 📊 Data
- e diversas outras áreas.

---

# ✨ Funcionalidades

## 🔐 Autenticação

- Login com Google
- Perfil personalizado
- Rotas protegidas

---

## 👤 Onboarding Inteligente

Configuração inicial do perfil profissional.

- Área de atuação
- Competências
- Senioridade
- Modalidade
- Localização
- Pretensão salarial
- Tecnologias desejadas
- Tecnologias que deseja evitar

---

## 💼 Busca de vagas

Vagas centralizadas de múltiplas fontes (Gupy, LinkedIn, Programathor — providers reais em **V2**; MVP usa MSW/fixtures).

Cada vaga passa por normalização antes de ser exibida. Ação principal: **Abrir vaga** na plataforma original.

---

## 🎯 Match Score

Cada vaga recebe um score personalizado baseado no perfil do usuário.

O algoritmo considera:

- Competências
- Tecnologias
- Senioridade
- Modalidade
- Localização
- Pretensão salarial
- Requisitos obrigatórios

Exemplo:

95%

Excelente Match

✔ React

✔ Next.js

✔ TypeScript

✔ Remoto

✔ Pretensão compatível

---

## ⭐ Favoritos

Salvar vagas para visualizar posteriormente.

---

## 📋 Pipeline (acompanhamento manual)

Acompanhe sua jornada seletiva. O Pipeline **não representa a candidatura** — apenas o registro manual do que você fez na plataforma de origem.

Status disponíveis:

- Favoritas
- Aplicadas
- RH
- Entrevista
- Teste Técnico
- Gestor
- Cliente
- Oferta
- Reprovadas

Cada candidatura possui:

- Timeline
- Histórico
- Observações
- Próxima etapa

---

## 🔔 Notificações

Eventos **internos** do JobTrack AI:

- Novas vagas encontradas
- Mudança manual de status no pipeline
- Entrevista próxima
- Nova recomendação

Nunca controla candidatura externa.

---

## ⚡ Atualização em Tempo Real (V2)

WebSocket e sincronização automática estão planejados para **V2**. No MVP, dados são carregados via React Query com refresh manual ou revalidação.

---

## 🔄 Atualização configurável

O usuário poderá definir a frequência de atualização.

Opções:

- Tempo real
- 5 minutos
- 15 minutos
- 30 minutos
- 1 hora (Padrão)
- Manual

---

## 📊 Dashboard

Resumo completo da busca. Melhores vagas usam Match Engine `rules-v2` (área-first) via API de jobs.

**Etapa 19:** layout responsivo com `min-w-0` / `items-stretch`; busca com `searchDraft` local (sem perda de foco).

Indicadores:

- Novas vagas
- Matchs altos
- Favoritas
- Aplicações
- Pipeline
- Próximas entrevistas
- Empresas recorrentes
- Tecnologias mais encontradas

---

## 👤 Perfil (MVP)

Perfil simplificado:

- Nome e foto (Google OAuth — sem upload)
- Área profissional, senioridade, competências
- Modalidade preferida, localização, pretensão salarial

Campos completos: [docs/MVP_SCOPE.md](../docs/MVP_SCOPE.md#perfil-mvp)

---

## 📱 Mobile First

Todo o projeto é desenvolvido priorizando dispositivos móveis.

Desktop é uma evolução do layout mobile.

---

# 🛠 Stack

## Front-end

- Next.js 15
- React 19
- TypeScript

---

## UI

- Tailwind CSS v4
- shadcn/ui
- Lucide React
- Framer Motion

---

## Gerenciamento de Estado

- Zustand

Utilizado apenas para estado global.

---

## Data Fetching

- TanStack React Query

Responsável por:

- Cache
- Revalidação
- Paginação
- Infinite Scroll
- Prefetch
- Sincronização

---

## Formulários

- React Hook Form
- Zod

---

## Comunicação

- Axios
- WebSocket

---

## URL State

- nuqs

---

## Gráficos

- Recharts

---

## Feedbacks

- Sonner

---

## Utilitários

- clsx
- class-variance-authority
- tailwind-merge
- date-fns

---

## Testes

### Unitários

- Vitest
- React Testing Library

### Integração

- MSW

### E2E

- Playwright

---

## Qualidade de Código

- ESLint
- Prettier
- Husky
- lint-staged

---

# 📁 Arquitetura

A aplicação segue **Feature Based Architecture**.

```
src/

├── app/
├── components/
├── features/
│
│── auth/
│── dashboard/
│── jobs/
│── pipeline/
│── account/       # Minha Conta — Perfil + Preferências (Etapa 11)
│── resume/        # Currículo Inteligente (Etapa 22)
│── profile/       # hooks legados (useProfile)
│── notifications/
│── settings/      # hooks legados (useSettings)
│── shared/
│
├── hooks/
├── lib/
├── services/
├── stores/
├── types/
├── utils/
└── styles/
```

Cada Feature possui sua própria estrutura.

Exemplo:

```
jobs/

components/

hooks/

queries/

services/

schemas/

types/

utils/

constants/
```

---

# 🎨 Design

Inspirado em:

- Linear
- Vercel
- GitHub
- Stripe
- Notion

Características:

- Mobile First
- Dark Mode
- Componentes reutilizáveis
- Design System
- UX moderna
- Microinterações
- Alta performance

---

# ⚡ Performance

Boas práticas utilizadas.

- Server Components
- Client Components apenas quando necessário
- Lazy Loading
- Dynamic Imports
- Infinite Scroll
- Virtualização
- Debounce
- Memoização
- Cache inteligente
- Prefetch
- Code Splitting

---

# ♿ Acessibilidade

- Alto contraste
- Navegação por teclado
- Estados de foco
- Componentes acessíveis
- Responsividade
- Tipografia legível

---

# 🔄 Fluxo da aplicação

```
Usuário

↓

Login

↓

Onboarding

↓

Dashboard

↓

Busca de vagas

↓

Match Score

↓

Salvar vaga

↓

Abrir vaga (plataforma original)

↓

Aplicar na plataforma original

↓

Adicionar ao Pipeline (manual)

↓

Atualizar status (manual)
```

---

# 🔴 Atualização em Tempo Real

```
Workers

↓

Busca novas vagas

↓

Normalização

↓

Banco

↓

WebSocket

↓

Frontend

↓

React Query

↓

Dashboard atualizado

↓

Lista atualizada

↓

Activity Center

↓

Toast
```

---

# 🚀 Scripts

```bash
# instalar dependências
pnpm install

# desenvolvimento
pnpm dev

# build
pnpm build

# typecheck
pnpm typecheck

# lint
pnpm lint

# testes
pnpm test
```

---

# 🐳 Docker (desenvolvimento)

Na **raiz do monorepo**:

```bash
npm run docker:up
```

- Frontend: http://localhost:3000
- API local: `NEXT_PUBLIC_API_URL=http://localhost:3333`
- API produção Vercel: `NEXT_PUBLIC_API_URL=/api/backend`
- MSW ativo por padrão (`NEXT_PUBLIC_ENABLE_MSW=true`)
- Health: http://localhost:3000/api/health
- Hot reload via volumes montados

Referências visuais: [`../assets/`](../assets/).

Documentação: [README.md](../README.md) | [docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md) | [docs/FRONTEND_GUIDE.md](../docs/FRONTEND_GUIDE.md)

---

# 📁 Estrutura (features)

```
frontend/src/features/
├── auth/
├── dashboard/
├── jobs/
├── onboarding/
├── profile/
├── pipeline/
├── notifications/
├── recommendations/   # Smart Mock Engine
└── settings/
```

Serviços globais em `frontend/src/services/`. Mocks MSW em `frontend/src/mocks/`.

---

# 🎯 Princípios

- Mobile First
- Feature Based
- Componentização
- Escalabilidade
- Performance
- Clean Code
- SOLID
- DRY
- KISS
- Testabilidade
- UX Premium

---

# 🗺 Roadmap

## 🚀 MVP

### Infraestrutura

- [ ] Configuração do projeto
- [ ] CI/CD
- [ ] ESLint
- [ ] Prettier
- [ ] Husky
- [ ] Feature Based Architecture

### Autenticação

- [ ] Login Google
- [ ] Rotas protegidas

### Perfil

- [x] Onboarding
- [ ] Preferências do usuário

### Dashboard

- [x] KPIs
- [x] Cards
- [x] Atividades
- [x] Insight e gráficos

### Vagas

- [x] Match Score (MSW)
- [x] Listagem completa (Etapa 08)
- [x] Pesquisa global (nuqs + debounce)
- [x] Filtros avançados (URL)
- [x] Ordenação
- [x] Infinite scroll
- [x] Favoritos e abrir vaga (alvo; botão "Aplicar" = dívida técnica)
- [x] Detalhes (Etapa 09)

### Pipeline

- [x] Kanban
- [x] Drag and Drop
- [x] Timeline
- [x] Histórico

### Tempo Real (V2)

- [ ] WebSocket
- [ ] Activity Center em tempo real
- [ ] Atualização automática

### Testes

- [ ] Unitários
- [ ] Integração
- [ ] E2E

---

## 🤖 V2

- [ ] Providers reais (Gupy, LinkedIn, Programathor)
- [ ] Scheduler
- [ ] WebSocket / tempo real
- [ ] IA para resumo das vagas
- [ ] Analytics e Machine Learning
- [ ] Internacionalização (i18n)
- [ ] Integrações avançadas
- [ ] Upload de currículo
- [ ] Comparação currículo × vaga
- [ ] Perfil público, LinkedIn/GitHub/portfólio
- [ ] Calendário de entrevistas avançado

---

## 🚀 V3

- [ ] Push Notifications
- [ ] Aplicativo Mobile
- [ ] Dashboard avançado
- [ ] IA para preparação de entrevistas
- [ ] Recomendações de carreira
- [ ] Gamificação

---

# 🤝 Contribuição

Contribuições são sempre bem-vindas!

Caso queira sugerir melhorias, abra uma Issue ou envie um Pull Request.

---

# 📄 Licença

Este projeto está licenciado sob a licença MIT.

---

## 💙 Desenvolvido com Next.js, React, TypeScript e muito ☕