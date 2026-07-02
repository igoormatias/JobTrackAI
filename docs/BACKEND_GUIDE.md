# JobTrack AI — Backend Guide

Guia oficial de convenções e padrões do backend Express. Sincronizado com `backend/.cursor/rules/backend-architecture.mdc`.

**Escopo MVP:** [MVP_SCOPE.md](./MVP_SCOPE.md) · **API:** [API_CONTRACT.md](./API_CONTRACT.md) · **Visão:** [PRODUCT_VISION.md](./PRODUCT_VISION.md)

Toda nova feature backend deve passar pelo filtro MVP: ajuda o usuário a **encontrar vagas**, **organizar vagas**, **priorizar vagas** ou **acompanhar processos seletivos**?

## Arquitetura

O backend segue **Clean Architecture + DDD (lightweight) + SOLID**, sem over-engineering.

### Fluxo de dependências

```
Infrastructure → Application → Domain
```

Nunca inverter. Domain não importa camadas externas.

### Fluxo de requisição (novo padrão)

```
Route → Controller → Use Case → Repository (interface) → Repository (implementação)
```

- **Controller:** valida com Zod, chama Use Case, retorna response — sem regra de negócio
- **Use Case:** uma responsabilidade; orquestra fluxo — sem HTTP, sem Prisma
- **Repository (domain):** interface (port)
- **Repository (infrastructure):** Prisma ou in-memory

### Fluxo de eventos

```
Use Case → eventBus.publish(DomainEvent) → Handlers (InMemoryEventBus)
```

Preferir eventos a acoplamento direto entre módulos (ex.: `ApplicationCreated`, `PipelineStageChanged`).

---

## Estrutura de módulo (obrigatória para novos módulos)

```
modules/<module>/
  domain/
    entities/
    repositories/      # interfaces
    value-objects/
    events/
  application/
    use-cases/
    dto/
    mappers/
  infrastructure/
    http/
      controllers/
      routes/
      schemas/
    repositories/      # implementações
  index.ts
```

**Template canônico:** `backend/src/modules/system/`

---

## Como criar um novo módulo

1. Criar pasta `src/modules/<nome>/` com a estrutura acima
2. Definir **Entity** e **Value Objects** em `domain/`
3. Definir **Repository interface** em `domain/repositories/`
4. Implementar **Use Cases** em `application/use-cases/`
5. Criar **DTOs** e **Mappers** em `application/`
6. Implementar **Repository** em `infrastructure/repositories/`
7. Criar **Controller**, **Routes** e **Schemas Zod** em `infrastructure/http/`
8. Exportar público em `index.ts`
9. Registrar rotas em `src/routes/index.ts`
10. Adicionar testes unitários (use cases) e integração (rotas)
11. Atualizar documentação se necessário

---

## Como criar um novo endpoint

1. Criar ou reutilizar Use Case em `application/use-cases/`
2. Adicionar método no Controller (`infrastructure/http/controllers/`)
3. Validar entrada com Zod em `infrastructure/http/schemas/`
4. Registrar rota em `infrastructure/http/routes/`
5. Teste de integração com supertest

---

## Como criar um Use Case

```typescript
import type { UseCase } from "../../../shared/application/use-case.js";

export class MeuUseCase implements UseCase<InputDto, OutputDto> {
  constructor(private readonly repository: MeuRepository) {}

  async execute(input: InputDto): Promise<OutputDto> {
    // orquestração — uma responsabilidade
  }
}
```

---

## Como criar um Repository

**Interface (domain):**

```typescript
export interface MeuRepository {
  findById(id: string): Promise<Entidade | null>;
}
```

**Implementação (infrastructure):**

```typescript
export class PrismaMeuRepository implements MeuRepository {
  async findById(id: string): Promise<Entidade | null> {
    // Prisma aqui — nunca no Use Case
  }
}
```

---

## Como criar um Domain Event

```typescript
import { DomainEvent } from "../../../shared/domain/domain-event.js";

export class AlgoAconteceuEvent extends DomainEvent {
  readonly eventName = "AlgoAconteceu";
  constructor(readonly payload: { id: string }) {
    super();
  }
}
```

Publicar no Use Case:

```typescript
await this.eventBus.publish(new AlgoAconteceuEvent({ id }));
```

---

## Como registrar eventos

No bootstrap do módulo (ex.: `routes/*.ts`):

```typescript
import { eventBus } from "../../../shared/events/event-bus.js";

eventBus.subscribe("AlgoAconteceu", async (event) => {
  // handler — log, notificação, etc.
});
```

Implementação atual: `InMemoryEventBus` em `src/shared/events/`.

---

## Módulo de referência: system

| Endpoint | Use Case | Descrição |
|----------|----------|-----------|
| `GET /health` | `GetHealthUseCase` | Status, uptime, version |
| `GET /version` | `GetVersionUseCase` | Versão e ambiente |
| `GET /info` | `GetInfoUseCase` | Metadados da API |

Publica `SystemHealthChecked` via EventBus no health check.

---

## Módulos legados

Módulos com `service/` (`auth`, `jobs`, `pipeline`, `recommendations`) **não devem ser usados como modelo para novos módulos**.

