# Backend Rules (API)

## Estrutura (obrigatório)

- Arquitetura em camadas por módulo:
  - `controller/` (HTTP)
  - `service/` (regras de negócio)
  - `repository/` (persistência)

## Código

- Controller **nunca** acessa banco diretamente.
- Validar dados com **Zod** (`schemas/` por módulo).
- Usar `async/await`.
- Evitar lógica no controller (só orquestra request/response).

## Nomeação

- Funções: `camelCase`
- Classes: `PascalCase`

## Erros

- Usar erros customizados em `src/shared/errors/*`.
- Nunca usar `try/catch` genérico sem tratamento; deixar subir para `errorMiddleware` quando fizer sentido.
- Mapear erros Prisma conhecidos (`P20xx`) no `src/shared/http/errorMiddleware.ts` com HTTP status e mensagens específicas.

## API (REST)

- Rotas REST por agregado (ex.: `lineup`, `report`).
- Padrão:
  - `GET /resource`
  - `POST /resource`
  - `PUT /resource/:id`
  - `DELETE /resource/:id`

## Banco

- Sempre usar migrations (`prisma/migrations`).
- Criar VIEWs para relatórios e expor via módulo `report`.

## Testes

- Priorizar TDD.
- Prioridade: testar `service/` com repositórios mockados.
- Ver convenções em `backend/.cursor/rules/testing.mdc`.

