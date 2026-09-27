# PairFit — Agent Instructions

PairFit is a wardrobe outfit-recommendation app: users register once, upload clothing photos
(server-side storage, never local-only), tap any item and get ranked matches from their own
wardrobe with color-theory scores + reasons.

## Stack

- API: Node.js + Express (`server.js`) — color-theory engine, freemium checks, uploads
- Backend services: self-hosted Supabase (Auth, Postgres, Storage) — already deployed
- Web client: vanilla JS SPA in `public/` (currently served via Express static)
- Color extraction: `sharp`, server-side only

## Commands

- `npm install` → `npm start` (port 3000)

## Architecture rules (do not break)

1. The backend is the single authority for color extraction and recommendations.
   Clients display results; they never compute them.
2. `server.js` uses the Supabase **service-role** key and enforces per-user isolation itself.
   Never put the service-role key in frontend/mobile code — clients use the anon key + user JWT.
3. Storage paths MUST stay `{user_id}/{uuid}.jpg` — RLS and storage policies depend on the
   first folder segment being the user's id.
4. Photo reads go through server-generated signed URLs (7-day TTL), bucket `wardrobe` (private).
5. Required env vars: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`,
   `FREE_ITEM_LIMIT` (30), `PORT`. Server exits at boot if URL/service key are missing.

## API (base = Express server)

- `GET /api/config` → `{ supabaseUrl, supabaseAnonKey }` (public, no auth)
- All others need `Authorization: Bearer <Supabase user JWT>`:
- `GET /api/me` → `{ id, email, name, isPro, itemCount, itemLimit }`
- `GET /api/items` → newest-first items with signed `photoUrl`
- `POST /api/items` (multipart: `photo`, `name`, `category`) → created item;
  free users at/over the limit get `402 { error, upgrade: true }` — surface an upgrade prompt
- `DELETE /api/items/:id` → `{ ok: true }` (deletes DB row AND storage file)
- `GET /api/recommend/:itemId` → `{ item, recommendations: [{ item, score, reasons[] }] }`

## Color engine (`server.js`)

Category groups (top/bottom/outer/onepiece) with pairing rules; neutral → 88;
hue-distance scoring: complementary 92, monochrome 87, analogous 88, triadic 82,
too-matchy 62, clashing 58; +4 light-dark contrast bonus, +4 denim bonus; cap 99.
Keep scoring behavior identical when modifying.

## Secrets

Never commit keys. Live credentials live outside this repo.
Deploy runbook: `docs/SUPABASE_COOLIFY.md`.
