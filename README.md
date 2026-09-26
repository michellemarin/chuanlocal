# QR Code Magic

A Thai vendor opens a link on their phone, types their menu, services, or products in Thai, and prints a QR sign. Tourists scan it with their phone camera and read the list, including today's special, in their own language.

- **Vendor UI:** Thai only. No accounts; each shop has a private edit link (`/edit/<secret>`).
- **Tourist page:** `/m/<slug>`. The language comes from the phone's settings, and there's a switcher (EN, 中文, 한국어, 日本語, RU, DE, FR, ไทย).
- **Translation:** Cloudflare Workers AI (SEA-LION, with Llama 3.3 and m2m100 as fallbacks). It runs once on save and is cached in D1, so tourist views make no AI calls. Swap providers in `src/translate.js`.

## Stack
Cloudflare Workers + Hono, D1 (SQLite), Workers AI, and `qrcode` for the SVG sign.

## Develop
```bash
npm install
npm run db:migrate:local
npx wrangler dev          # AI calls need a Cloudflare login / CLOUDFLARE_API_TOKEN
```

## Deploy
```bash
npm run db:migrate        # apply migrations to the remote D1 database
npm run deploy
```

## Routes
| Route | Who | What |
|---|---|---|
| `/` | vendor | Create a shop (type + name) |
| `/edit/:secret` | vendor | Edit items, set ⭐ today's special, mark sold out, save and translate |
| `/sign/:secret` | vendor | Printable A4 QR sign |
| `/m/:slug` | tourist | Translated menu (`?lang=xx` to force a language) |