Migrar gradualmente quando o módulo receber alterações significativas. Ver ADR-019.

### Módulo `profiles` (Etapa 11 — Clean Architecture)

| Camada | Artefatos |
|--------|-----------|
| Domain | `Profile` entity, `ProfileRepository`, `ProfileUpdated` |
| Application | `GetProfileUseCase`, `CreateProfileUseCase`, `UpdateProfileUseCase` |
| Infrastructure | `ProfileController`, `PrismaProfileRepository`, rotas `/profile` |

`GET /profile` compõe perfil + `user` read-only (nome, e-mail, avatar).

### Módulo `settings` (Etapa 11 — Clean Architecture)

| Camada | Artefatos |
|--------|-----------|
| Domain | `UserSettings` entity, `UserSettingsRepository`, `SettingsUpdated` |
| Application | `GetSettingsUseCase`, `UpdateSettingsUseCase` |
| Infrastructure | `SettingsController`, `PrismaUserSettingsRepository`, rotas `/settings` |

Auth faz `upsert` de `User` + `UserSettings` default no login Google.

### Referência legada: Pipeline (Etapa 10)

| Arquivo | Responsabilidade |
|---------|------------------|
| `pipeline.routes.ts` | Rotas REST do kanban |
| `pipeline.service.ts` | Filtros, KPIs, move stage |
| `pipeline.repository.ts` | Applications in-memory |

---

## Domínio oficial (ADR-022)

Enums compartilhados em `src/shared/domain/`:

| Arquivo | Export |
|---------|--------|
| `job-priority.ts` | `JobPriority`, `JOB_PRIORITIES` |
| `job-visibility.ts` | `JobVisibility`, `JOB_VISIBILITIES` |
| `timeline-event-type.ts` | `TimelineEventType`, `TIMELINE_EVENT_TYPES` |
| `job-source.ts` | `JobSource`, `JOB_SOURCES` (inclui `manual`) |

**JobEngagement** (campos em `Job`): `isFavorite`, `priority`, `visibility`, `hiddenAt`

**Application** (pipeline): `stage`, `lastStageUpdatedAt`, `notes`, `timeline`, `status`

Contratos planejados documentados em [API_CONTRACT.md](./API_CONTRACT.md). Implementação de endpoints na Etapa 12.

---

## Jobs (escopo MVP)

Ações MVP: listar, filtrar, favoritar, definir prioridade, ocultar/restaurar, cadastro manual, marcar visualizada. Abrir vaga usa `sourceUrl` no frontend — sem endpoint dedicado.

`POST /jobs/:id/apply` e `DELETE /jobs/:id/apply` são **legados/deprecated** — fora do escopo MVP. Não expandir.

## Pipeline (acompanhamento manual)

O pipeline **não** representa candidatura automática. Endpoints permitem ao usuário adicionar ao acompanhamento, mover estágio, favoritar, atualizar notas, arquivar e consultar timeline manualmente. `lastStageUpdatedAt` atualizado automaticamente em movimentações.

Ver [API_CONTRACT.md](./API_CONTRACT.md#pipeline-acompanhamento-manual).

## Notificações

Apenas eventos **internos** do JobTrack AI (nova vaga, mudança de status, entrevista, recomendação). Backend em evolução; MSW implementado no frontend.

## Providers / WebSocket / Scheduler

Código preparado em `src/providers/`, `src/config/socket.ts`, `src/modules/scheduler/` — **V2**, não MVP.

## Infraestrutura compartilhada

| Caminho | Descrição |
|---------|-----------|
| `src/shared/application/use-case.ts` | Interface `UseCase<TInput, TOutput>` |
| `src/shared/domain/` | Enums oficiais: `JobPriority`, `JobVisibility`, `TimelineEventType`, `JobSource` |
| `src/shared/domain/domain-event.ts` | Classe base `DomainEvent` |
| `src/shared/events/` | `EventBus`, `InMemoryEventBus`, singleton `eventBus` |
| `src/shared/errors/` | Erros HTTP customizados |

---

## Testes

| Tipo | Local | Ferramenta |
|------|-------|------------|
| Unit (novos) | `application/use-cases/*.test.ts` | Vitest + mocks de repository/EventBus |
| Unit (legado) | `services/*.test.ts` | Vitest + mocks de repository |
| Integration | `*.integration.test.ts` | Supertest + `createApp()` |

---

## Regras obrigatórias

- Validação: **Zod** — nunca manual
- Prisma: somente em `infrastructure/repositories/`
- Tipagem: nunca `any`
- Exceções arquiteturais: documentar em `docs/DECISIONS.md`

---

## Referências

- [PRODUCT_VISION.md](./PRODUCT_VISION.md)
- [MVP_SCOPE.md](./MVP_SCOPE.md)
- [API_CONTRACT.md](./API_CONTRACT.md)
- [ARCHITECTURE.md](./ARCHITECTURE.md)
- [DECISIONS.md](./DECISIONS.md) — ADR-019 · ADR-020 · ADR-022
- [backend/README.md](../backend/README.md)
- [backend/.cursor/rules/backend-architecture.mdc](../backend/.cursor/rules/backend-architecture.mdc)
