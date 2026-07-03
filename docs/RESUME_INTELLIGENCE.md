# JobTrack AI — Currículo Inteligente (Resume Intelligence v1.4)

Etapa 22 — pós-MVP. UI: **Currículo Inteligente** · código: módulo `resume`.

## Princípios

- Currículo = **perfil profissional estruturado** (JSON), não arquivo bruto
- IA **nunca** altera currículo automaticamente — sugestões com aceitar/rejeitar/editar
- Toda alteração confirmada → nova `ResumeVersion`
- Match score → **Match Engine `rules-v2`**; IA interpreta ATS e gaps
- Cache SHA-256 antes do Gemini (`resume-v1`)

## Arquitetura

```
POST /resume/upload | /import/text
  → parsers (PDF/DOCX/TXT)
  → Gemini structure (fallback heurístico)
  → SkillNormalizer
  → ResumeVersion

POST /resume/analyze-job
  → job-import extract
  → Match Engine + profile + resume skills
  → cache (ResumeAnalysis)
  → Gemini job analysis
  → ResumeSuggestion[]
```

## Entidades

- `Resume`, `ResumeVersion`, `ResumeImport`, `ResumeAnalysis`, `ResumeSuggestion`

## Fronteira Etapa 18

| Etapa 18 | Etapa 22 |
|----------|----------|
| `/ai/career-analysis/:trackingId` | `/resume/analyze-job` |
| Contexto pipeline | Currículo + URL vaga |

## Env

Reutiliza `GEMINI_API_KEY`, `GEMINI_MODEL`, `GEMINI_TIMEOUT_MS`.

## Referências

- ADR-031
- `.cursor/rules/resume-intelligence.mdc`
