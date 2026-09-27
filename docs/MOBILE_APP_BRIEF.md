# PairFit Mobile App Brief — Android + iOS (React Native + Expo)

This is the build brief for the PairFit mobile apps. The backend is **already live and QA-verified** — you are building a native client against it, not a new backend. Web client in `public/` is the behavior reference; `server.js` is the API contract source of truth.

---

## 1. What you're building

**PairFit** — "Upload your clothes. We tell you what goes with what."

- User registers once (account + wardrobe live on the server).
- User uploads clothing photos (camera or gallery).
- Server extracts the dominant color (Sharp) and stores a web-optimized copy.
- User taps any item ("Style This") → ranked matching items with color-theory scores (0–99) + plain-English reasons.
- Free plan: 30 items. Item 31 → paywall prompt (no payment processing in v1).

**v1 scope = feature parity with the web client.** Non-goals for v1: Pro payments, saved outfits, occasion filters, offline mode, push notifications.

---

## 2. Backend URLs

| What | URL |
|---|---|
| API base (production, live now) | `https://jtgohjakh6gsnaiabtdmlyyn.152.67.25.227.sslip.io` |
| API base (planned) | `https://api.getpairfit.com` (DNS not pointed yet) |
| Health/config probe | `GET <API_BASE>/api/config` |

**Hard rule: never hardcode the Supabase URL or anon key.** At app startup, `GET /api/config` → `{ supabaseUrl, supabaseAnonKey }` and use those. When the custom domain goes live, the app keeps working with zero code changes.

---

## 3. The `/sb` proxy — read this before touching Supabase

The Supabase gateway (Kong) is **HTTP-only**. The Express server reverse-proxies it at same-origin `/sb/*`:

- `/api/config` returns `supabaseUrl` = `https://<api-host>/sb` (already proxied, already HTTPS).
- Create the Supabase client with **that URL**: `createClient(config.supabaseUrl, config.supabaseAnonKey)`.
- Auth, REST, and Storage all work through the proxy (verified in production). The proxy forwards your anon key / user JWT untouched — RLS applies exactly as normal.
- **Why mobile must use it too:** iOS App Transport Security and Android (API 28+) block cleartext HTTP by default. The `/sb` URL is HTTPS, so no ATS/`usesCleartextTraffic` exceptions are needed.
- No realtime subscriptions are used — do not add any.

---

## 4. Auth flow (Supabase Auth via `supabase-js`)

```js
const cfg = await fetch(API_BASE + '/api/config').then(r => r.json());
const sb = createClient(cfg.supabaseUrl, cfg.supabaseAnonKey, {
  auth: { storage: AsyncStorage, autoRefreshToken: true, persistSession: true, detectSessionInUrl: false }
});
```

- **Register:** `sb.auth.signUp({ email, password, options: { data: { name } } })`
  - Email confirmation is **ON**. If `data.session` is null → show: "Account created! Check your email to confirm, then login." Do NOT auto-enter the app.
  - If `data.session` exists → enter app.
- **Login:** `sb.auth.signInWithPassword({ email, password })` → on success, enter app. Surface `error.message` on failure.
- **Session → API calls:** `const { data: { session } } = await sb.auth.getSession()` → `Authorization: Bearer <session.access_token>` on every `/api/*` request.
- **Logout:** `sb.auth.signOut()` → back to auth screen.
- **Google OAuth:** web has "Continue with Google". For mobile v1 this is **optional/stretch** — implement with `expo-web-browser` + `signInWithOAuth({ provider: 'google' })` only if the redirect scheme works cleanly in Expo; otherwise ship email/password first and add Google in v1.1.

---

## 5. API contract

Base: `<API_BASE>`. All `/api/*` (except `/api/config`) require `Authorization: Bearer <jwt>`.

| Method | Path | Body | Success | Errors |
|---|---|---|---|---|
| GET | `/api/config` | — | `{ supabaseUrl, supabaseAnonKey }` | — |
| GET | `/api/me` | — | `{ id, email, name, isPro, itemCount, itemLimit }` (`itemLimit` null when Pro) | 401 `{ error: 'Login required' }` / `'Session expired, please login again'` |
| GET | `/api/items` | — | `[ item ]` newest first | 401 |
| POST | `/api/items` | multipart: `photo` (file, ≤8 MB), `name` (string), `category` (value, required) | `item` (includes server-extracted `colorHex`) | 400 photo/category missing · **402 `{ error, upgrade: true }` when free limit reached** · 401 |
| DELETE | `/api/items/:id` | — | `{ ok: true }` | 401 · 404 `{ error: 'Item not found' }` |
| GET | `/api/recommend/:itemId` | — | `{ item, recommendations: [ { item, score, reasons[] } ] }` sorted desc | 401 · 404 |

`item` shape:

