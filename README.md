# PairFit — "What goes with what" wardrobe app

**Problem:** People own lots of clothes (jeans, tops, shirts, tees…) but can't decide
what goes with what.

**Solution:** User registers once → uploads photos of every clothing item →
clicks any item ("Style This") → the app recommends matching items using
color theory, with a score and plain-English reasons.

## Stack

| Layer | Tech |
|---|---|
| Auth | Supabase Auth (email/password + Google OAuth) |
| Database | Supabase Postgres (`profiles`, `items`) |
| Photo storage | Supabase Storage (private `wardrobe` bucket, signed URLs) |
| API | Express (`server.js`) — color-theory engine, freemium limits, server-side color extraction via `sharp` |
| Web app | Static HTML/CSS/JS (`public/`) + supabase-js |
| Landing page | Astro on Cloudflare Pages (separate, per SOP playbook) |
| Mobile | React Native + Expo (planned, consumes the same API) |
| Hosting | Coolify on own server (API + Supabase via Docker); Cloudflare Pages for static sites |

**Deploy:** see [`docs/SUPABASE_COOLIFY.md`](docs/SUPABASE_COOLIFY.md) for the full runbook.

## Why a backend (not local-first)

- The wardrobe lives on the **server** (Supabase), not in the browser.
- Refresh, cache-clear, incognito, new phone — login and everything is back.
- Multi-device by default: add clothes on laptop, check matches on phone.

## Run it locally

```bash
cd pairfit
npm install
# point at a Supabase project (self-hosted or cloud):
export SUPABASE_URL=...
export SUPABASE_ANON_KEY=...
export SUPABASE_SERVICE_ROLE_KEY=...
npm start
# open http://localhost:3000
```

Or with Docker (what Coolify uses):

```bash
docker build -t pairfit .
docker run -p 3000:3000 --env-file .env pairfit
```

First run `supabase/schema.sql` in your Supabase SQL editor.

## How the matching works (`server.js`)

1. **Color detection** — on upload, the server samples the photo's center region
   with `sharp` and stores the dominant color as hex + HSL. One source of truth
   for web + Android + iOS.
2. **Category pairing** — tops pair with bottoms, outerwear layers over both,
   one-pieces pair with outerwear. Same-category items never pair.
3. **Color theory scoring (0–100):**
   - Neutrals (black/white/grey/beige) → 88, "clean and safe"
   - Complementary hues (opposite on the wheel) → 92, "bold contrast that pops"
   - Analogous hues (neighbors) → 88, "blend well"
   - Monochrome (same hue, different shade) → 87
   - Triadic → 82 · Clashing → 58 · Too matchy → 62
   - Bonuses: light–dark contrast (+4), denim rule (+4, jeans go with everything)

## Freemium

- Free plan: `FREE_ITEM_LIMIT` items (default 30). The 31st upload returns
  HTTP 402 with `upgrade: true`.
- Pro plan: `profiles.is_pro = true` → unlimited items. (Payments: Razorpay /
  Stripe on web, In-App Purchase on mobile — to be wired.)

## API

Auth = Supabase JWT in the `Authorization: Bearer <token>` header
(obtained via supabase-js on the client).

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/config` | — | `{supabaseUrl, supabaseAnonKey}` for the frontend |
| GET | `/api/me` | JWT | `{id, email, name, isPro, itemCount, itemLimit}` |
| GET | `/api/items` | JWT | User's wardrobe (signed photo URLs) |
| POST | `/api/items` | JWT | Multipart: `photo`, `name`, `category` → server extracts color |
| DELETE | `/api/items/:id` | JWT | Remove item (+ its photo) |
| GET | `/api/recommend/:itemId` | JWT | Ranked matches with scores + reasons |

## Roadmap

- [ ] Occasion filter (casual/office/party), saved outfits
- [ ] "Full outfit generator" (top + bottom + layer in one tap)
- [ ] Pattern/print-aware garment analysis
- [ ] Expo mobile app (same API)
- [ ] Pro payments (Razorpay/Stripe web, IAP mobile)
