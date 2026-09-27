# PairFit on Coolify + Supabase — deploy runbook

Target architecture:

```
getpairfit.com            -> Cloudflare Pages (Astro landing page, see SOP)
app.getpairfit.com        -> Cloudflare Pages (static frontend in public/)
api.getpairfit.com        -> Coolify on your server (this Express API, Docker)
                            + Supabase on Coolify (Auth + Postgres + Storage)
```

Your Oracle free-tier box (12 GB RAM) comfortably runs both.

---

## Step 1 — Deploy Supabase on Coolify

1. Coolify dashboard -> **New Resource -> Service -> Supabase** (one-click).
2. Wait until all containers are healthy (2–4 minutes).
3. Open the Supabase dashboard URL Coolify gives you
   (usually `https://supabase.<your-coolify-domain>`) and log in with the
   credentials shown in Coolify -> Supabase -> Credentials.
4. **Take a snapshot/backup of the server now** — self-hosted Supabase upgrades
   can break; always snapshot first.

## Step 2 — Run the schema

1. Supabase dashboard -> **SQL Editor -> New query**.
2. Paste the entire contents of `supabase/schema.sql` and **Run**.
3. Verify: Table Editor should show `profiles` and `items`; Storage should show
   a private bucket named `wardrobe`.

## Step 3 — Auth settings (Supabase dashboard)

1. **Authentication -> Providers -> Email**:
   - For MVP: turn **OFF** "Confirm email" (users can register and use the app
     immediately). Turn it back ON before public launch.
   - Before launch, set **SMTP Settings** (e.g. Resend free tier) so
     confirmation / password-reset emails actually send.
2. **Google login (recommended, big signup boost)**:
   - Google Cloud Console -> create OAuth 2.0 Client ID (Web application).
   - Authorized redirect URI: `<your-supabase-url>/auth/v1/callback`
   - Supabase dashboard -> Authentication -> Providers -> Google -> enable,
     paste Client ID + Client Secret.
3. **URL Configuration**: set Site URL to `https://app.getpairfit.com`
   (or wherever the frontend lives) so OAuth redirects land correctly.

## Step 4 — Copy the API keys

Supabase dashboard -> **Project Settings -> API**:

- `Project URL` -> `SUPABASE_URL`
- `anon public` key -> `SUPABASE_ANON_KEY`
- `service_role` key -> `SUPABASE_SERVICE_ROLE_KEY` (secret — never expose in frontend)

## Step 5 — Deploy the API on Coolify

1. Coolify -> **New Resource -> Application** -> connect GitHub repo
   `techfireco/pairfit`, branch `main`.
2. Build pack: **Dockerfile** (repo root already has one).
3. Environment variables:

   | Variable | Value |
   |---|---|
   | `SUPABASE_URL` | from Step 4 |
   | `SUPABASE_ANON_KEY` | from Step 4 |
   | `SUPABASE_SERVICE_ROLE_KEY` | from Step 4 (mark as secret) |
   | `FREE_ITEM_LIMIT` | `30` |
   | `PORT` | `3000` |

4. Deploy. The container listens on port 3000.
5. **Domains**: add `api.getpairfit.com` to the app in Coolify (it provisions
   Let's Encrypt HTTPS automatically).

## Step 6 — Deploy the frontend

Option A (recommended): Cloudflare Pages from the same repo, serving `public/`
as a static site, mapped to `app.getpairfit.com`. The frontend fetches
`/api/config`... note: on Pages it must call the API domain, so either:

- serve the frontend **from the API itself** (it already serves `public/`
  statically — zero extra work, just open `https://api.getpairfit.com`), or
- set the frontend's API base to `https://api.getpairfit.com` (small change
  in `public/app.js`: prefix API paths).

For MVP, Option A-first-half is fine: **use `api.getpairfit.com` as the web app
too** — it serves both UI and API. Split later when traffic grows.

## Step 7 — Smoke test

1. Open `https://api.getpairfit.com` -> register (or Continue with Google).
2. Add 2–3 clothing items (photo + category).
3. **Style This** -> tap an item -> ranked recommendations appear.
4. Upload a 31st item on a free account -> expect HTTP 402 "Free plan limit reached".

## Step 8 — Backups (do not skip)

1. Coolify -> Supabase service -> **Backups**: enable scheduled Postgres dumps.
2. The `wardrobe` storage bucket lives on the server disk — include that volume
   in your server snapshot routine.

## Troubleshooting

- `Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY` in logs -> env vars not set
  on the Coolify app (Step 5.3).
- Google button does nothing -> Google provider not enabled in Supabase (Step 3.2)
  or Site URL mismatch.
- Photos fail to upload -> check the `wardrobe` bucket exists and the
  `schema.sql` storage policy ran.
- `sharp` install issues on Alpine are rare (prebuilt binaries); if the Docker
  build fails, switch the Dockerfile base to `node:20-slim`.
