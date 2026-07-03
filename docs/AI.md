# JobTrack AI — AI Career Intelligence (Etapa 18)

## Princípios

- IA **nunca** substitui regras de negócio
- Match Score permanece **Match Engine `rules-v2`**
- IA interpreta, explica e recomenda **on-demand** (botão manual)
- Cache persistente antes de chamar Gemini (meta >90% cache hit no Free Tier)

## Arquitetura

```
POST /ai/career-analysis/:trackingId
  → CareerAnalysisService
  → cache (AIAnalysis by trackingId + contentHash)
  → miss: SkillNormalizer → PromptBuilder → PromptCompressor → GeminiProvider
```

## Env vars

| Variável | Default | Descrição |
|----------|---------|-----------|
| `GEMINI_API_KEY` | — | API key Google AI Studio (opcional — app funciona sem IA) |
| `GEMINI_MODEL` | `gemini-2.5-flash` | Modelo preferido |
| `PROMPT_VERSION` | `career-v1` | Invalida cache ao mudar prompt |
| `GEMINI_TIMEOUT_MS` | `30000` | Timeout da chamada |
| `AI_CAREER_DAILY_LIMIT` | `5` | Análises reais (não cache) por usuário/dia |
| `AI_CAREER_DEBOUNCE_MS` | `15000` | Intervalo mínimo entre chamadas reais |

## Cache hash

SHA-256 de snapshot estável: job, profile, user skills, tracking, timeline, match V1, `PROMPT_VERSION`, `MATCH_ENGINE_VERSION`, `GEMINI_MODEL`.

## Skills Catalog

- `Skill` + `SkillAlias` — catálogo oficial + aliases
- `UserSkill` — derivado de `Profile.skillNames` (sync paralelo)
- `SkillNormalizer` — comparação por slug

## Referência

Padrões adaptados de [escalaAi/backend/src/modules/ai](../escalaAi) (provider, cache, model fallback).
