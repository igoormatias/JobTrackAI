# Backend Rules (API)

> **Arquitetura:** [`backend-architecture.mdc`](./rules/backend-architecture.mdc)  
> **Escopo MVP:** [`.cursor/rules/mvp-product-scope.mdc`](../.cursor/rules/mvp-product-scope.mdc) · [docs/MVP_SCOPE.md](../docs/MVP_SCOPE.md)

Antes de implementar: *"Esta funcionalidade ajuda o usuário a encontrar vagas ou acompanhar seu processo seletivo?"* Se não → V2, não MVP.

## Padrão novo (obrigatório para módulos novos)

Arquitetura em camadas por módulo:

- `domain/` — entidades, value objects, regras, interfaces de repository, domain events
- `application/` — use cases, DTOs, mappers
- `infrastructure/` — controllers, routes, schemas, implementações de repository

Template de referência: `src/modules/system/`

## Padrão legado (deprecated para novos módulos)

Módulos existentes usam `controller/ → service/ → repository/`. Não criar novos módulos com `service/`. Migrar gradualmente ao receber features significativas.

## Código

- Controller **nunca** acessa banco diretamente.
- Use Case **nunca** usa Prisma diretamente.
- Validar dados com **Zod** (`schemas/` por módulo).
- Usar `async/await`.
- Evitar lógica no controller (só orquestra request/response).

## Nomeação

- Funções: `camelCase`
- Classes: `PascalCase`

## Erros

- Usar erros customizados em `src/shared/errors/*`.
- Nunca usar `try/catch` genérico sem tratamento; deixar subir para `errorMiddleware` quando fizer sentido.
- Mapear erros Prisma conhecidos (`P20xx`) no `error-middleware.ts` com HTTP status e mensagens específicas.

## API (REST)

- Rotas REST por agregado.
- Padrão:
  - `GET /resource`
  - `POST /resource`
  - `PUT /resource/:id`
  - `DELETE /resource/:id`

## Banco

- Sempre usar migrations (`prisma/migrations`).
- Prisma somente em `infrastructure/repositories/`.

## Eventos

- Publicar Domain Events via `EventBus` para ações importantes.
- Implementação inicial: `InMemoryEventBus` em `src/shared/events/`.

## Testes

- Priorizar TDD.
- Novos módulos: testar `use-cases/` (unit) + rotas (integration).
- Legado: testar `service/` com repositórios mockados.
- Ver convenções em `backend/.cursor/rules/testing.mdc`.
