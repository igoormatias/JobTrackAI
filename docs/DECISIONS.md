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

**Status:** Aceito (Etapa 08)

**Decisão:** Estados de vaga (`new`, `viewed`, `favorited`, `applied`, `rejected`) são derivados no MSW/backend e retornados no objeto `Job`.

**Motivos:** Componentes permanecem apresentacionais; regras centralizadas para futura API real.

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
