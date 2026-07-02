# JobTrack AI — Implementation Status

Last updated: Etapa 14 (Jobs Catalog).  
Legend: ✅ Done · 🚧 In progress · ⬜ Pending · 🧪 Test-only mock

| Module | Frontend | Backend API | Prisma | Tests | Notes |
|--------|----------|-------------|--------|-------|-------|
| Auth | ✅ | ✅ | ✅ User | ✅ | Google OAuth real |
| Onboarding | ✅ | ✅ | ✅ Profile | ✅ | |
| Profile / Settings | ✅ | ✅ | ✅ | ✅ | Clean Architecture |
| Jobs (catalog) | ✅ | ✅ | ✅ Job seed ~400 | ✅ | Job Catalog module; Prisma queries |
| Job Details | ✅ | ✅ | ✅ | ✅ | Match V1; related via catalog |
| Match Engine | ✅ types | ✅ | — | ✅ | `rules-v1`; AI enriches in Etapa 16 |
| Job Tracking | ✅ | ✅ | ✅ | ✅ | Core domain |
| Timeline | ✅ | ✅ | ✅ TimelineEvent | ✅ | |
| Interviews | ✅ | ✅ | ✅ Interview | ✅ | Sub-resource of tracking |
| Pipeline | ✅ | ✅ view | ✅ via tracking | ✅ | Read-only Kanban |
| Dashboard | ✅ | ✅ | ✅ aggregates | ✅ | No Smart Mock Engine |
| Notifications | ✅ | ✅ | ✅ Notification | ✅ | EventBus internal |
| Companies | ✅ | ✅ | derived from Job | ✅ | No separate model |
| MSW | 🧪 | — | — | 🧪 | Tests only (ADR-024) |

## Runtime data flow (target)

```
Browser → React Query → Express :3333 → Job Catalog (Prisma) → PostgreSQL
```

## Out of scope (V2+)

- Providers (Gupy, LinkedIn, Programathor) — V2
- Scheduler — V2
- AI Match enrichment — Etapa 16
- Push notifications, WebSocket — V2
