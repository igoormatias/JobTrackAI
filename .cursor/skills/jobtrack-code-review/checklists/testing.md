# Checklist — Testing

Source of truth:

- `.cursor/rules/frontend-testing.mdc`
- `.cursor/rules/msw-test-only.mdc`
- `backend/.cursor/rules/testing.mdc`

## When tests are required

- [ ] Behavior change includes a new or updated test
- [ ] Exceptions only for pure docs/chore/config with no runtime behavior

## Frontend

- [ ] Vitest + Testing Library
- [ ] Tests colocated next to the module (e.g. `JobCard.test.tsx`) — no `__tests__/` under `src/features/*`
- [ ] Prefer behavior over implementation details
- [ ] MSW only in tests / Storybook — never app runtime
- [ ] Use `TestProviders` / `createQueryWrapper` when Tooltip or React Query are involved
- [ ] Mock `window`/`document` APIs only when needed (`window.open`, `ResizeObserver`)

## Backend

- [ ] Vitest; unit `*.test.ts`, integration `*.integration.test.ts`
- [ ] New Clean Architecture modules: unit-test use cases with mocked repository interfaces (never real Prisma in unit tests)
- [ ] Mock `EventBus` when the use case publishes events
- [ ] Integration: supertest + `createApp()` for HTTP routes
- [ ] Cover important failures: `NotFoundError`, validation, domain rules
- [ ] Prefer `describe` / `it("should ...")` style

## Cross-cutting

- [ ] In-memory repositories stay in unit/integration tests — production path uses Prisma repositories
- [ ] Do not introduce browser MSW to “make the UI work” without the API
