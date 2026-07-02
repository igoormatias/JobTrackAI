# JobTrack AI — Contrato de API (MVP)

Contrato REST oficial alinhado ao escopo do MVP. Ver [MVP_SCOPE.md](./MVP_SCOPE.md) para regras de produto.

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

**Campos MVP:** nome e foto (Google), área, senioridade, competências, modalidade, localização, pretensão salarial.

---

## Jobs

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| `GET` | `/jobs` | Sim | Lista paginada com filtros e match score |
| `GET` | `/jobs/:id` | Sim | Detalhe da vaga (inclui `sourceUrl`) |
| `GET` | `/jobs/:id/match` | Sim | Match score e reasons |
| `GET` | `/jobs/:id/related` | Sim | Vagas relacionadas |
| `GET` | `/jobs/:id/timeline` | Sim | Timeline de engajamento |
| `GET` | `/jobs/:id/insights` | Sim | Insights da vaga |
| `GET` | `/jobs/:id/learning-gaps` | Sim | Gaps de aprendizado |
| `PATCH` | `/jobs/:id/favorite` | Sim | Toggle favorito |
| `POST` | `/jobs/:id/view` | Sim | Marca como visualizada |

### Ação MVP: Abrir vaga

Não há endpoint dedicado. O frontend usa o campo **`sourceUrl`** (ou equivalente) retornado no job para abrir a plataforma original em nova aba.

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

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| `GET` | `/pipeline` | Sim | Board (colunas + KPIs + filtros) |
| `PATCH` | `/pipeline/:id/status` | Sim | Move estágio manualmente |
| `PATCH` | `/pipeline/:id/favorite` | Sim | Toggle favorito |
| `PATCH` | `/pipeline/:id/archive` | Sim | Arquiva entrada |
| `DELETE` | `/pipeline/:id` | Sim | Remove do pipeline |
| `GET` | `/pipeline/:id/timeline` | Sim | Histórico de eventos |

**Estágios típicos:** favoritas, aplicadas, RH, entrevista, teste técnico, gestor, cliente, oferta, reprovadas.

---

## Recommendations / Dashboard

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| `GET` | `/recommendations` | Sim | Recomendações personalizadas (stub backend; MSW no dev) |

**MSW (dev):** `GET /dashboard`, `GET /notifications` — handlers no frontend; backend real em evolução.

---

## Notificações (MVP — eventos internos)

Contrato alvo (MSW implementado; backend em evolução):

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| `GET` | `/notifications` | Sim | Lista notificações internas |
| `PATCH` | `/notifications/read` | Sim | Marca como lidas |

**Tipos de evento MVP:** nova vaga, mudança de status, entrevista próxima, nova recomendação.

---

## Engajamento de vaga (`engagementState`)

Estados retornados pelo servidor:

| Estado | Significado MVP |
|--------|-----------------|
| `new` | Não visualizada |
| `viewed` | Visualizada |
| `favorited` | Favoritada |
| `applied` | **Legado** — marcar como aplicada via API; alinhar com fluxo manual |
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
- [DECISIONS.md](./DECISIONS.md) — ADR-020
