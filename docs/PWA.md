# JobTrack AI — PWA

## Estado atual (Etapa 21)

- `app/manifest.ts` — nome, ícones, `display: standalone`, theme color
- Ícones SVG/PNG em `frontend/public/brand/`
- `theme-color` via viewport metadata

## Não incluído nesta etapa

- Service worker offline
- Install prompt customizado
- Push notifications nativas

Roadmap V2.1: `next-pwa` ou Workbox para cache de assets estáticos.

## Validação

Chrome DevTools → Application → Manifest → verificar ícones 192/512 e `start_url`.
