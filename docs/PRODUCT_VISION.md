# JobTrack AI — Visão do Produto

Documento oficial da visão e princípios do produto. Fonte de verdade para decisões de escopo.

---

## Problema

Profissionais em busca de emprego precisam acompanhar vagas espalhadas em múltiplas plataformas (Gupy, LinkedIn, Programathor e outras). Cada fonte tem seu próprio fluxo de candidatura, e organizar a jornada — o que foi visto, favoritado, aplicado e em qual etapa está cada processo — torna-se difícil sem uma ferramenta central.

## Objetivo

Oferecer um **Career Tracker inteligente** que centraliza oportunidades e ajuda o usuário a organizar sua busca por emprego de forma clara e objetiva.

## Visão oficial

**JobTrack AI** é uma plataforma para centralizar vagas provenientes de diferentes plataformas (Gupy, LinkedIn, Programathor e futuras integrações) e ajudar o usuário a organizar sua jornada de busca por emprego.

O sistema **não substitui** as plataformas originais.

O usuário continua realizando sua candidatura **diretamente na plataforma de origem**.

O JobTrack AI atua como um **Career Tracker inteligente**.

## Público-alvo

Profissionais em transição ou busca ativa de emprego, com foco inicial em áreas de tecnologia e correlatas (frontend, backend, full stack, mobile, QA, DevOps, produto, dados, etc.).

## Princípios do produto

1. **Simplicidade** — MVP enxuto, sem feature creep.
2. **Plataforma de origem** — candidatura sempre fora do JobTrack AI.
3. **Acompanhamento manual** — o pipeline reflete o que o usuário registra, não automatiza candidaturas externas.
4. **Match como guia** — Match Score ajuda a priorizar vagas, não substitui a decisão do usuário.
5. **Notificações internas** — alertas sobre eventos do próprio JobTrack AI, nunca controle de candidatura externa.

## Escopo resumido

Ver [MVP_SCOPE.md](./MVP_SCOPE.md) para lista completa do que está dentro e fora do MVP.

**No MVP:** centralizar, buscar, filtrar e favoritar vagas; abrir vaga na origem; dashboard; match score; pipeline manual; entrevistas; notificações; perfil simplificado.

**Fora do MVP:** aplicar pela plataforma, currículo, perfil público, integrações em tempo real, IA, analytics e demais itens listados em MVP_SCOPE.

## Fluxo do usuário

```
Encontrou vaga
      ↓
Favoritou
      ↓
Abriu vaga (plataforma original)
      ↓
Aplicou na plataforma original
      ↓
Adicionou ao Pipeline (manual)
      ↓
Atualizou status manualmente
```

## Pipeline

O Pipeline **não representa a candidatura**.

O Pipeline representa apenas o **acompanhamento da jornada** do usuário após suas ações na plataforma de origem.

## Notificações

As notificações representam apenas **eventos internos** do JobTrack AI:

- Nova vaga encontrada
- Mudança manual de status no pipeline
- Entrevista próxima
- Nova recomendação

Nunca controlar ou substituir candidatura externa.

## Perfil

Perfil simplificado com dados do Google (nome e foto) e informações profissionais coletadas no onboarding. Sem upload de imagem — foto sempre sincronizada via Google OAuth.

Campos oficiais: ver [MVP_SCOPE.md](./MVP_SCOPE.md#perfil-mvp).

## Roadmap

- [ROADMAP.md](./ROADMAP.md) — etapas MVP e V2
- [DECISIONS.md](./DECISIONS.md) — ADR-020 (redefinição de escopo)

## Documentos relacionados

| Documento | Conteúdo |
|-----------|----------|
| [MVP_SCOPE.md](./MVP_SCOPE.md) | Escopo detalhado in/out |
| [API_CONTRACT.md](./API_CONTRACT.md) | Contrato REST oficial |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Arquitetura técnica |
| [FRONTEND_GUIDE.md](./FRONTEND_GUIDE.md) | Guia frontend |
| [BACKEND_GUIDE.md](./BACKEND_GUIDE.md) | Guia backend |
