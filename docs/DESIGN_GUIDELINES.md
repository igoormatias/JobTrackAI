# JobTrack AI — Design Guidelines

Diretrizes visuais oficiais para interface, marca e experiência do produto.

## Identidade visual

### Conceito

A marca comunica **evolução profissional**, **organização** e **inteligência artificial** com estética minimalista inspirada em produtos como Linear, Vercel e Clerk — sem copiar layouts.

### Logo

| Asset | Caminho | Uso |
|-------|---------|-----|
| Logo principal (dark) | `public/brand/logo.svg` | Fundos escuros, login, app shell |
| Logo light | `public/brand/logo-light.svg` | Fundos claros |
| Logo compacta (mark) | `public/brand/logo-mark.svg` | Avatares, loading, espaços reduzidos |
| Monocromática | `public/brand/logo-mono.svg` | Contextos de cor única |
| App icon | `public/brand/icon.svg` | Favicon, PWA |
| Apple Touch Icon | `public/brand/apple-touch-icon.svg` | iOS home screen |

### Componente

Use `JobTrackLogo` de `@/components/brand`:

```tsx
<JobTrackLogo variant="full" theme="dark" priority />
<JobTrackLogo variant="mark" theme="dark" />
```

Props: `variant` (`full` | `mark`), `theme` (`dark` | `light` | `mono`).

### Paleta

Tokens em `src/styles/globals.css` e `tokens.css`. Primária: azul → índigo → violeta (`#3B82F6` → `#6366F1` → `#8B5CF6`).

## Login (v2)

- Layout responsivo: auth card primeiro no mobile (`order-1`), hero à esquerda no desktop
- 4 product preview cards (Dashboard, Pipeline, IA, Calendário) em grid 2×2
- Loading mantém skeleton do grid (`LoginPageSkeleton`)
- Assets PNG: `pnpm brand:generate` (icon-192, icon-512, apple-touch-icon, og-image)
- Páginas legais: `/terms`, `/privacy`

## Motion

- Framer Motion apenas em entrada de página e hover de cards/botões.
- Evitar animações contínuas pesadas; respeitar `prefers-reduced-motion` quando aplicável.

## Acessibilidade

- Contraste AA em textos e botões.
- `aria-live` em loading e erros de login.
- Navegação por teclado em todos os controles interativos.
- Landmarks: `main`, `footer`, `nav`.

## Referências

- `frontend/src/features/auth/` — login e loading
- `frontend/src/lib/seo/site-config.ts` — metadata e OG
- `docs/PRODUCT_VISION.md` — visão do produto
