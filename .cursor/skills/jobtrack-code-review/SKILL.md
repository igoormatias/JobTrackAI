---
name: jobtrack-code-review
description: >-
  Reviews JobTrack AI diffs against project rules (MVP scope, domain model,
  Jobs/Tracking/Pipeline separation, Clean Architecture, Next.js, MSW-test-only).
  Use when the user asks for code review, PR review, revisar código, or /jobtrack-review.
---

# JobTrack AI — Code Review

Orchestrates an on-demand review. Project rules under `.cursor/rules/` are the source of truth — read them; do not rewrite them into findings as paraphrased policy.

## Quick start

1. Resolve the diff scope (default: branch changes vs `main`).
2. Classify touched paths (`frontend/**`, `backend/**`, docs/rules).
3. Read only the relevant rules + the matching checklists in this skill.
4. Review the actual code for blockers, warnings, and nits.
5. Emit the report format below.
6. **Do not fix** unless the user explicitly asks to fix findings.

## Diff scope

| User intent | Scope |
|-------------|--------|
| Default / "review this branch" / PR | Branch changes vs merge-base with `main` (committed + staged + unstaged) |
| "uncommitted" / working tree / dirty | Uncommitted changes only |
| Specific files or paths cited | Those paths only |

Commands (adapt as needed):

```bash
git diff main...HEAD
git diff main...HEAD --stat
git diff          # uncommitted (unstaged)
git diff --cached # staged
```

## Classification → what to load

### Always (any non-trivial product code)

- `.cursor/rules/mvp-product-scope.mdc`
- `.cursor/rules/domain-model.mdc`
- `.cursor/rules/jobs-pipeline-separation.mdc`
- `.cursor/rules/msw-test-only.mdc`
- `.cursor/rules/self-documenting-code.mdc`
- [checklists/domain-mvp.md](checklists/domain-mvp.md)

### Backend (`backend/**`)

- `backend/.cursor/rules/backend-architecture.mdc`
- `backend/.cursor/rules/testing.mdc` when tests change or are missing for new behavior
- [checklists/backend.md](checklists/backend.md)
- [checklists/testing.md](checklists/testing.md)

### Frontend (`frontend/**`)

- `.cursor/rules/frontend-nextjs.mdc`
- `.cursor/rules/frontend-quality.mdc`
- `.cursor/rules/frontend-feature-structure.mdc`
- `.cursor/rules/frontend-testing.mdc`
- `.cursor/rules/frontend-naming-exports.mdc`
- `.cursor/rules/frontend-tailwind.mdc` / `.cursor/rules/frontend-responsiveness.mdc` when UI/layout changes
- [checklists/frontend.md](checklists/frontend.md)
- [checklists/testing.md](checklists/testing.md)

### Feature-specific (only if the diff touches the area)

| Area | Rule |
|------|------|
| Match / ranking | `.cursor/rules/match-engine.mdc` |
| Job aggregation / providers | `.cursor/rules/job-aggregation.mdc` |
| Job freshness / sorting | `.cursor/rules/job-freshness.mdc`, `.cursor/rules/job-sorting.mdc` |
| URL import | `.cursor/rules/url-import-normalization.mdc`, `.cursor/rules/job-url-persistence.mdc` |
| AI career on-demand | `.cursor/rules/ai-career.mdc` |
| Resume intelligence | `.cursor/rules/resume-intelligence.mdc` |
| Calendar | `.cursor/rules/calendar-provider.mdc` |
| Tracking match background | `.cursor/rules/tracking-match-background.mdc` |
| Process edit boundaries | `.cursor/rules/process-edit-boundaries.mdc` |

Do **not** load every rule up front — progressive disclosure only.

## Review focus (must inspect code)

- Correctness and edge cases in changed logic
- Ownership on authenticated mutations (404 if not owner — never leak existence)
- Prisma / HTTP / Zod placement (Clean Architecture)
- Jobs vs Tracking vs Pipeline boundaries
- MVP scope leaks (apply flow, ATS, public profile, MSW in runtime, ManualJobs module)
- Tests added/updated for behavior changes
- Redundant comments and deep imports

## Severity

| Level | Use for |
|-------|---------|
| `blocker` | MVP/domain/architecture violation; security/ownership hole; MSW in runtime; candidatura interna |
| `warning` | Stack/best-practice miss (missing test, fat page, Prisma in use case, deep import) |
| `nit` | Naming, minor style, optional cleanup |

## Verdict

- `REQUEST_CHANGES` — any `blocker`
- `APPROVE_WITH_NITS` — no blockers; has warnings and/or nits
- `APPROVE` — no findings, or only trivial nits the reviewer chooses to omit

## Report format (mandatory)

```markdown
## Verdict
APPROVE | APPROVE_WITH_NITS | REQUEST_CHANGES

## Findings
| Severity | Area | Location | Rule | Finding |
|----------|------|----------|------|---------|
| blocker | domain | path:line | ADR-022 | … |

## Summary
- N blockers, N warnings, N nits
- What looks solid (1–3 short bullets)
```

- `Area`: `domain` | `backend` | `frontend` | `testing` | `security` | `mvp`
- `Rule`: ADR id, rule filename, or short label (e.g. `msw-test-only`, `backend-architecture`)
- Sort findings by severity (blocker → warning → nit)
- If the diff is empty, say so in one sentence and stop

## Complements (optional, not a substitute)

- `/review-bugbot` for generic bug hunting on the same diff
- Security review subagent when auth, cookies, uploads, or ownership change

## Anti-patterns for this skill

- Do not paste entire rules into the report
- Do not implement out-of-MVP features “because review suggested product growth”
- Do not auto-fix findings unless asked
