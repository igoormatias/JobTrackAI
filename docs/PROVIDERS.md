# Job Providers — Job Aggregation Engine

Documentação do pipeline de importação de vagas (Etapa 17).

## Visão geral

O **Job Aggregation Engine** orquestra providers externos, normaliza vagas para um contrato canônico, deduplica e persiste no catálogo Prisma (`Job` com `isCatalog=true`).

```
POST /providers/run  ─┐
ENABLE_SCHEDULER     ─┼─► JobAggregationService ─► Provider ─► normalize ─► validate ─► dedup ─► JobCatalogRepository
POST /providers/run/:provider ─┘
```

## Providers

| Provider | Status | `search()` | `health()` |
|----------|--------|------------|------------|
| `gupy` | **Real** | API pública Gupy com paginação | Probe da API |
| `linkedin` | Stub | `NotImplementedError` | `degraded` |
| `programathor` | Stub | `NotImplementedError` | `degraded` |

## Normalização

Saída canônica `NormalizedJob`:

`title, company, description, technologies[], seniority, modality, location, salaryMin/Max, sourceUrl, provider, publishedAt, contentHash, externalId`

- **Gupy:** `name→title`, `careerPageName→company`, `workplaceType→modality`, `city/state→location`, `jobUrl→sourceUrl`
- **contentHash:** SHA-256 de `normalize(title)|company|sourceUrl|publishedAt`

## Deduplicação

Ordem (configurável via env no futuro):

1. `source + externalId` (unique DB) → **update**
2. `contentHash` → **skip**
3. `normalized sourceUrl` → **skip**

## Variáveis de ambiente

| Variável | Default | Descrição |
|----------|---------|-----------|
| `ENABLE_SCHEDULER` | `false` | Liga sync automático |
| `SYNC_INTERVAL` | `3600000` | Intervalo em ms |
| `ENABLE_PROVIDER_GUPY` | `true` | Habilita Gupy no registry |
| `ENABLE_PROVIDER_LINKEDIN` | `false` | LinkedIn stub |
| `ENABLE_PROVIDER_PROGRAMATHOR` | `false` | Programathor stub |
| `SEED_CATALOG` | `false` | Seed ~400 vagas (apenas dev) |

## API

Rotas em `/providers` (auth obrigatório):

- `GET /providers` — lista providers
- `GET /providers/statistics` — totais e execuções recentes
- `GET /providers/history` — histórico paginado
- `GET /providers/health` — health check
- `POST /providers/run` — executa todos habilitados (rate limit)
- `POST /providers/run/:provider` — executa um provider

## Como adicionar um provider

1. Implementar `JobProvider` em `backend/src/providers/<name>/`
2. Registrar em `provider-registry.ts`
3. Inserir em `JobProviderRegistry` (migration/seed)
4. Adicionar flag `ENABLE_PROVIDER_<NAME>` em `env.ts`
5. Testes unitários de `normalize()` e `search()` (mock fetch)

## Regras

- Use cases **nunca** importam `fetch` ou Prisma diretamente
- Sempre normalizar antes de persistir
- Nunca persistir payload raw do provider
- Catálogo em runtime vem de imports; seed é fallback dev (`SEED_CATALOG=true`)
