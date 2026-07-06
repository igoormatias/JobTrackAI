# JobTrack AI — Contrato de API (MVP)

Contrato REST oficial alinhado ao escopo do MVP. Ver [MVP_SCOPE.md](./MVP_SCOPE.md) para regras de produto. Domínio oficial: [DECISIONS.md](./DECISIONS.md) — ADR-022.

**Base URL (dev):** `http://localhost:3333`

**Autenticação:** cookies HttpOnly (`credentials: include` no frontend).

---

## Convenções

| Item | Padrão |
|------|--------|
| Formato | JSON |
| Erros | `{ message, code?, details? }` via `errorMiddleware` |
| Paginação jobs | cursor-based (`cursor`, `limit`) |
| Filtros jobs | query params (ver `job-list-params`) |
| Validação | Zod nos controllers |

---

## Domínio — enums oficiais

| Enum | Valores |
|------|---------|
| `JobPriority` | `HIGH` · `MEDIUM` · `LOW` |
| `JobVisibility` | `VISIBLE` · `HIDDEN` |
| `JobSource` | `gupy` · `linkedin` · `programathor` · `manual` |
| `ApplicationStatus` | `active` · `archived` · `withdrawn` |
| `TimelineEventType` | `process_created` · `created` · `stage_changed` · `priority_changed` · `favorited` · `unfavorited` · `hidden` · `restored` · `note_added` · `note_updated` · `applied` · `interview_scheduled` · `offer` · `offer_received` · `rejected` · `match_recalculated` |

### Atributos independentes

Favorito, prioridade e visibilidade são **ortogonais** ao estágio do pipeline. Nunca representar todos esses estados com um único campo de status.

**JobEngagement** (em `Job` response): `isFavorite`, `priority`, `visibility`, `hiddenAt`

**Application** / **ApplicationProcess** (pipeline): `stage`, `lastStageUpdatedAt`, `notes`, `timeline`, `status`, `recruiterLinkedin`, `tags`, `salaryExpectation`, `negotiatedSalary` (`offerValue` no PATCH)

**Job** (catálogo global): read-only no contexto de processo — mutação de título/empresa/descrição/URL/salário publicado **proibida** via API de processo.

---

## Autenticação

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| `POST` | `/auth/login` | Público | Login Google OAuth (`idToken` obrigatório) |
| `POST` | `/auth/logout` | Sim | Encerra sessão |
| `POST` | `/auth/refresh` | Cookie | Renova tokens |
| `GET` | `/auth/me` | Sim | Usuário autenticado |
| `POST` | `/auth/onboarding/complete` | Sim | Finaliza onboarding |

---

## System

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| `GET` | `/health` | Público | `{ status, uptime, version }` |
| `GET` | `/version` | Público | `{ version, name, environment }` |
| `GET` | `/info` | Público | Metadados da API |

---

## Profile (perfil simplificado MVP)

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| `GET` | `/profile` | Sim | Retorna perfil do usuário |
| `POST` | `/profile` | Sim | Cria perfil (onboarding) |
| `PATCH` | `/profile` | Sim | Atualiza perfil |
| `GET` | `/profile/job-search-hints` | Sim | Dicas de busca derivadas do perfil (Etapa XX) |

**`GET /profile/job-search-hints` — resposta `data`:**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `area` | string \| null | Área profissional |
| `titleHints` | string[] | Aliases de cargo sugeridos para `search`/`q` |
| `skillNames` | string[] | Skills do perfil |
| `seniority` | string \| null | Senioridade |
| `modality` | string \| null | Modalidade preferida |
| `locationPreference` | `{ scope: "country" \| "state" \| "city", state?: string, city?: string }` \| null | Preferência estruturada (não usar string livre) |
| `salaryExpectation` | object \| null | Faixa salarial `{ min, max, currency }` |

**Campos MVP:** área, senioridade, competências (`skillNames`), modalidade, localização, pretensão salarial.

**Resposta `GET /profile`:** inclui `user` read-only `{ name, email, avatarUrl }` (Google).

**Campos fora do update MVP:** `bio`, `linkedinUrl`, `githubUrl`, `blockedSkills`, `headline`.

---

