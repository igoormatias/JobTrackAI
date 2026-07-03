# Production Audit — Local vs Vercel (Etapa 20)

Auditoria de diferenças entre ambiente local e produção Vercel. Cada item documenta **causa raiz**, **impacto** e **correção**.

---

## Infraestrutura e boot

| Aspecto | Local | Vercel | Causa raiz | Impacto | Correção |
|---------|-------|--------|------------|---------|----------|
| Logger | `pino-pretty` em dev | Preview pode não ser `NODE_ENV=production` | Transport worker não resolve `pino-pretty` no bundle serverless | HTTP 500 em todas as rotas | `VERCEL` desabilita pretty; JSON stdout |
| Entrypoint | `server.ts` (listen) | `app.ts` export | Scheduler/redis só em server.ts | Cold start mais leve | Manter `app.ts` sem side-effects |
| API mount | `/` | `/api/backend` | `VERCEL` env em `app.ts` | 404 se URL errada | `NEXT_PUBLIC_API_URL=/api/backend` |

---

## Environment

| Variável | Local | Produção | Correção |
|----------|-------|----------|----------|
| `DATABASE_URL` | Docker Postgres | Supabase pooler | Obrigatória com mensagem clara |
| `DIRECT_DATABASE_URL` | — | Migrations CLI | Opcional, documentada |
| `JWT_SECRET` | dev default | Obrigatória | Aliases `AUTH_SECRET` / `SESSION_SECRET` |
| `FRONTEND_URL` | localhost:3000 | Domínio Vercel | CORS + cookies; suporta lista separada por vírgula |
| `GOOGLE_CLIENT_*` | .env local | Vercel env | Obrigatórias em production |
| `NEXT_PUBLIC_API_URL` | localhost:3333 | `/api/backend` | Mesmo domínio + cookies |

---

## Auth e sessão

| Problema | Causa raiz | Impacto | Correção |
|----------|------------|---------|----------|
| Usuário “logado” com API 500 | Middleware Next só verifica cookie `jt_access` | Navegação autenticada com dados quebrados | AuthProvider + interceptor limpam sessão em 401/500 auth |
| Logout não funciona | Frontend só limpa em `onSuccess` | Estado local persiste se API falha | `onSettled` sempre limpa |
| `/auth/login` 500 | Google token inválido lança `Error` genérico | Login parece bug do servidor | `UnauthorizedError` (401) |
| `/auth/me` 500 | Token inválido deveria ser 401 | Confusão diagnóstico | Testes + `UnauthorizedError` |

---

## Database e health

| Problema | Causa raiz | Impacto | Correção |
|----------|------------|---------|----------|
| Health “ok” sem DB | Health estático | Deploy verde com banco down | `SELECT 1` via Prisma; 503 se falhar |
| Connection pool | `new PrismaClient()` por instância | Exhaustion serverless | Singleton global |

---

## Observabilidade

| Gap | Correção |
|-----|----------|
| Sem correlation ID | `request-logger.middleware.ts` |
| `console.log` residual | Remover; usar Pino |

---

## Checklist pós-deploy

1. `GET /api/backend/health` → 200, `checks.database.status: ok`
2. Login Google → cookies setados
3. `GET /api/backend/auth/me` → 200 ou 401
4. Logout → cookies limpos, redirect `/login`
5. Nenhum endpoint crítico retorna 500 por config
