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

O **JobTrack AI** é uma plataforma moderna para gerenciamento de carreira.

Mais do que um simples agregador de vagas, o objetivo é permitir que qualquer profissional acompanhe toda sua jornada de contratação em um único lugar.

A plataforma busca vagas em múltiplas fontes, calcula automaticamente o nível de compatibilidade entre o perfil do usuário e cada oportunidade e oferece um pipeline completo para acompanhar candidaturas.

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

Integração com múltiplas fontes.

Exemplos:

- Gupy
- LinkedIn
- Programathor
- (Novas fontes futuramente)

Cada vaga passa por um processo de normalização antes de ser exibida.

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

## 📋 Pipeline de Candidaturas

Gerencie todo o processo seletivo.

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

## 🔔 Activity Center

Central de atividades da aplicação.

Exemplos:

- Novas vagas
- Mudança no pipeline
- Novas recomendações
- Próximas entrevistas
- Atualizações futuras da IA

---

## ⚡ Atualização em Tempo Real

Utilizando WebSocket.

Enquanto a plataforma estiver aberta:

- Novas vagas aparecem automaticamente
- Dashboard é atualizado
- Lista de vagas é sincronizada
- Notificações são exibidas
- Contadores são atualizados

Sem necessidade de atualizar a página.

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

Resumo completo da busca.

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

## 👤 Perfil

Gerenciamento do perfil profissional.

- Competências
- Área
- Senioridade
- Localização
- Pretensão salarial
- Preferências

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
│── profile/
│── notifications/
│── settings/
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

Aplicar

↓

Pipeline

↓

Entrevistas

↓

Oferta
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
- API: `NEXT_PUBLIC_API_URL=http://localhost:3333`
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
- [x] Favoritos e aplicar
- [x] Detalhes (Etapa 09)

### Pipeline

- [ ] Kanban
- [ ] Drag and Drop
- [ ] Timeline
- [ ] Histórico

### Tempo Real

- [ ] WebSocket
- [ ] Activity Center
- [ ] Toasts
- [ ] Atualização automática

### Testes

- [ ] Unitários
- [ ] Integração
- [ ] E2E

---

## 🤖 v2

- [ ] IA para resumo das vagas
- [ ] Comparação currículo x vaga
- [ ] Recomendações inteligentes
- [ ] Insights personalizados
- [ ] Analytics
- [ ] Calendário de entrevistas

---

## 🚀 v3

- [ ] Push Notifications
- [ ] Aplicativo Mobile
- [ ] Integrações
- [ ] Dashboard avançado
- [ ] IA para preparação de entrevistas
- [ ] Recomendações de carreira
- [ ] Gamificação
- [ ] Marketplace de currículos

---

# 🤝 Contribuição

Contribuições são sempre bem-vindas!

Caso queira sugerir melhorias, abra uma Issue ou envie um Pull Request.

---

# 📄 Licença

Este projeto está licenciado sob a licença MIT.

---

## 💙 Desenvolvido com Next.js, React, TypeScript e muito ☕