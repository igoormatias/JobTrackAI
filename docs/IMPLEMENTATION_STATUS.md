# JobTrack AI — Implementation Status

Last updated: Etapa 13 (MVP Stabilization).  
Legend: ✅ Done · 🚧 In progress · ⬜ Pending · 🧪 Test-only mock

| Module | Frontend | Backend API | Prisma | Tests | Notes |
|--------|----------|-------------|--------|-------|-------|
| Auth | ✅ | ✅ | ✅ User | ✅ | Google OAuth real (Etapa 13) |
| Onboarding | ✅ | ✅ | ✅ Profile | ✅ | |
| Profile / Settings | ✅ | ✅ | ✅ | ✅ | Clean Architecture |
| Jobs (catalog) | ✅ | ✅ | ✅ Job seed | ✅ | Seeds, no providers |
| Job Details | ✅ | ✅ | ✅ | ✅ | Match V1 from backend |
| Match Engine | ✅ types | ✅ | — | ✅ | `rules-v1`; AI enriches in Etapa 15 |
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
Browser → React Query → Express :3333 → Prisma → PostgreSQL
```

## Out of scope (Etapa 14+)

- Providers (Gupy, LinkedIn, Programathor) — V2
- AI Match enrichment — Etapa 15
- Push notifications, WebSocket, Scheduler — V2
