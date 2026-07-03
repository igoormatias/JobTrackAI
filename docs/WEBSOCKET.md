# JobTrack AI — WebSocket & Realtime

## Estratégia híbrida

| Ambiente | Transporte | Config |
|----------|------------|--------|
| Local / Docker | Socket.IO | `ENABLE_REALTIME=true` + `NEXT_PUBLIC_REALTIME_TRANSPORT=socket` |
| Vercel (serverless) | Polling React Query | `NEXT_PUBLIC_REALTIME_TRANSPORT=polling` (default prod) |

Vercel **não** suporta conexões WebSocket persistentes no backend Express serverless. Use polling em produção até um serviço WS dedicado (V2.1).

## Eventos

| Evento | Payload | Invalida (frontend) |
|--------|---------|---------------------|
| `jobs:new` | `{ jobId }` | jobs list, dashboard |
| `jobs:update` | `{ jobId }` | job details |
| `pipeline:update` | `{ trackingId }` | pipeline |
| `tracking:update` | `{ trackingId }` | tracking, jobs |
| `dashboard:update` | `{}` | dashboard |
| `notifications:new` | `{ notificationId }` | notifications |
| `favorites:update` | `{ jobId }` | jobs |

## Backend

- `backend/src/config/socket.ts` — JWT cookie auth, rooms `user:{userId}`, ping 25s
- `backend/src/shared/events/realtime-bridge.ts` — EventBus → Socket.IO
- Boot apenas em `server.ts` quando `ENABLE_REALTIME=true`

## Frontend

- `RealtimeProvider` em `AppProviders`
- `useRealtimeInvalidation` mapeia eventos → React Query keys
- Polling interval segue `dashboardNotificationInterval` das preferências

## Futuro (V2.1)

- Serviço WS dedicado (Railway/Fly) ou Ably/Pusher para push na Vercel