```json
{
  "id": "uuid",
  "name": "Red Tee",
  "category": "tshirt",
  "colorHex": "#c81e1e",
  "h": 0, "s": 82, "l": 45,
  "photoUrl": "https://<api-host>/sb/storage/v1/object/sign/wardrobe/...",
  "createdAt": "2026-09-28T..."
}
```

Notes:

- **Backend is the color authority.** Never compute colors on-device; use `colorHex` from the server.
- `photoUrl` is a **signed URL valid 7 days**. Don't cache it long-term — refetch `/api/items` to refresh.
- `POST /api/items` returns `402` with `upgrade: true` at the free limit → show an upgrade prompt (no checkout in v1).
- Uploads: compress client-side if needed, but the server re-encodes to ≤1600px JPEG anyway.

---

## 6. Categories

Picker values (submit the `value`, display the label):

| value | label | group |
|---|---|---|
| `tshirt` | T-Shirt | top |
| `shirt` | Shirt | top |
| `top` | Top | top |
| `kurta` | Kurta | top |
| `sweater` | Sweater | top |
| `jeans` | Jeans | bottom |
| `pants` | Pants / Trousers | bottom |
| `skirt` | Skirt | bottom |
| `shorts` | Shorts | bottom |
| `jacket` | Jacket | outer |
| `hoodie` | Hoodie | outer |
| `dress` | Dress | onepiece |

Recommendation pairing rule (server-side, for understanding only — don't reimplement): items pair **across** groups (top↔bottom, top/bottom↔outer, onepiece↔outer). Two items in the same group (e.g. two tops) never appear as matches. So a matches list can legitimately be short — that's correct behavior, not a bug.

---

## 7. Screens (v1)

1. **Auth** — Login / Register tabs, email + password (+ name on register), "Continue with Google" (stretch, see §4), error text area.
2. **My Closet (tab)** — plan badge (`"<count> / 30 items (Free plan)"`), "Add a clothing item" form (photo picker → camera/gallery, name field, category picker, Add button), grid of item cards (photo, name, category chip, color swatch + hex, Remove button).
3. **Style This (tab)** — "Pick an item, get matches" → tappable item list → matches panel: each match shows photo, name, **score /100**, and reason strings.
4. **Logout** — in header/nav.

**Delete UX (match the web):** two-tap inline confirmation — first tap arms the button ("Tap again to confirm remove", auto-disarms after ~4s), second tap calls `DELETE`. Do NOT use a native alert/confirm dialog (it's unreliable in webviews/automation).

---

## 8. Suggested stack

- **Expo** (managed workflow) + **Expo Router** (tabs) — one codebase, Android + iOS.
- `@supabase/supabase-js` (v2) + `@react-native-async-storage/async-storage` + `react-native-url-polyfill` (required: `import 'react-native-url-polyfill/auto'` before creating the client).
- `expo-image-picker` for camera/gallery (`MediaTypeOptions.Images`).
- `expo-secure-store` if you want the session outside Supabase's own storage (optional — Supabase + AsyncStorage is fine for v1).
- `eas` (EAS Build) for Android APK/AAB + iOS builds.

`app.json`/`app.config.js`: read the API base from an env var / `extra` (e.g. `EXPO_PUBLIC_API_BASE_URL`), defaulting to the production URL in §2. No secrets in the bundle — the anon key arrives via `/api/config` at runtime.

---

## 9. Security rules (non-negotiable)

- The **service_role key must never** appear in the app, in git, or in build logs.
- Only the **anon key** (from `/api/config`) ships to the client — it is safe by design; RLS enforces per-user isolation.
- Never log access tokens. Don't put tokens in URLs.
- Private photo path format `{user_id}/{uuid}.jpg` is server-managed — don't construct it client-side.

---

## 10. Reference files in this repo

- `server.js` — API contract source of truth (endpoints, validation, freemium gate, proxy).
- `public/app.js` + `public/index.html` — web client behavior reference (flows, copy, delete UX).
- `supabase/schema.sql` — DB schema (profiles, items, RLS).

---

## 11. Definition of done (acceptance checklist)

- [ ] Cold start fetches `/api/config`, creates Supabase client with the `/sb` URL — no hardcoded Supabase host.
- [ ] Register → "check your email" state when unconfirmed; login → closet with `0 / 30 items (Free plan)`.
- [ ] Add item via camera AND gallery: card appears with photo, name, category chip, color swatch/hex matching server response.
- [ ] Style This → tap item → matches sorted by score desc, each with score + reason(s).
- [ ] Delete → two-tap confirm → item disappears → count decrements → survives app restart.
- [ ] Kill + relaunch app → still logged in, wardrobe intact (server-backed).
- [ ] 31st item on free plan → `402` → upgrade prompt shown, no crash.
- [ ] Missing photo / missing category → inline validation error, no request sent.
- [ ] Expired/invalid session → user is routed back to login with a clear message.
- [ ] Works on a real Android device and a real iPhone (or Expo Go for dev, EAS build for release).
- [ ] No `http://` Supabase calls anywhere (verify: no ATS/cleartext exceptions needed).
