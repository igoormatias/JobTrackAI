# JobTrack AI — SEO

## Implementação

- **Central:** `frontend/src/lib/seo/`
- **Site config:** `NEXT_PUBLIC_SITE_URL` (produção: `https://jobtrack-ai-career.vercel.app`)
- **Root layout:** OG, Twitter Card, icons, JSON-LD Organization + WebSite
- **Por página:** `generateMetadata` em dashboard, jobs, pipeline, account, login, job details

## JSON-LD

- Root: `WebSite`, `Organization`
- Job details: `JobPosting` (title, company, location quando disponível)

## Arquivos

- `app/robots.ts` — allow `/login`, disallow rotas autenticadas
- `app/sitemap.ts` — home + login
- `public/brand/og-image.svg` — preview social (1200×630)

## Checklist pós-deploy

1. [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) — OG image
2. [Twitter Card Validator](https://cards-dev.twitter.com/validator)
3. Google Rich Results Test — JSON-LD JobPosting em `/jobs/[id]`