## Settings (preferências MVP)

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| `GET` | `/settings` | Sim | Retorna preferências do usuário (cria defaults se ausente) |
| `PATCH` | `/settings` | Sim | Atualiza preferências |

**Campos MVP:**

| Campo | Tipo | Valores |
|-------|------|---------|
| `theme` | string | `dark` \| `light` \| `system` |
| `jobRefreshFrequency` | string | `15m` \| `30m` \| `1h` \| `2h` \| `manual` |
| `dashboardNotificationInterval` | string | mesmo enum acima |

**Fora do MVP:** push, e-mail, i18n (`language`).

**Evento:** `SettingsUpdated` (EventBus, log debug no bootstrap).

---

## Jobs

**Fonte de dados (Etapa 14):** catálogo oficial persistido em Prisma (`isCatalog: true`, seed ~400 vagas). Filtros e paginação executados no banco. Providers automáticos (Gupy, LinkedIn, Programathor) são **V2** — alimentarão o mesmo modelo `Job` via `JobCatalogRepository`.

| Método | Rota | Auth | Status | Descrição |
|--------|------|------|--------|-----------|
| `GET` | `/jobs` | Sim | Implementado | Lista paginada com filtros e match score |
| `GET` | `/jobs/:id` | Sim | Implementado | Detalhe da vaga (inclui `sourceUrl`) |
| `GET` | `/jobs/:id/match` | Sim | Implementado | Match score e reasons |
| `GET` | `/jobs/:id/related` | Sim | Implementado | Vagas relacionadas |
| `GET` | `/jobs/:id/timeline` | Sim | Implementado | Timeline de engajamento |
| `GET` | `/jobs/:id/insights` | Sim | Implementado | Insights da vaga |
| `GET` | `/jobs/:id/learning-gaps` | Sim | Implementado | Gaps de aprendizado |
| `PATCH` | `/jobs/:id/favorite` | Sim | Implementado | Toggle favorito |
| `PATCH` | `/jobs/:id/priority` | Sim | **Planejado** | Definir prioridade (`HIGH` \| `MEDIUM` \| `LOW`) |
| `PATCH` | `/jobs/:id/visibility` | Sim | **Planejado** | Ocultar ou restaurar vaga |
| `POST` | `/jobs` | Sim | **Planejado** | Cadastro manual de vaga |
| `POST` | `/jobs/:id/view` | Sim | Implementado | Marca como visualizada |

### Job response — campos de engajamento

```json
{
  "isFavorite": false,
  "trackingId": "tracking_abc123",
  "priority": "MEDIUM",
  "visibility": "VISIBLE",
  "hiddenAt": null
}
```

Campos `priority`, `visibility` e `hiddenAt` são opcionais até implementação completa (Etapa 12). Defaults: `MEDIUM`, `VISIBLE`, `null`.

### Filtros `GET /jobs`

| Param | Valores | Default |
|-------|---------|---------|
| `visibility` | `visible` \| `hidden` \| `all` | `visible` |
| `priority` | `high` \| `medium` \| `low` | — |
| `isFavorite` | `true` \| `false` | — |
| `sortBy` | `match` \| `date` \| `salary` \| `title` \| `company` \| `priority` | — |
| `location` | string | Filtro textual (cidade/UF); não usar "Brasil inteiro" |
| `locationScope` | `country` \| `state` \| `city` | Filtro estruturado (ex.: `country` = remoto + Brasil) |
| `locationState` | string | UF quando `locationScope=state` ou `city` |
| `locationCity` | string | Cidade quando `locationScope=city` |
| `salaryMin` | inteiro > 0 (BRL mensal) | — |
| `salaryMax` | inteiro > 0 (BRL mensal) | — |

**Filtro salarial (Etapa 13):** `salaryMin`/`salaryMax` aplicam-se apenas a vagas com salário informado. Vagas sem `salaryMin`/`salaryMax` **nunca** são excluídas pelo filtro.

**Meta da listagem (`meta`):** além de `limit`, `total`, `hasMore`, `nextCursor`, inclui `jobsWithSalary` e `salaryCoverageRatio` (0–1) calculados sobre o conjunto filtrado **sem** considerar `salaryMin`/`salaryMax`. O frontend oculta o controle salarial quando `salaryCoverageRatio < 0.1`.

