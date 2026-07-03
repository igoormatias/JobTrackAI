# UX Audit — Etapa 19

Auditoria do frontend e match engine antes da estabilização. Cada item documenta **causa raiz**, **impacto** e **solução adotada**.

---

## Match Engine (backend)

| Componente | Causa raiz | Impacto | Solução |
|------------|------------|---------|---------|
| `match-engine.service.ts` rules-v1 | Skill +15 cada; área +5; sem penalidade de área incompatível | DevOps com React aparece para perfil Frontend | `rules-v2`: área/cargo dominam; gate cap ≤30 |
| `MatchJobInput` | Sem campo `title` | Título não influencia match | Adicionar `title`; `JobTitleNormalizer` |
| Skills no match | Comparação por `includes` em texto bruto | ReactJS ≠ React | `SkillMatcher` com aliases síncronos |
| `prisma-dashboard.repository.ts` | Ranqueia 80 vagas sem pré-filtro de área | Insight e atividades com vagas irrelevantes | `isAreaCompatible` antes do score |

---

## Shell e layout global

| Componente | Causa raiz | Impacto | Solução |
|------------|------------|---------|---------|
| `AppShell.tsx` | Coluna principal sem `min-w-0` | Filhos flex podem estourar largura em mobile | `min-w-0` no wrapper `flex-1` |
| `Container.tsx` | OK (`w-full`) | — | Manter; garantir filhos com `min-w-0` |

---

## Dashboard

| Componente | Causa raiz | Impacto | Solução |
|------------|------------|---------|---------|
| `dashboard-layout.ts` grid | Células sem `items-stretch` | Alturas inconsistentes top jobs vs entrevistas | `items-stretch` no grid |
| `DashboardTopJobsSection` | `h-full` sem pai stretch | Card menor que vizinho | Pai com stretch + `h-full min-h-0` |
| `DashboardInterviewsCard` | `h-fit` vs `h-full` do vizinho | Desalinhamento visual na linha | `h-full` + stretch |
| `DashboardKpiGrid` | Grid 2 colunas em mobile | OK com gap | `min-w-0` nos cards KPI |
| `DashboardCompaniesCard` / `DashboardTechnologiesCard` | Listas sem truncate | Texto longo quebra layout | `truncate` + `min-w-0` |
| `DashboardActivityTimeline` | Itens sem `min-w-0` | Overflow em mobile | `min-w-0 truncate` nas linhas |
| Melhores vagas | Match v1 no catálogo | Vagas incompatíveis no top 5 | `rules-v2` via API jobs |

---

## Jobs / JobCard

| Componente | Causa raiz | Impacto | Solução |
|------------|------------|---------|---------|
| `JobCard.tsx` | `MatchScoreBadge` sem `shrink-0`; botões sem `w-full` mobile | Badge comprime título; botões saem da tela | `shrink-0` no badge; `w-full sm:w-auto` nos botões |
| `JobCard.tsx` metadata | Linha salário/fonte sem truncate | Overflow horizontal | `truncate` na linha secundária |
| Campo de pesquisa | URL controlava input diretamente (nuqs) | Perda de foco ao digitar | `searchDraft` local + debounce (Etapa 19 reforço) |
| `JobsFilterBar` | `onOpenAllFilters` opcional sem wire | Botão morto em desktop | Wirear `JobsFilterSheet` no `JobsPage` |

---

## Job Details

| Componente | Causa raiz | Impacto | Solução |
|------------|------------|---------|---------|
| `JobWhyThisJobCard` | Reasons genéricos do v1 | Pouca explicação útil | Labels enriquecidos no backend v2 |
| Related jobs | Profile sem version key | Score desatualizado após perfil | `profileVersion` no query key (já feito) |

---

## Pipeline

| Componente | Causa raiz | Impacto | Solução |
|------------|------------|---------|---------|
| Kanban board | Scroll horizontal nativo | Esperado no board | `scrollbar-app` (Etapa anterior) |
| `PipelineApplicationCard` | — | Favorito OK | Sem alteração nesta etapa |

---

## Profile / Onboarding / Auth

| Página | Causa raiz | Impacto | Solução |
|--------|------------|---------|---------|
| Formulários | Inputs full width OK | — | Validar `max-w-full` em grids |
| Onboarding steps | Grid multi-col em mobile | Campos estreitos | `grid-cols-1 sm:grid-cols-2` onde necessário |

---

## Páginas validadas

- [x] Dashboard — grid, KPIs, top jobs, entrevistas, timeline, empresas, tecnologias
- [x] Jobs — lista, filtros, JobCard, busca
- [x] Job Details — sidebar, why this job, related
- [x] Pipeline — board, cards
- [x] Profile / Onboarding / Login

Viewport alvo: Desktop (≥1280px), Notebook (1024px), Tablet (768px), Mobile (375px).
