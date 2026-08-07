# Checklist — Frontend

Source of truth:

- `.cursor/rules/frontend-nextjs.mdc`
- `.cursor/rules/frontend-quality.mdc`
- `.cursor/rules/frontend-feature-structure.mdc`
- `.cursor/rules/frontend-naming-exports.mdc`
- `.cursor/rules/frontend-tailwind.mdc` / `.cursor/rules/frontend-responsiveness.mdc` when UI changes
- Human guides: `frontend/.cursor/rules.md`, `frontend/.cursor/quality.md`

## Next.js

- [ ] Server Components by default; `'use client'` only for state, events, or browser APIs
- [ ] `page.tsx` stays thin — delegates to feature page
- [ ] Prefer server fetch / dedicated hooks over `useEffect` for simple data load
- [ ] `next/link` and `next/image` where applicable
- [ ] No secrets on the client (`NEXT_PUBLIC_*` public only)

## Feature structure

- [ ] Code lives under `src/features/<feature>/` with clear `components/`, `pages/`, `hooks/`, `services/`, `utils/`, `types/`
- [ ] Shared UI in `src/components/` (or `src/lib/`, `src/types/`) — not cross-feature deep coupling
- [ ] Files > 100 lines should split; > 150 lines before merge needs justification (except pure config)
- [ ] Stateful logic extracted to `use-*.ts`; internal sub-UI in `fragments/`

## Naming & barrels

- [ ] Components: PascalCase folder + file; arrow-function export with typed props
- [ ] Hooks/services/utils: kebab-case folders/files
- [ ] Barrel `index.ts` present; no deep imports past the barrel
- [ ] Handlers `handleX`; booleans `isX` / `hasX`; avoid `utils.ts` / `helpers.ts` grab-bags

## Quality & comments

- [ ] No redundant comments that restate names/types (see `self-documenting-code`)
- [ ] Hooks only when there is state, effects, shared logic, or API integration — not for pure render wrappers
- [ ] Product boundaries: Jobs UI does not register pipeline processes; Pipeline UI does not own mutations
