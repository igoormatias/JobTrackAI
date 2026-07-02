# JobTrack AI — Escopo do MVP

Documento oficial do que **faz** e **não faz** parte do MVP. Toda nova funcionalidade deve ser validada contra este escopo antes da implementação.

Pergunta gate (obrigatória):

> *Esta funcionalidade ajuda diretamente o usuário a encontrar vagas ou acompanhar seu processo seletivo?*

Se a resposta for **não**, a funcionalidade **não** deve ser implementada no MVP — documentar em V2 ([ROADMAP.md](./ROADMAP.md)).

---

## Dentro do MVP

| Responsabilidade | Descrição |
|------------------|-----------|
| Centralizar vagas | Agregar oportunidades de múltiplas fontes (via MSW/fixtures no MVP; providers reais em V2) |
| Buscar vagas | Busca global com debounce e filtros na URL |
| Filtrar vagas | Área, senioridade, modalidade, skills, empresa, fonte, etc. |
| Favoritar vagas | Salvar vagas para revisão posterior |
| Abrir vaga na origem | Botão **Abrir vaga** redireciona para a plataforma original (`sourceUrl`) |
| Dashboard | KPIs, melhores vagas, entrevistas, timeline resumida |
| Match Score | Compatibilidade perfil × vaga (MSW no MVP; backend real em evolução) |
| Pipeline manual | Kanban para acompanhamento da jornada; status atualizado pelo usuário |
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
| Marcar visualizada | Sim |
| Abrir vaga (link externo) | Sim |
| Aplicar pela plataforma JobTrack AI | **Não** |

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
| Providers reais (Gupy, LinkedIn, Programathor) | V2 |
| Scheduler (busca automática de vagas) | V2 |
| WebSocket / tempo real | V2 |
| IA (resumos, insights com LLM) | V2 |
| Analytics | V2 |
| Machine Learning | V2 |
| Internacionalização (i18n) | V2 |
| Integrações avançadas | V2 |
| Settings avançados | V2 |
| Upload de foto de perfil | Fora do MVP |

---

## Dívida técnica documentada (alinhamento futuro)

O código atual ainda contém elementos **fora do escopo MVP** que serão alinhados em etapas futuras:

| Item | Estado atual | Alvo |
|------|--------------|------|
| Botão "Aplicar" no `JobCard` | Existe na UI | Substituir por **Abrir vaga** |
| `POST /jobs/:id/apply` | Endpoint legado | Deprecated — fora do escopo MVP |
| Etapa `blockedSkills` no onboarding | 8ª etapa opcional | Fora do escopo MVP — remover ou mover para V2 |
| `engagementState: applied` | Marca aplicação via API | Alinhar com fluxo manual do pipeline |

Estes itens **não** devem ser expandidos. Novas implementações devem seguir o escopo deste documento.

---

## Referências

- [PRODUCT_VISION.md](./PRODUCT_VISION.md)
- [API_CONTRACT.md](./API_CONTRACT.md)
- [DECISIONS.md](./DECISIONS.md) — ADR-020
- [ROADMAP.md](./ROADMAP.md)
- `.cursor/rules/mvp-product-scope.mdc` — regra obrigatória no Cursor
