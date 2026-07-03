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
| LinkedIn | Stub | Stub (422) | Arquitetura pronta |
| Programathor | Stub | Stub (422) | Arquitetura pronta |

## Sync manual / scheduler

```bash
POST /providers/run          # todos habilitados
POST /providers/:name/run    # um provider
```

Após sync:
- `markStaleByProvider` fecha vagas removidas pelo provider
- `JobSyncNotificationService` notifica usuários com tracking na vaga

## URLs Gupy

- API retorna `jobUrl` — usar diretamente como `sourceUrl`
- Seed dev: IDs numéricos (`10001+`), nunca `gupy_job_XXXX`
- Portal: `https://portal.gupy.io/job/{numericId}`

## Env

- `ENABLE_PROVIDER_GUPY=true`
- `ENABLE_SCHEDULER=true` (local only — Vercel usa sync manual)

Ver [ARCHITECTURE.md](./ARCHITECTURE.md) · [API_CONTRACT.md](./API_CONTRACT.md)
