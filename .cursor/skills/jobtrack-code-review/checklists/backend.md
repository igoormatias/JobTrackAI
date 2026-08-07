# Checklist — Backend

Source of truth:

- `backend/.cursor/rules/backend-architecture.mdc`
- Template: `backend/src/modules/system/`
- Refs: `docs/ARCHITECTURE.md`, `docs/BACKEND_GUIDE.md`

## Structure (new modules)

- [ ] Layout: `domain/` · `application/` · `infrastructure/` · `index.ts`
- [ ] No new `service/` folder — use `application/use-cases/`
- [ ] Controllers under `infrastructure/http/controllers/`
- [ ] Zod schemas under `infrastructure/http/schemas/`
- [ ] Repository interfaces in `domain/repositories/`; Prisma/in-memory in `infrastructure/repositories/`

## Dependencies & Prisma

- [ ] Dependency direction: Infrastructure → Application → Domain only
- [ ] Domain does not import Application or Infrastructure
- [ ] No Prisma in controllers or use cases
- [ ] Controllers: validate → call use case → map response (no business rules)

## Validation & typing

- [ ] All HTTP input validated with Zod (no hand-rolled validation)
- [ ] Route params via `getRouteParam` from `shared/http/` (Express 5)
- [ ] No `any`
- [ ] Prefer value objects when they clarify domain invariants

## Security (mutations)

- [ ] Authenticated read/mutate-by-id checks ownership (`userId` === owner)
- [ ] Wrong owner → `NotFoundError` (404), not 403 that leaks existence

## Events

- [ ] Important domain actions publish via `EventBus` / `InMemoryEventBus` when the pattern fits
- [ ] Avoid direct service-to-service coupling when an event is enough

## Docs / exceptions

- [ ] Architectural exceptions documented in `docs/DECISIONS.md`
- [ ] New module checklist from architecture rule covered (controller, use case, repo, DTO, schema, entity, tests)
