# JobTrack AI — Frontend Guide

Guia da arquitetura frontend para features do monorepo.

**Escopo MVP:** [MVP_SCOPE.md](./MVP_SCOPE.md) · **Visão:** [PRODUCT_VISION.md](./PRODUCT_VISION.md)

## Escopo MVP (frontend)

Toda nova feature deve ajudar o usuário a **encontrar vagas** ou **acompanhar seu processo seletivo**. Caso contrário, documentar em V2 e não implementar.

- **Abrir vaga** — botão oficial redireciona para `sourceUrl` (plataforma original)
- **Pipeline** — acompanhamento manual; DnD atualiza status pelo usuário
- **Notificações** — apenas eventos internos do JobTrack AI
- **Perfil** — campos MVP em [MVP_SCOPE.md](./MVP_SCOPE.md#perfil-mvp); foto via Google OAuth

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
  → useJobMutations (favorite / view / openJob)
  → jobs-service
  → MSW handlers / backend GET|PATCH|POST /jobs
```

### Ações MVP em vagas

| Ação | Implementação alvo |
|------|-------------------|
| Favoritar | `PATCH /jobs/:id/favorite` |
| Marcar visualizada | `POST /jobs/:id/view` |
| Abrir vaga | `window.open(job.sourceUrl)` — plataforma original |

`POST /jobs/:id/apply` é **legado/deprecated** — fora do escopo MVP.

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

### Ações na detail page

- **Favoritar** e **marcar visualizada** — mutations existentes
- **Abrir vaga** — ação primária no mobile (`JobDetailsBottomActions`); redireciona para plataforma original

### Organização dos componentes

| Componente | Responsabilidade |
|------------|------------------|
| `JobMatchScoreCircle` | Match circular grande + label de compatibilidade |
| `JobWhyThisJobCard` | Reasons matched da vaga |
| `JobLearningGapsCard` | Gaps com badges de importância |
| `JobDescriptionCard` | Seções da descrição |
| `JobInsightsCard` | Insights gerados no servidor |
| `JobPipelineTimeline` | Timeline do pipeline (quando há entrada) |
| `JobRelatedJobsSection` | Até 5 `JobCard` compact |
| `JobDetailsBottomActions` | Barra fixa mobile (salvar + **abrir vaga**) |
| `JobDetailsSidebarWidget` | Match, insights, empresa, related, timeline (desktop) |

### Queries paralelas

Cada seção consome seu endpoint dedicado via React Query. Hooks secundários usam `enabled` após o job principal carregar.

## Feature Pipeline (Etapa 10)

```
PipelinePage
  → PipelineKpisWidget / PipelineToolbarWidget / PipelineBoardWidget
  → usePipelineQuery + usePipelineFilters + mutations (move/favorite/delete)
  → pipeline-service
  → backend GET|PATCH|DELETE /pipeline/*
```

O Pipeline **não representa candidatura** — o usuário adiciona entradas e atualiza status manualmente após aplicar na plataforma original.

### Fluxo do usuário

```
Favoritou → Abriu vaga → Aplicou na origem → Adicionou ao Pipeline → Atualizou status (DnD)
```

### Organização

| Componente | Responsabilidade |
|------------|------------------|
| `PipelineKanbanBoard` | DnD entre colunas (`@dnd-kit`) |
| `PipelineApplicationCard` | Card com match, ações rápidas |
| `PipelineColumnNav` | Navegação por coluna no mobile |
| `PipelineDetailDrawer` / `PipelineDetailPanel` | Detalhe sem sair do pipeline |
| `PipelineApplicationTimeline` | Histórico da jornada |

### Optimistic updates

`useMoveApplicationMutation` atualiza cache local e faz rollback em erro.

## Notificações

Eventos **internos** apenas: nova vaga, mudança de status, entrevista próxima, recomendação. Nunca controlar candidatura externa.

## Minha Conta (`features/account`)

Feature unificada para Perfil e Preferências (Etapa 11). Rotas: `/profile`, `/settings`.

```
features/account/
  components/profile/   ProfileForm, ProfileReadOnlyFields
  components/settings/  SettingsForm
  hooks/                useAccountProfile, useAccountSettings
  schemas/              account-profile.schema, account-settings.schema
  pages/                ProfilePage, SettingsPage
```

- Hooks legados em `features/profile` e `features/settings` permanecem para React Query (`useProfile`, `useSettings`)
- `ThemeProvider` suporta `dark | light | system` — sincronizado com `PATCH /settings`
- Navegação: grupo colapsável **Minha Conta** na sidebar; mobile: link **Conta** → `/profile`
- Formulários: React Hook Form + Zod; barra de alterações não salvas

### Perfil (campos MVP)

Read-only (Google): nome, e-mail, foto. Editáveis: área, senioridade, competências (MultiSelect por área), modalidade, localização, faixa salarial.

### Preferências (campos MVP)

Tema, atualização automática de vagas, intervalo de notificações internas no dashboard, toggles de vagas compatíveis e exibição de salário.

---

MSW handlers espelham backend; usados no Vitest. Testes de componentes/hooks ao lado dos módulos.

## Referências

- [PRODUCT_VISION.md](./PRODUCT_VISION.md)
- [MVP_SCOPE.md](./MVP_SCOPE.md)
- [API_CONTRACT.md](./API_CONTRACT.md)
- [ARCHITECTURE.md](./ARCHITECTURE.md)
- [DECISIONS.md](./DECISIONS.md) — ADR-020, ADR-021
- [ROADMAP.md](./ROADMAP.md)
- Assets visuais: [`assets/`](../assets/)
