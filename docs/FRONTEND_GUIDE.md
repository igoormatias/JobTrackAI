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

### Estados de engajamento

`engagementState` no tipo `Job` — feedback visual no card (badge + borda). Nunca calculado no componente.

### Testes

Colocados ao lado dos módulos (`*.test.ts(x)`). MSW ativo nos testes de service/hooks.

## Referências

- [ARCHITECTURE.md](./ARCHITECTURE.md)
- [DECISIONS.md](./DECISIONS.md)
- [ROADMAP.md](./ROADMAP.md)
- Assets visuais: [`assets/`](../assets/)
