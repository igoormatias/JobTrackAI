# Relatório — Refatoração Explorar Vagas

Data: 2026-07-08

## Problemas corrigidos

| Problema | Causa | Solução |
|----------|-------|---------|
| Contagem incorreta (`meta.total` ≠ itens) | `count` SQL + filtro JS (`filterJobsForProfile`, `matchMin`) | Um único `buildCatalogWhere` para `count` e `findMany`; sem filtragem reduzida em JS |
| Filtros não-determinísticos | `strictProfileMatch` auto + busca híbrida ignorando filtros | Curadoria vira filtro SQL de área; `matchMin`/`strictProfileMatch` removidos da listagem |
| "Iniciar processo" sempre visível | `JobCard` ignorava tracking; `discovery` = `"new"` | DTO com `isTracked`/`stage`; botão oculto quando rastreada; link "Ver processo" |
| Texto vertical no empty state | `overflow-wrap:anywhere` + flex colapsado | `break-words`, `w-full`/`min-w` na cadeia de layout |
| Descrição colada (Gupy/LinkedIn) | HTML bruto no sync/import | `sanitizeJobHtml` + `normalizeGluedDescription` no Gupy bulk e LinkedIn |
| Match incoerente (59% com tudo compatível) | Skills 45pts sem reason de lacuna | `reason_skills_gap` no match-engine |

## Arquivos alterados (principais)

### Backend
- `job-catalog/infrastructure/query-builders/catalog-where.builder.ts` — filtros + busca textual no SQL
- `job-catalog/infrastructure/query-builders/filters-applied.builder.ts` — **novo** `meta.filtersApplied`
- `job-catalog/infrastructure/repositories/prisma-job-catalog.repository.ts` — count/data unificados; sort match em janela 300
- `job-catalog/application/use-cases/catalog-jobs.use-cases.ts` — curadoria por área; strip `matchMin`/`strictProfileMatch`
- `jobs/infrastructure/mappers/job.mapper.ts` — `isTracked`, `stage`, `getEngagementState` corrigido
- `jobs/types/job.types.ts` — contrato estendido
- `match/domain/services/match-engine.service.ts` — `reason_skills_gap`
- `shared/domain/match-weights.ts` — threshold dashboard **70%**
- `dashboard/infrastructure/repositories/prisma-dashboard.repository.ts` — pool 500; filtro área incompatível
- `providers/gupy/gupy.provider.ts` — sanitização HTML no bulk
- `providers/linkedin/linkedin.provider.ts` — sanitização HTML no import/normalize

### Frontend
- `components/feedback/EmptyState/EmptyState.tsx` — layout sem texto vertical
- `features/jobs/components/JobsPage/JobsPage.tsx` — `w-full`
- `features/jobs/widgets/JobsResultsWidget/JobsResultsWidget.tsx` — `w-full`
- `features/jobs/utils/job-list-params.ts` — sem `strictProfileMatch`; `countActiveJobFilters`
- `features/jobs/hooks/use-job-filters/use-job-filters.ts` — `activeFilterCount`
- `features/jobs/components/JobsFilterBar/JobsFilterSheet.tsx` — badge de filtros ativos
- `features/jobs/components/JobCard/JobCard.tsx` — título 2 linhas, senioridade, pipeline-aware
- `features/jobs/components/JobsEmptyState/JobsEmptyState.tsx` — CTAs Limpar + Explorar
- `features/dashboard/*` — threshold UI **70%**
- `types/job.ts`, `types/api.ts` — DTOs sincronizados

## Testes

### Backend (vitest)
- `match-weights.test.ts` — threshold 70
- `dashboard-top-jobs-threshold.test.ts` — threshold 70
- `catalog-where.builder.test.ts` — filtros SQL
- `catalog-jobs.use-cases.test.ts` — curadoria + strip matchMin
- `job.mapper.test.ts` — `discovery` ≠ `"new"`

### Frontend (vitest)
- `JobCard.test.tsx` — estados rastreado/não rastreado
- `EmptyState.test.tsx` — sem quebra vertical
- `job-list-params.test.ts` — params sem strictProfileMatch; contagem de filtros

Comando: `pnpm exec vitest run` nos pacotes `backend` e `frontend` (testes listados acima).

## Performance

- Paginação `recent` = cursor SQL puro (`publishedAt desc, id desc`)
- Ordenação `match` = janela limitada (300 candidatos do mesmo `where`), sem varredura total
- Dashboard: pool ampliado para 500 vagas recentes antes do threshold 70%

## Pendências conhecidas (V2+)

- Busca híbrida com ranking title>empresa>tecnologias>descrição foi simplificada para ILIKE no `where` SQL; reintroduzir ranking ponderado pode ser feito em V2 com `tsvector`/full-text
- `matchMin`/`strictProfileMatch` permanecem no schema de query por compatibilidade, mas são ignorados na listagem
- Providers LinkedIn/Programathor fetch real permanecem V2+

## Critérios de aceite

- [x] Contagem exata (`count` = mesmo `where` que `data`)
- [x] Filtros centralizados em SQL
- [x] Curadoria por área (chip visível, removível via `areas`)
- [x] Match como score/ordenação; threshold só no Dashboard (70%)
- [x] Pipeline-aware no card
- [x] Empty state sem texto vertical
- [x] Descrição sanitizada (Gupy + LinkedIn)
