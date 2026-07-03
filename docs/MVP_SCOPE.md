# JobTrack AI — Escopo do MVP

Documento oficial do que **faz** e **não faz** parte do MVP. Toda nova funcionalidade deve ser validada contra este escopo antes da implementação.

Pergunta gate (obrigatória):

> *Esta funcionalidade ajuda diretamente o usuário a **encontrar vagas**, **organizar vagas**, **priorizar vagas** ou **acompanhar processos seletivos**?*

Se a resposta for **não**, a funcionalidade **não** deve ser implementada no MVP — documentar em V2 ([ROADMAP.md](./ROADMAP.md)).

---

## Dentro do MVP

| Responsabilidade | Descrição |
|------------------|-----------|
| Centralizar vagas | Catálogo via Job Aggregation (providers) + seed opcional em dev (`SEED_CATALOG`) |
| Buscar vagas | Busca global com debounce e filtros na URL |
| Filtrar vagas | Área, senioridade, modalidade, skills, empresa, fonte, prioridade, visibilidade, etc. |
| Favoritar vagas | Salvar vagas para revisão posterior com destaque visual (Design System) |
| Priorizar vagas | Alta, média ou baixa — independente do pipeline |
| Ocultar / restaurar vagas | Ocultar da listagem padrão sem excluir do banco |
| Abrir vaga na origem | Botão **Abrir vaga** redireciona para a plataforma original (`sourceUrl`) |
| Cadastro manual de vagas | Usuário registra vagas manualmente com mesmo fluxo das importadas |
| Dashboard | KPIs (favoritas, alta prioridade, ocultadas, em processo, entrevistas), melhores vagas, timeline resumida |
| Match Score | Compatibilidade perfil × vaga (Match Engine `rules-v2` no backend) |
| Análise de carreira IA | On-demand por tracking (Etapa 18) — explica match, gaps, entrevista; **não** substitui `rules-v2` |
| Pipeline manual | Kanban para acompanhamento da jornada; estágio atualizado pelo usuário |
| Timeline automática | Eventos registrados em mudanças de status, prioridade, favorito, visibilidade e observações |
| Gestão de entrevistas | Registrar e acompanhar entrevistas no contexto do pipeline |
| Notificações | Eventos internos do JobTrack AI apenas |
| Perfil simplificado | Campos listados abaixo |

### Perfil MVP

| Campo | Origem |
|-------|--------|
| Nome | Google OAuth |
| Foto | Google OAuth (sync automático — **sem upload**) |
| Área profissional | Onboarding |
| Senioridade | Onboarding |
| Competências | Onboarding |
| Modalidade preferida | Onboarding |
| Localização | Onboarding |
| Pretensão salarial | Onboarding |

### Ações de vaga no MVP

| Ação | MVP |
|------|-----|
| Favoritar | Sim |
| Remover favorito | Sim |
| Definir prioridade | Sim |
| Ocultar vaga | Sim |
| Restaurar vaga | Sim |
| Abrir vaga (link externo) | Sim |
| Marcar visualizada | Sim |
| Cadastro manual | Sim |
| Aplicar pela plataforma JobTrack AI | **Não** |

### Cadastro manual de vagas (MVP)

| Campo | Obrigatório |
|-------|-------------|
| Empresa | Sim |
| Cargo | Sim |
| URL da vaga | Sim |
| Descrição | Sim |
| Data da candidatura | Não |
| Status inicial | Não |
| Observações | Não |
| Origem | `manual` |

Vagas manuais utilizam **exatamente o mesmo fluxo** das vagas importadas.

### Notificações MVP (eventos internos)

- Nova vaga encontrada
- Mudança manual de status no pipeline
- Entrevista próxima
- Nova recomendação

---

## Fora do MVP

Estas funcionalidades **não** fazem parte do MVP. Podem existir no futuro (V2+), mas não devem ser implementadas agora.

| Funcionalidade | Destino |
|----------------|---------|
| Aplicação de vagas pela plataforma | Fora do MVP |
| Upload de currículo | V2+ |
| Carta de apresentação | V2+ |
| Perfil público | V2+ |
| LinkedIn / GitHub / portfólio no perfil | V2+ |
| Idiomas | V2+ |
| Certificações | V2+ |
| Rede social | V2+ |
| Compartilhamento de perfil | V2+ |
| Sistema ATS | V2+ |
| Cadastro manual de empresas | V2+ |
| Importação por URL | V2 |
| ~~Providers reais (Gupy, LinkedIn, Programathor)~~ | **Etapa 17** — Gupy real; demais stubs |
| ~~Scheduler (busca automática de vagas)~~ | **Etapa 17** — scheduler interno opcional |
| Match Engine real (backend) | V2 |
| WebSocket / tempo real | V2 |
| ~~IA (resumos, insights com LLM)~~ | **Etapa 18** — análise on-demand; analytics/IA automática permanece V2 |
| Analytics | V2 |
| Machine Learning | V2 |
| Internacionalização (i18n) | V2 |
| Integrações avançadas | V2 |
| Settings avançados (push, e-mail, i18n) | V2 |
| Preferências básicas (tema, refresh, intervalo dashboard) | **MVP** — Etapa 11 |
| Upload de foto de perfil | Fora do MVP |

---

## Dívida técnica documentada (alinhamento futuro)

O código atual ainda contém elementos **fora do escopo MVP** que serão alinhados em etapas futuras:

| Item | Estado atual | Alvo |
|------|--------------|------|
| Botão "Aplicar" no `JobCard` / Job Details | Existe na UI | Substituir por **Abrir vaga** |
| `POST /jobs/:id/apply` | Endpoint legado | Deprecated — fora do escopo MVP |
| Estágio `"favorite"` no pipeline Kanban | Coluna ativa | Remover na Etapa 12; favorito = `isFavorite` |
| Etapa `blockedSkills` no onboarding | Removido na Etapa 17 | — |
| `engagementState: applied` | Marca aplicação via API | Alinhar com fluxo manual do pipeline |
| `priority`, `visibility`, `hiddenAt` | Ausentes no código | Implementar na Etapa 12 |
| Cadastro manual (`POST /jobs`) | Ausente | Implementar na Etapa 12 |

Estes itens **não** devem ser expandidos. Novas implementações devem seguir o escopo deste documento e o domínio oficial (ADR-022).

---

## Referências

- [PRODUCT_VISION.md](./PRODUCT_VISION.md)
- [API_CONTRACT.md](./API_CONTRACT.md)
- [DECISIONS.md](./DECISIONS.md) — ADR-020 · ADR-022
- [ROADMAP.md](./ROADMAP.md)
- `.cursor/rules/mvp-product-scope.mdc` — regra obrigatória no Cursor
- `.cursor/rules/domain-model.mdc` — domínio oficial
