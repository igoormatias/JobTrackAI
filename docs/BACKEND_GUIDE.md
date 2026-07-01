# JobTrack AI — Backend Guide

Guia de convenções e padrões do backend Express.

## Estrutura de módulo

```
modules/<feature>/
  controllers/     # HTTP handlers (thin)
  services/        # Regras de negócio
  repositories/    # Persistência (in-memory ou Prisma)
  dto/               # Tipos de request/response
  schemas/           # Validação Zod
  types/             # Tipos de domínio
  routes/            # Express Router
  index.ts           # Exports públicos
```

## Fluxo de requisição

```
Route → Controller → Service → Repository
```

- Controllers validam entrada com Zod e mapeiam erros via `next(error)`
- Services não conhecem Express
- Repositories encapsulam acesso a dados

## Referência: módulo Pipeline (Etapa 10)

| Arquivo | Responsabilidade |
|---------|------------------|
| `pipeline.routes.ts` | `GET /`, `PATCH /:id/status`, `PATCH /:id/favorite`, `DELETE /:id`, `GET /:id/timeline` |
| `pipeline.service.ts` | Filtros, KPIs, move stage, timeline |
| `pipeline.repository.ts` | Applications in-memory (seed); pronto para Prisma |

### Endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/pipeline` | Board (colunas + KPIs + filtros via query) |
| `PATCH` | `/pipeline/:id/status` | Move estágio; append timeline |
| `PATCH` | `/pipeline/:id/favorite` | Toggle favorito do job |
| `PATCH` | `/pipeline/:id/archive` | Arquiva candidatura |
| `DELETE` | `/pipeline/:id` | Remove candidatura |
| `GET` | `/pipeline/:id/timeline` | Eventos da candidatura |

Registrar rotas em `src/routes/index.ts`:

```typescript
router.use("/pipeline", createPipelineRoutes());
```

Sub-rotas com `/:id/*` devem ser registradas antes de rotas genéricas conflitantes.

## Testes

Colocados em `services/*.test.ts` ao lado do service. Usar repositórios isolados por teste quando necessário.

## Referências

- [ARCHITECTURE.md](./ARCHITECTURE.md)
- [DECISIONS.md](./DECISIONS.md)
