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
