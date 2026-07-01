# JobTrack AI — Roadmap

Este documento acompanha as etapas do MVP e evoluções planejadas. Atualize sempre que uma etapa for concluída.

## Legenda

- ✅ Concluído
- 🚧 Em andamento
- ⬜ Pendente

---

## Infraestrutura e base

### ✅ Foundation

Estrutura inicial do monorepo, Next.js 15, Express, TypeScript, ESLint, Prettier e Husky.

### ✅ Design System

Componentes UI compartilhados (shadcn/ui, Tailwind v4), layout AppShell, tipografia e tokens visuais.

### ✅ Dev Environment + Docker (Etapa 07.5)

Docker Compose para desenvolvimento (frontend, backend, PostgreSQL 17), health checks, hot reload e documentação do monorepo.

---

## Frontend — features

### ✅ Mock API (MSW)

Handlers MSW com fixtures, paginação, factories e integração com React Query.

### ✅ Auth

Login Google (mock), rotas protegidas, middleware, sessão via contexto e cookies.

### ✅ Onboarding

Fluxo em 8 etapas, perfil profissional, validação Zod e persistência via MSW/backend stub.

### ✅ Smart Mock Engine (Etapa 06)

Match score determinístico, dashboard/notificações/jobs personalizados por perfil, engine em `features/recommendations`.

### ✅ Dashboard (Etapa 07)

Home com KPIs, insight, melhores vagas, entrevistas, timeline, empresas, tecnologias e gráfico Recharts.

### ✅ Jobs (Etapa 08)

Listagem completa de vagas com busca global, filtros avançados (URL via nuqs), ordenação, infinite scroll, JobCard reutilizável, favoritos e aplicar vaga.

### ⬜ Job Details

Página de detalhe com match score, reasons, missing skills e ações (favoritar, aplicar).

### ⬜ Pipeline

Kanban de candidaturas com drag and drop e histórico por estágio.

### ⬜ Profile

Edição do perfil profissional pós-onboarding.

### ⬜ Settings

Preferências do usuário e configurações da conta.

---

## Backend — integrações

### ⬜ Providers

Integração com fontes de vagas (Gupy, LinkedIn, Programathor).

### ⬜ Match Engine (real)

Substituir regras do Smart Mock Engine por algoritmo no backend (`/recommendations`).

### ⬜ WebSocket

Atualizações em tempo real (Socket.IO já preparado no backend).

### ⬜ Activity Center

Feed de atividades sincronizado com notificações e pipeline.

### ⬜ IA

Resumos de vagas, insights e recomendações com LLM (v2).

---

## Qualidade e entrega

### ⬜ Performance

Otimizações de bundle, cache, prefetch e métricas.

### ⬜ Testes

Cobertura E2E e integração ampliada.

### ⬜ Deploy

CI/CD completo, ambientes staging/production documentados em [DEPLOY.md](./DEPLOY.md).

---

## Manutenção

Ao concluir uma etapa:

1. Marque o status neste arquivo.
2. Atualize [ARCHITECTURE.md](./ARCHITECTURE.md) se a arquitetura mudar.
3. Registre decisões em [DECISIONS.md](./DECISIONS.md).
4. Sincronize os READMEs da raiz, frontend e backend.
