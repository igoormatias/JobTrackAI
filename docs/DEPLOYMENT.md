# JobTrack AI — Deployment Guide (Vercel)

Guia completo para deploy em produção. Ver também [PRODUCTION_AUDIT.md](./PRODUCTION_AUDIT.md) e [DEPLOY.md](./DEPLOY.md).

---

## Arquitetura Vercel (monorepo)

[`vercel.json`](../vercel.json) define dois serviços:

| Serviço | Root | Rota |
|---------|------|------|
| Frontend | `frontend` | `/` |
| Backend | `backend` | `/api/backend` |

O backend detecta `process.env.VERCEL` e monta rotas em `/api/backend` ([`app.ts`](../backend/src/app.ts)).

O frontend deve usar:

```env
NEXT_PUBLIC_API_URL=/api/backend
```

Requisições usam `withCredentials: true` — **mesmo domínio** obrigatório para cookies.

---

## Variáveis de ambiente

### Backend (Vercel — serviço backend)

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `NODE_ENV` | Sim | `production` |
| `DATABASE_URL` | Sim | Supabase pooler (`?pgbouncer=true`) |
| `DIRECT_DATABASE_URL` | Migrations | Conexão direta para `prisma migrate deploy` |
| `JWT_SECRET` | Sim | Ou `AUTH_SECRET` / `SESSION_SECRET` (aliases) |
| `FRONTEND_URL` | Sim | URL do frontend (ex.: `https://app.vercel.app`) |
| `GOOGLE_CLIENT_ID` | Sim | OAuth Google |
| `GOOGLE_CLIENT_SECRET` | Sim | OAuth Google |
| `GEMINI_API_KEY` | Não | AI on-demand; sem key → 503 no POST |
| `LOG_LEVEL` | Não | Padrão `info` em production |
| `ENABLE_PROVIDER_GUPY` | Não | Default `true` |
| `ENABLE_PROVIDER_LINKEDIN` | Não | Default `true` |
| `ENABLE_PROVIDER_PROGRAMATHOR` | Não | Default `false` |
| `SYNC_INTERVAL` | Não | Scheduler local (ms); default `3600000` |

**Nunca** definir `LOG_PRETTY=true` na Vercel.

**Sync de providers em produção:** Dashboard → **Sincronizar agora**; auto-sync conforme `jobRefreshFrequency` nas Configurações (sem Vercel Cron no plano Hobby).

### Frontend (Vercel — serviço frontend)

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `NEXT_PUBLIC_API_URL` | Sim | `/api/backend` em produção |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Sim | Mesmo client ID do backend |
| `NEXT_PUBLIC_ENABLE_MSW` | Sim | `false` |

---

## Supabase + Prisma

1. Criar projeto Supabase.
2. `DATABASE_URL` = connection pooler **transaction** (porta **6543**, `?pgbouncer=true`).
3. `DIRECT_DATABASE_URL` = conexão para migrations (porta **5432**):
   - Preferido: `postgresql://postgres:PASSWORD@db.<project>.supabase.co:5432/postgres?sslmode=require`
   - Se `db.*` não for acessível (rede/Vercel): use o **session pooler** do Supabase (porta **5432** no host `aws-0-<region>.pooler.supabase.com`, usuário `postgres.<project>`).
4. Antes do deploy (ou automaticamente no `build` do backend na Vercel):

```bash
cd backend
pnpm exec prisma generate
pnpm exec prisma migrate deploy
```

**Obrigatório na Vercel (backend):** `DIRECT_DATABASE_URL` com host `db.<project>.supabase.co:5432` (não use o pooler 6543 para migrations). O script `build` já executa `prisma migrate deploy` — sem `DIRECT_DATABASE_URL` o deploy falha antes de ir ao ar.

**GitHub Actions:** workflow `deploy-migrations.yml` — configure secrets `DATABASE_URL` e `DIRECT_DATABASE_URL` no repositório.

---

## Google OAuth

1. Console Google Cloud → OAuth 2.0 Client ID.
2. Authorized JavaScript origins: `https://seu-dominio.vercel.app`
3. Authorized redirect URIs: conforme fluxo (login via ID token no frontend).
4. Mesmo `GOOGLE_CLIENT_ID` no backend e `NEXT_PUBLIC_GOOGLE_CLIENT_ID` no frontend.

---

## Health check

```bash
curl https://seu-dominio.vercel.app/api/backend/health
```

Resposta esperada:

```json
{
  "status": "ok",
  "checks": {
    "database": { "status": "ok", "latencyMs": 12 },
    "environment": { "status": "ok" },
    "ai": { "status": "skipped" }
  }
}
```

Se `database.status` = `error` → HTTP **503**.

---

## Auth e cookies

- Cookies: `jt_access`, `jt_refresh` (httpOnly, secure em production).
- Logout: `POST /api/backend/auth/logout` limpa cookies.
- `GET /api/backend/auth/me` → 200 ou **401** (nunca 500 por sessão ausente).

---

## Troubleshooting

| Sintoma | Causa | Solução |
|---------|-------|---------|
| 500 em todas as rotas | `pino-pretty` no serverless | Logger usa JSON quando `VERCEL=1` |
| 500 no login (`X-Forwarded-For` / trust proxy) | `express-rate-limit` sem `trust proxy` na Vercel | `app.set("trust proxy", 1)` quando `VERCEL=1` |
| Login ok, APIs falham | `NEXT_PUBLIC_API_URL` errada | Usar `/api/backend` |
| CORS error | `FRONTEND_URL` incorreto | Igualar ao domínio Vercel |
| Logout não limpa | API falha + frontend só `onSuccess` | Corrigido: `onSettled` limpa sempre |
| Health ok, dados falham | Pooler vs direct URL | Verificar `DATABASE_URL` |
| 500 login `table User does not exist` | Migrations não aplicadas no Supabase | `DIRECT_DATABASE_URL` + `pnpm exec prisma migrate deploy` |

---

## Checklist pré-production

- [ ] `NEXT_PUBLIC_ENABLE_MSW=false`
- [ ] `NEXT_PUBLIC_API_URL=/api/backend`
- [ ] `FRONTEND_URL` = URL real do frontend
- [ ] `DIRECT_DATABASE_URL` configurada (migrations no build)
- [ ] Migrations aplicadas (`prisma migrate deploy` — automático no build do backend)
- [ ] `GET /api/backend/health` → 200
- [ ] Login / logout / dashboard manual