### Cadastro manual `POST /jobs`

```json
{
  "company": "string",
  "title": "string",
  "sourceUrl": "string",
  "description": "string",
  "appliedAt": "ISO8601?",
  "initialStage": "PipelineStage?",
  "notes": "string?",
  "source": "manual"
}
```

Mesmo fluxo das vagas importadas. Se `initialStage` informado, cria entrada no pipeline.

### Ação MVP: Abrir vaga

Não há endpoint dedicado. O frontend usa o campo **`sourceUrl`** retornado no job para abrir a plataforma original em nova aba.

```
window.open(job.sourceUrl, '_blank', 'noopener,noreferrer')
```

### Endpoints legados (fora do escopo MVP)

| Método | Rota | Status | Notas |
|--------|------|--------|-------|
| `POST` | `/jobs/:id/apply` | **Deprecated** | Não usar em novas implementações. Candidatura é na plataforma original. |
| `DELETE` | `/jobs/:id/apply` | **Deprecated** | Remover aplicação interna — alinhar com pipeline manual. |

---

## Application Process (`/tracking`) — ADR-034

Nome de produto para `JobTracking`. Rotas e persistência usam `/tracking`; respostas expõem `data` e alias `process`.

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| `GET` | `/tracking` | Sim | Lista processos do usuário |
| `GET` | `/tracking/:id` | Sim | Detalhe do processo |
| `POST` | `/tracking` | Sim | Inicia processo (`jobId` ou `job` manual → upsert catálogo global) |
| `PATCH` | `/tracking/:id/stage` | Sim | Move estágio |
| `PATCH` | `/tracking/:id/favorite` | Sim | Toggle favorito |
| `PATCH` | `/tracking/:id/priority` | Sim | Altera prioridade |
| `PATCH` | `/tracking/:id/visibility` | Sim | Ocultar/restaurar |
| `PATCH` | `/tracking/:id/notes` | Sim | Observações |
| `PATCH` | `/tracking/:id/process` | Sim | Metadados do processo (recrutador, tags, `offerValue`, links) — **não** edita campos da vaga |
| `GET` | `/tracking/:id/timeline` | Sim | Timeline |
| `PATCH` | `/tracking/:id/timeline/:eventId` | Sim | Editar evento |
| `GET/POST/PATCH` | `/tracking/:id/interviews` | Sim | Entrevistas do processo |

**Resposta (exemplo):** `{ "data": { ... }, "process": { ... } }` — mesmo payload.

**`PATCH /tracking/:id/process` — campos permitidos:** `notes`, `feedback`, `priority`, `isFavorite`, `recruiterName`, `recruiterEmail`, `recruiterPhone`, `recruiterLinkedin`, `tags`, `negotiatedSalary`, `offerValue` (alias), `salaryExpectation`, `processLinks`.

**Proibido:** mutar `Job.title`, `Job.companyName`, `Job.description`, `Job.sourceUrl`, salário publicado da vaga.

---

## Pipeline (acompanhamento manual)

O pipeline **não** representa candidatura automática. O usuário adiciona e atualiza status manualmente.

| Método | Rota | Auth | Status | Descrição |
|--------|------|------|--------|-----------|
| `GET` | `/pipeline` | Sim | Implementado | Board (colunas + KPIs + filtros) |
| `POST` | `/pipeline` | Sim | **Planejado** | Adicionar vaga ao acompanhamento |
| `PATCH` | `/pipeline/:id/status` | Sim | Implementado | Move estágio manualmente |
| `PATCH` | `/pipeline/:id/favorite` | Sim | Implementado | Toggle favorito |
| `PATCH` | `/pipeline/:id/notes` | Sim | **Planejado** | Atualizar observações |
| `PATCH` | `/pipeline/:id/archive` | Sim | Implementado | Arquiva entrada |
| `DELETE` | `/pipeline/:id` | Sim | Implementado | Remove do pipeline |
| `GET` | `/pipeline/:id/timeline` | Sim | Implementado | Histórico de eventos |
| `PATCH` | `/pipeline/:id/timeline/:eventId` | Sim | **Planejado** | Editar `occurredAt` de evento |

### Application response — campos adicionais

