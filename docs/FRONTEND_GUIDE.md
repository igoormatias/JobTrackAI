# JobTrack AI — Frontend Guide

Guia da arquitetura frontend para features do monorepo.

## Estrutura padrão de feature

```
features/<nome>/
  components/    # UI pura
  hooks/         # React Query, nuqs, composição
  services/      # Chamadas HTTP (Axios)
  schemas/       # Zod (formulários/filtros)
  types/         # Tipos locais da feature
  utils/         # Helpers sem regra de negócio pesada
  constants/     # Labels, opções, layout
  widgets/       # Composição de seções da página
  pages/         # Entry points exportados
```

**Regra:** componentes não importam MSW nem Axios diretamente.

## Feature Jobs (Etapa 08)

### Fluxo de dados

```
JobsPage
  → JobsToolbarWidget (search + filtros)
  → JobsResultsWidget (header + lista)
    → JobCard (apresentação)
  → useJobFilters (nuqs + debounce)
  → useInfiniteJobs (React Query infinite)
  → useJobMutations (favorite / apply / view)
  → jobs-service
  → MSW handlers / backend GET|PATCH|POST|DELETE /jobs
```

### Organização dos componentes

| Componente | Responsabilidade |
|------------|------------------|
| `JobCard` | Card reutilizável (default + compact) |
| `JobsSearchBar` | Input de busca controlado |
| `JobsFilterBar` | Filtros desktop (inline) |
| `JobsFilterSheet` | Filtros mobile (`BottomSheet`) |
| `JobsFilterFields` | Campos compartilhados de filtro |
| `JobsSortSelect` | Ordenação |
| `JobsResultsHeader` | Contador + sort |
| `JobsList` | Infinite scroll + virtualização condicional |
| `JobsEmptyState` | Variantes de empty/error |
| `JobsToolbarWidget` | Search + filtros |
| `JobsResultsWidget` | Header + lista + estados |

### URL e filtros

- Parâmetro de busca: `?search=react` (debounce 300ms)
- Multi-select: `areas`, `companyIds`, `seniorities`, `modalities`, `skills`, `sources` (comma-separated)
- Ordenação: `sort` + `dir`
- Mapeamento centralizado em `features/jobs/utils/job-list-params.ts`

### Match score

Dados vindos do Smart Mock Engine (`getScoredJobs` no MSW). O `JobCard` apenas exibe `MatchScoreBadge` e `MatchReasonsList`.

## Feature Job Details (Etapa 09)

```
JobDetailsPage
  → JobDetailsMainWidget / JobDetailsSidebarWidget
  → useJobDetailsQuery + useJobMatchQuery + useRelatedJobsQuery + ...
  → useJobDetailsMutations (wrapper de useJobMutations)
  → job-details-service
  → MSW handlers / backend GET /jobs/:id/*
```

### Organização dos componentes

| Componente | Responsabilidade |
|------------|------------------|
| `JobMatchScoreCircle` | Match circular grande + label de compatibilidade |
| `JobWhyThisJobCard` | Reasons matched da vaga |
| `JobLearningGapsCard` | Gaps com badges de importância |
| `JobDescriptionCard` | Seções da descrição |
| `JobInsightsCard` | Insights gerados no servidor |
| `JobPipelineTimeline` | Timeline do pipeline (quando há candidatura) |
| `JobRelatedJobsSection` | Até 5 `JobCard` compact |
| `JobDetailsBottomActions` | Barra fixa mobile (salvar + candidatar) |
| `JobDetailsSidebarWidget` | Match, insights, empresa, related, timeline (desktop) |

### Queries paralelas

Cada seção consome seu endpoint dedicado via React Query. Hooks secundários usam `enabled` após o job principal carregar.

### Match score na detail page

Na rota `/jobs/[id]`, o score vem de `GET /jobs/:id/match` via `JobMatchScoreCircle`. Nunca calculado no componente.

## Feature Pipeline (Etapa 10)

```
PipelinePage
  → PipelineKpisWidget / PipelineToolbarWidget / PipelineBoardWidget
  → usePipelineQuery + usePipelineFilters + mutations (move/favorite/delete)
  → pipeline-service
  → backend GET|PATCH|DELETE /pipeline/*
```

### Organização

| Componente | Responsabilidade |
|------------|------------------|
| `PipelineKanbanBoard` | DnD entre colunas (`@dnd-kit`) |
| `PipelineApplicationCard` | Card com match, ações rápidas |
| `PipelineColumnNav` | Navegação por coluna no mobile |
| `PipelineDetailDrawer` / `PipelineDetailPanel` | Detalhe sem sair do pipeline |
| `PipelineApplicationTimeline` | Histórico da candidatura |

### Optimistic updates

`useMoveApplicationMutation` atualiza cache local e faz rollback em erro.

### Testes

MSW handlers espelham backend; usados no Vitest (`pipeline.handlers.test.ts`). Testes de componentes/hooks ao lado dos módulos.

## Referências

- [ARCHITECTURE.md](./ARCHITECTURE.md)
- [DECISIONS.md](./DECISIONS.md)
- [ROADMAP.md](./ROADMAP.md)
- Assets visuais: [`assets/`](../assets/)
