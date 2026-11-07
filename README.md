# Union Lab — Frontend

Bot list e hub da comunidade Union Lab: vitrine de bots do Discord, votos e avaliações, unicoins, loja de banners, VIP, outdoor, corridas, eventos e snippets de código.

Feito com Next.js 16 (App Router), React 19 e Tailwind CSS 3.

## Rodando localmente

1. Copie `.env.example` para `.env.local` e ajuste as variáveis:
   - `NEXT_PUBLIC_API_URL` — URL do backend (Fastify). Padrão: `http://localhost:80`.
   - `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` — opcional; o backend também pode fornecer via `/api/public/config`.
2. Suba o backend.
3. Instale e rode:

```bash
npm install
npm run dev
```

Abra http://localhost:3000.

## Como está organizado

- `src/app/` — rotas. Os `page.tsx` cuidam de metadata/SEO e dados iniciais no servidor; os `*Client.tsx` ligam o contexto do app às views.
- `src/views/` — telas de cada página (client components).
- `src/components/` — componentes compartilhados (`ui/` são os primitivos).
- `src/context/AppContext.tsx` — usuário logado, token, toasts, modal de celebração, menu mobile.
- `src/lib/api.ts` — helpers de fetch (`fetchJson`, `parseJson`) e login (`startLogin`).

Todas as chamadas para `/api/*` no navegador passam pelo rewrite em `next.config.ts` até o backend.

## Scripts

- `npm run dev` — servidor de desenvolvimento
- `npm run build` / `npm start` — build e servidor de produção
- `npm run lint` — ESLint