```json
{
  "lastStageUpdatedAt": "2026-07-01T10:00:00.000Z"
}
```

Atualizado automaticamente em cada movimentação de card. Editável indiretamente via edição de evento na timeline.

### Estágios

**Alvo (ADR-022):** `applied` → `hr` → `technical_interview` → `manager` → `client` → `offer` → `hired` | `rejected`

**Legado:** estágio `"favorite"` permanece até Etapa 12.

### Timeline — eventos automáticos

| Evento | Gatilho |
|--------|---------|
| `stage_changed` | Movimentação no Kanban |
| `priority_changed` | Alteração de prioridade |
| `favorited` / `unfavorited` | Toggle favorito |
| `hidden` / `restored` | Ocultar / restaurar |
| `note_added` / `note_updated` | Observações |
| `process_created` | Processo iniciado (`POST /tracking`) |
| `interview_scheduled` | Entrevista criada |
| `offer` | Estágio movido para oferta |
| `rejected` | Processo encerrado (`closed`) |
| `match_recalculated` | Análise IA concluída em background |
| `created` | Legado — preferir `process_created` |

---

## Recommendations / Dashboard

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| `GET` | `/recommendations` | Sim | Recomendações personalizadas (stub backend; MSW no dev) |

**MSW (dev):** `GET /dashboard`, `GET /notifications` — handlers no frontend; backend real em evolução.

**Dashboard (`GET /dashboard`) — campos principais (Etapa XX):**

| Campo | Descrição |
|-------|-----------|
| `kpis` | KPIs incl. `kpi_interviews` alinhado a `CareerEventsService` |
| `upcomingInterviews` | Próximas 5 entrevistas (Google + pipeline): `scheduledAt`, `companyName`, `jobTitle`, `stage`, `meetingType`, `source`, `link` |
| `topCompanies` | `DashboardCompanyInsight[]` — agregação do **tracking do usuário** (`totalJobs`, `inProgress`, `favorites`, `lastInteractionAt`, `bestMatchScore`) |
| `topTechnologies` | Skills normalizadas a partir dos jobs do tracking do usuário |
| `jobSync` | `lastSyncAt`, `totalCatalogJobs`, `jobsByProvider`, `recentExecutions`, `providerErrors24h` |

### Job Import por URL (Etapa XX)

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| `POST` | `/jobs/import/preview` | Sim | Extrai metadados da URL (Gupy, LinkedIn) |
| `POST` | `/jobs/import/confirm` | Sim | Persiste vaga; dedup idempotente |

**Confirm — resposta `data`:** `job`, `tracking?`, `isExisting?` (quando URL/hash já existe → reutiliza job sem duplicar).

**Providers suportados:** Gupy, LinkedIn. Programathor retorna `422` com mensagem "em breve".

---

## Notificações (MVP — eventos internos)

Contrato alvo (MSW implementado; backend em evolução):

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| `GET` | `/notifications` | Sim | Lista notificações internas |
| `PATCH` | `/notifications/read` | Sim | Marca como lidas |

**Tipos de evento MVP:** nova vaga, mudança de status, entrevista próxima, nova recomendação.

---

## Providers (Etapa 17)

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| `GET` | `/providers` | Sim | Lista providers registrados |
| `GET` | `/providers/statistics` | Sim | Totais, jobs por provider, execuções recentes |
| `GET` | `/providers/history` | Sim | Histórico de execuções (cursor) |
| `GET` | `/providers/health` | Sim | Health check por provider |
| `POST` | `/providers/run` | Sim + rate limit | Executa todos os providers habilitados |
| `POST` | `/providers/run/:provider` | Sim + rate limit | Executa um provider |

**Dashboard (`GET /dashboard`):** inclui `jobSync` com `lastSyncAt`, `totalCatalogJobs`, `jobsByProvider`, `recentExecutions`, `providerErrors24h`. Ver seção Recommendations/Dashboard acima para DTOs Etapa XX.

---

## AI Career Intelligence (Etapa 18)

