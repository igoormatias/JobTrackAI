# JobTrack AI — Roadmap

Este documento acompanha as etapas do MVP e evoluções planejadas (V2). Atualize sempre que uma etapa for concluída.

**Visão do produto:** [PRODUCT_VISION.md](./PRODUCT_VISION.md)  
**Escopo MVP:** [MVP_SCOPE.md](./MVP_SCOPE.md)

## Legenda

- ✅ Concluído
- 🚧 Em andamento
- ⬜ Pendente

---

## MVP

Objetivo: Career Tracker — centralizar vagas, ajudar a encontrar oportunidades e acompanhar manualmente a jornada seletiva. O usuário **candidata-se sempre na plataforma de origem**.

### Infraestrutura e base

#### ✅ Foundation

Estrutura inicial do monorepo, Next.js 15, Express, TypeScript, ESLint, Prettier e Husky.

#### ✅ Design System

Componentes UI compartilhados (shadcn/ui, Tailwind v4), layout AppShell, tipografia e tokens visuais.

#### ✅ Dev Environment + Docker (Etapa 07.5)

Docker Compose para desenvolvimento (frontend, backend, PostgreSQL 17), health checks, hot reload e documentação do monorepo.

#### ✅ Product Alignment (Etapa 10.6)

Visão do produto, escopo MVP consolidado, documentação sincronizada, Cursor Rules de escopo, ADR-020.

### Frontend — features MVP

#### ✅ Mock API (MSW)

Handlers MSW com fixtures, paginação, factories e integração com React Query.

#### ✅ Auth

Login Google (mock), rotas protegidas, middleware, sessão via contexto e cookies.

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

#### ⬜ Profile (edição pós-onboarding)

Edição do perfil simplificado após onboarding (campos MVP em [MVP_SCOPE.md](./MVP_SCOPE.md)).

#### ⬜ Notificações

Feed de notificações internas (nova vaga, mudança de status, entrevista, recomendação).

#### ⬜ Entrevistas

Gestão de entrevistas no contexto do pipeline.

### Backend — MVP

#### ✅ Arquitetura oficial (Etapa 10.5)

Clean Architecture + módulo `system` template, EventBus, Cursor Rules.

#### ⬜ Match Engine (real)

Substituir regras do Smart Mock Engine por algoritmo no backend (`/recommendations`).

### Qualidade e entrega MVP

#### ⬜ Performance

Otimizações de bundle, cache, prefetch e métricas.

#### ⬜ Testes

Cobertura E2E e integração ampliada.

#### ⬜ Deploy

CI/CD completo, ambientes staging/production documentados em [DEPLOY.md](./DEPLOY.md).

### Alinhamento de código pendente

Dívida documentada em [MVP_SCOPE.md](./MVP_SCOPE.md#dívida-técnica-documentada-alinhamento-futuro):

- [ ] Botão "Aplicar" → **Abrir vaga** (`JobCard`, Job Details)
- [ ] Deprecar `POST /jobs/:id/apply` no código
- [ ] Remover ou mover etapa `blockedSkills` do onboarding
- [ ] Alinhar `engagementState: applied` com fluxo manual do pipeline

---

## V2

Funcionalidades **fora do MVP**. Não implementar antes de concluir o escopo MVP.

### Integrações e infraestrutura

- ⬜ **Providers** — integração real com Gupy, LinkedIn, Programathor
- ⬜ **Scheduler** — busca automática e atualização de vagas
- ⬜ **WebSocket** — atualizações em tempo real (Socket.IO preparado)
- ⬜ **Integrações avançadas** — novas fontes e normalização em produção

### Inteligência e dados

- ⬜ **IA** — resumos de vagas, insights com LLM
- ⬜ **Analytics** — métricas de uso e conversão
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
