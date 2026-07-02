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
| `TimelineEventType` | `created` · `stage_changed` · `priority_changed` · `favorited` · `unfavorited` · `hidden` · `restored` · `note_added` · `note_updated` · `applied` · `interview_scheduled` · `offer_received` · `rejected` |

### Atributos independentes

Favorito, prioridade e visibilidade são **ortogonais** ao estágio do pipeline. Nunca representar todos esses estados com um único campo de status.

**JobEngagement** (em `Job` response): `isFavorite`, `priority`, `visibility`, `hiddenAt`

**Application** (pipeline): `stage`, `lastStageUpdatedAt`, `notes`, `timeline`, `status`

---

## Autenticação

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| `POST` | `/auth/login` | Público | Login Google (mock no dev) |
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
| `created` | Entrada criada |

---

## Recommendations / Dashboard

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| `GET` | `/recommendations` | Sim | Recomendações personalizadas (stub backend; MSW no dev) |

**MSW (dev):** `GET /dashboard`, `GET /notifications` — handlers no frontend; backend real em evolução.

**KPIs preparados (implementação futura):** favoritas, alta prioridade, ocultadas, em processo, entrevistas.

---

## Notificações (MVP — eventos internos)

Contrato alvo (MSW implementado; backend em evolução):

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| `GET` | `/notifications` | Sim | Lista notificações internas |
| `PATCH` | `/notifications/read` | Sim | Marca como lidas |

**Tipos de evento MVP:** nova vaga, mudança de status, entrevista próxima, nova recomendação.

---

## Importação futura (V2)

| Funcionalidade | Descrição |
|----------------|-----------|
| Importar por URL | Cadastrar vaga a partir de link externo com parsing automático |
| Providers automáticos | Integração com Gupy, LinkedIn, Programathor via scheduler |

Fora do MVP. Documentar implementação em [ROADMAP.md](./ROADMAP.md).

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
