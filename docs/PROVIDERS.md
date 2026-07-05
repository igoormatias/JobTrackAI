# JobTrack AI — Providers

Guia de integração com fontes de vagas (Job Aggregation + URL Import).

## Princípios

1. **Nunca reconstruir URLs** — persistir `sourceUrl` exatamente como recebida do provider.
2. **Dedup** — chave única `(source, externalId)` + `contentHash` para updates incrementais.
3. **Freshness** — `lastCheckedAt` em todo check; jobs ausentes no sync → `status: closed`.

## Providers

| Provider | Sync | URL Import | Status |
|----------|------|------------|--------|
| Gupy | Real (`gupy.provider.ts`) | Real (`gupy-url.extractor.ts`) | Produção |
| LinkedIn | Real (`linkedin.provider.ts` — guest API + HTML parser) | Stub (422) | Produção (sync) |
| Programathor | Stub | Stub (422) | Arquitetura pronta |

## Sync manual / site

```bash
POST /providers/run          # todos habilitados (auth + rate limit)
POST /providers/run/:provider  # um provider
```

**Pelo site (MVP — Vercel Hobby):**
- Dashboard → card **Sincronização de vagas** → botão **Sincronizar agora**
- Auto-sync enquanto logado: **Configurações → Atualização automática de vagas** (`jobRefreshFrequency`: `15m` | `30m` | `1h` | `2h` | `manual`)

**Local (processo longo):**
- `ENABLE_SCHEDULER=true` + `SYNC_INTERVAL` (ms) — ver [`server.ts`](../backend/src/server.ts)

Após sync:
- `markStaleByProvider` fecha vagas removidas pelo provider
- `JobSyncNotificationService` notifica usuários com tracking na vaga

## URLs Gupy

- **Portal:** `https://portal.gupy.io/job/{id}`
- **Página da empresa:** `https://{company}.gupy.io/jobs/{id}` (ex.: [afya.gupy.io/jobs/11299164](https://afya.gupy.io/jobs/11299164))
- Importação por URL persiste a **URL original** colada pelo usuário em `sourceUrl`
- API de detalhe: `employability-portal.gupy.io/api/v1/jobs/{id}`
- A API retorna `jobUrl` com URL da career page quando disponível (ex.: `{empresa}.gupy.io/job/...`) — persistir exatamente esse valor
- **Fallback:** se a API retorna 404 (vaga encerrada/arquivada), o extractor busca a página pública e extrai dados do JSON-LD `JobPosting` (`gupy-page.parser.ts`). O preview inclui aviso quando candidaturas estão encerradas.
- **Backfill:** `backend/scripts/backfill-gupy-source-urls.ts` atualiza vagas antigas com `portal.gupy.io` via re-fetch da API

## Env

- `ENABLE_PROVIDER_GUPY=true` (default)
- `ENABLE_PROVIDER_LINKEDIN=true` (default — guest API + HTML parser)
- `ENABLE_PROVIDER_PROGRAMATHOR=false` (default)
- `ENABLE_SCHEDULER=true` (local only — Vercel usa botão + auto-sync no site)
- `SYNC_INTERVAL=3600000` (ms — scheduler local)

Ver [ARCHITECTURE.md](./ARCHITECTURE.md) · [API_CONTRACT.md](./API_CONTRACT.md)