Análise de carreira **on-demand** para processos no pipeline. O match score permanece no engine `rules-v2`; a IA apenas interpreta e recomenda.

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| `GET` | `/ai/career-analysis/:trackingId` | Sim | Última análise salva ou `204` se inexistente |
| `POST` | `/ai/career-analysis/:trackingId` | Sim + rate limit | Gera análise (cache-first). Query `refresh=true` força nova chamada ao provider |

**Ownership:** `trackingId` deve pertencer ao usuário autenticado (404 se IDOR).

**Rate limits (cache miss):** `AI_CAREER_DAILY_LIMIT` (default 5/dia UTC), `AI_CAREER_DEBOUNCE_MS` (default 15s).

**Resposta `data`:**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `summary` | string | Resumo executivo |
| `matchExplanation` | string | Explicação do match (não recalcula score) |
| `strengths` | string[] | Pontos fortes |
| `weaknesses` | string[] | Pontos de atenção |
| `missingSkills` | string[] | Lacunas de skills |
| `learningRecommendations` | string[] | Recomendações de estudo |
| `interviewPreparation` | string[] | Preparação para entrevista |
| `careerInsights` | string[] | Insights de carreira |
| `nextSteps` | string[] | Próximos passos |
| `confidence` | number | 0–1 |
| `generatedAt` | ISO string | Timestamp da análise |
| `provider` | string | Ex.: `gemini` |
| `model` | string | Modelo usado |
| `engineVersion` | `"ai-career-v1"` | Versão do módulo IA |
| `matchEngineVersion` | string | Ex.: `rules-v2` |
| `cached` | boolean | `true` se servido do cache |
| `stale` | boolean? | `true` se hash mudou mas `refresh=false` |

**Erros:** `AI_NOT_CONFIGURED` (503), `AI_PROVIDER_ERROR` (502), `AI_RATE_LIMIT_EXCEEDED` (429), `AI_DEBOUNCE` (429).

Ver [AI.md](./AI.md) e ADR-028 em [DECISIONS.md](./DECISIONS.md).

---

## Importação futura (V2)

| Funcionalidade | Descrição |
|----------------|-----------|
| Importar por URL | Cadastrar vaga a partir de link externo com parsing automático |
| LinkedIn / Programathor fetch real | Substituir stubs por integração completa |

Fora do escopo Etapa 17. Ver [PROVIDERS.md](./PROVIDERS.md).

---

## Currículo Inteligente (`/resume`) — Etapa 22

Auth obrigatória. Ver [RESUME_INTELLIGENCE.md](./RESUME_INTELLIGENCE.md).

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/resume` | Currículo ativo + versão atual |
| PUT | `/resume` | Salvar editor → nova versão |
| POST | `/resume/upload` | multipart `file` (PDF/DOCX/TXT) |
| POST | `/resume/import/text` | `{ text }` — colar currículo |
| GET | `/resume/versions` | Listar versões |
| POST | `/resume/versions/:id/restore` | Restaurar versão |
| POST | `/resume/analyze-job` | `{ url }` — análise currículo × vaga |
| GET | `/resume/history` | Análises + imports |
| GET | `/resume/analyses/:id` | Análise + sugestões |
| POST | `/resume/suggestions/:id/apply` | Aceitar sugestão (opcional `{ editedText }`) |
| POST | `/resume/suggestions/:id/reject` | Rejeitar sugestão |

---

## Engajamento de vaga (`engagementState`)

Estados retornados pelo servidor (legado — ver ADR-022):

| Estado | Significado |
|--------|-------------|
| `new` | Não visualizada |
| `viewed` | Visualizada |
| `favorited` | Favoritada |
| `applied` | **Deprecated** — usar pipeline manual |
| `rejected` | Descartada |

---

## MSW vs Backend

| Ambiente | Fonte de dados |
|----------|----------------|
| `NEXT_PUBLIC_ENABLE_MSW=true` | Handlers MSW no frontend |
| `NEXT_PUBLIC_ENABLE_MSW=false` | Backend Express |

Contratos devem permanecer espelhados para testes Vitest.

---

## Referências

- [MVP_SCOPE.md](./MVP_SCOPE.md)
- [PRODUCT_VISION.md](./PRODUCT_VISION.md)
- [BACKEND_GUIDE.md](./BACKEND_GUIDE.md)
- [DECISIONS.md](./DECISIONS.md) — ADR-020 · ADR-022
