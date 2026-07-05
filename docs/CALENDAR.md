# JobTrack AI — Career Calendar (v1.5)

Etapa 23 — integração Google Calendar + página **Career Calendar**. Código: módulo `calendar`.

## Visão

- Sincronizar entrevistas do pipeline com Google Calendar (create/update)
- Exibir agenda unificada: entrevistas locais + eventos Google
- OAuth de calendário **separado** do login Google (escopos distintos)

## Arquitetura

```
CalendarProviderPort (domain)
  ├── GoogleCalendarProvider   ← ativo (googleapis)
  └── OutlookCalendarProvider  ← stub V2+

CalendarIntegration (Prisma) — tokens criptografados por usuário
Interview.calendarEventId / calendarProvider / syncStatus
```

### CalendarProviderPort

Contrato em `backend/src/modules/calendar/domain/ports/calendar-provider.port.ts`:

| Método | Uso |
|--------|-----|
| `getAuthUrl(state)` | Iniciar OAuth |
| `exchangeCode(code)` | Trocar code por tokens |
| `resolvePrimaryCalendarId()` | Retorna `"primary"` (sem `calendarList.list`) |
| `validateConnection(calendarId, tokens)` | Valida via `events.list` |
| `createEvent` / `updateEvent` / `deleteEvent` | Sync de entrevistas |
| `listEvents(from, to)` | Career Calendar |

Implementações em `infrastructure/providers/`. Rotas injetam `googleCalendarProvider`; Outlook permanece stub que lança `not implemented`.

## Google OAuth (calendário)

Fluxo distinto do login (`POST /auth/login` com `idToken`).

1. Usuário autenticado → `GET /calendar/google/auth-url`
2. Redirect Google com escopos:
   - `openid`, `email`, `profile`
   - `https://www.googleapis.com/auth/calendar.events`
3. `access_type: offline`, `prompt: consent`, `include_granted_scopes: true`
4. Callback frontend: `/settings/calendar/callback?code=…`
5. `POST /calendar/google/callback` → `ConnectGoogleCalendarUseCase`
6. Valida `calendar.events` no scope recebido
7. `calendarId = "primary"` — **não** chama `calendarList.list` (exige escopo extra)
8. Valida conexão com `events.list` no calendário primário
9. Tokens criptografados em `CalendarIntegration` (`scope`, `accountEmail`, `lastSyncAt`, `lastError`)

### Troubleshooting 403 `ACCESS_TOKEN_SCOPE_INSUFFICIENT`

Causa histórica: chamar `calendar.calendarList.list` com apenas `calendar.events`. Corrigido usando `primary` + `events.list`.

### Google Cloud Console (produção)

- **Authorized redirect URI:** `https://<seu-dominio>/settings/calendar/callback`
- **Privacy Policy:** `https://<seu-dominio>/privacy`
- **Terms of Service:** `https://<seu-dominio>/terms`

Redirect URI: `GOOGLE_CALENDAR_REDIRECT_URI` ou default `{FRONTEND_URL}/settings/calendar/callback`.

## Permissões — usuários novos vs existentes

| Aspecto | Login Google | Calendar Google |
|---------|--------------|-----------------|
| Quando | Primeiro acesso / sessão | Opt-in em Minha Conta → Integrações |
| Escopos | Perfil + email (idToken) | `calendar.events` |
| Tokens | Não persistidos (sessão JWT) | `accessToken` + `refreshToken` em DB |
| Usuários pré-v1.5 | Já logados; **sem** calendário até conectar | Mesmo fluxo OAuth dedicado |
| Usuários novos | Login normal | Calendário só após clicar "Conectar" |

Calendário nunca é concedido implicitamente no login. Usuários existentes e novos passam pelo mesmo fluxo de integração.

Prompt de conexão: `POST /calendar/dismiss-prompt` grava `UserSettings.calendarPromptDismissedAt` (API pronta; UI pode consumir via `useDismissCalendarPromptMutation`).

## Sync de entrevistas

Disparado em `createInterview` / `updateInterview` (`prisma-job-tracking.repository`):

```
SyncInterviewCalendarEventUseCase
  → se CalendarIntegration ativa
  → create ou update evento (título: "Entrevista: {job} @ {company}", 1h)
  → Interview.syncStatus: synced | failed
  → Interview.calendarEventId + calendarProvider
```

Sem integração ativa: entrevista persiste localmente; sync é no-op.

## API

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/calendar/status` | Conexão ativa (+ email, scope, lastSync) |
| GET | `/calendar/google/auth-url` | URL OAuth |
| POST | `/calendar/google/callback` | `{ code }` → conectar |
| DELETE | `/calendar/google/disconnect` | Revogar integração |
| POST | `/calendar/sync` | Validar + atualizar lastSyncAt |
| GET | `/calendar/events?from&to` | Agenda (interviews + Google) |
| POST | `/calendar/dismiss-prompt` | Dispensar prompt |
| GET | `/calendar/debug` | Diagnóstico (apenas `NODE_ENV !== production`) |

## Frontend

- `/calendar` — Career Calendar (agenda / semanal / mensal)
- `/settings` → `GoogleCalendarIntegrationCard`
- `/settings/calendar/callback` — OAuth callback
- Nav: item **Calendário**

## Env

```
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GOOGLE_CALENDAR_REDIRECT_URI   # opcional
CALENDAR_TOKEN_SECRET          # opcional; fallback JWT_SECRET
```

## Futuro (V2+)

- **Outlook** — `OutlookCalendarProvider` stub; implementar Microsoft Graph
- **Gmail** — não no escopo v1.5; eventos vêm do Google Calendar API, não Gmail

## Referências

- ADR-032
- `.cursor/rules/calendar-provider.mdc`
