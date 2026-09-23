# PairFit — "What goes with what" wardrobe app

**Problem:** People own lots of clothes (jeans, tops, shirts, tees…) but can't decide
what goes with what.

**Solution:** User registers once → uploads photos of every clothing item →
clicks any item ("Style This") → the app recommends matching items using
color theory, with a score and plain-English reasons.

## Why a backend (not local-first)

- The wardrobe lives on the **server** (`db.json` + `uploads/<userId>/`), not in the browser.
- Refresh, cache-clear, incognito, new phone — login and everything is back.
- Multi-device by default: add clothes on laptop, check matches on phone.

## Run it

```bash
cd pairfit
npm install
node server.js        # or: npm start
# open http://localhost:3000
```

Register an account, add clothes (photo + category), then open **Style This**,
tap any item (e.g. your jeans) and see ranked top recommendations.

## How the matching works (`server.js`)

1. **Color detection** — on upload, the browser samples the photo's center region
   via canvas and stores dominant color as hex + HSL.
2. **Category pairing** — tops pair with bottoms, outerwear layers over both,
   one-pieces pair with outerwear. Same-category items never pair.
3. **Color theory scoring (0–100):**
   - Neutrals (black/white/grey/beige) → 88, "clean and safe"
   - Complementary hues (opposite on the wheel) → 92, "bold contrast that pops"
   - Analogous hues (neighbors) → 88, "blend well"
   - Monochrome (same hue, different shade) → 87
   - Triadic → 82 · Clashing → 58 · Too matchy → 62
   - Bonuses: light–dark contrast (+4), denim rule (+4, jeans go with everything)

## API

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | `{name, email, password}` → `{token, user}` |
| POST | `/api/auth/login` | — | `{email, password}` → `{token, user}` |
| GET | `/api/auth/me` | JWT | Current user |
| GET | `/api/items` | JWT | User's wardrobe |
| POST | `/api/items` | JWT | Multipart: `photo`, `name`, `category`, `colorHex`, `h`, `s`, `l` |
| DELETE | `/api/items/:id` | JWT | Remove item (+ its photo) |
| GET | `/api/recommend/:itemId` | JWT | Ranked matches with scores + reasons |

Auth = `Authorization: Bearer <token>` header.

## Production checklist

- [ ] Move `JWT_SECRET` to env (already supported via `process.env.JWT_SECRET`)
- [ ] Swap `db.json` → Postgres, `uploads/` → S3/R2 object storage
- [ ] Add rate limiting + HTTPS
- [ ] Mobile app wrapper (Capacitor) or PWA manifest
- [ ] Nice-to-haves: occasion filter (casual/office/party), saved outfits,
      pattern detection, "full outfit generator" (top + bottom + layer in one tap)
