# PairFit Mobile — Living Blueprint (agents.md)

## Role & Philosophy
You are building the official PairFit native mobile client (iOS & Android) with Expo SDK 57 + Expo Router. Follow this file strictly. Protect working screens. Build feature by feature.

## Overview
**PairFit** is a wardrobe outfit-recommendation app: users register once, upload clothing photos (camera/gallery), and the backend extracts dominant colors with Sharp. Tapping any item ("Style This") ranks matches from their own wardrobe with color-theory scores (0–99) + plain-English reasons.

## Stack
- Framework: Expo SDK 57 (managed workflow) + Expo Router (file-based navigation with tabs)
- Language: TypeScript
- Backend & Auth: Supabase Auth via `@supabase/supabase-js` + `@react-native-async-storage/async-storage`
- Media: `expo-image-picker` (Camera & Gallery)
- Icons: `lucide-react-native`
- API Base: `https://jtgohjakh6gsnaiabtdmlyyn.152.67.25.227.sslip.io` (customizable via `EXPO_PUBLIC_API_BASE_URL`)

## Architecture & Rules (Non-Negotiable)
1. **The Backend is the Single Authority**:
   - Color extraction is performed server-side with Sharp during upload. The mobile app never extracts or computes colors on-device; it only renders the swatch + hex.
   - Outfit recommendations and pairing scores are computed by `server.js` (`GET /api/recommend/:itemId`). Clients display results; they never compute them.
2. **The `/sb` HTTPS Proxy**:
   - The Supabase gateway is HTTP-only. Express reverse-proxies it at same-origin `/sb/*`.
   - Never hardcode the Supabase URL or anon key. At app startup, `GET <API_BASE>/api/config` $\rightarrow$ `{ supabaseUrl, supabaseAnonKey }`.
   - Initialize Supabase with `config.supabaseUrl` and `config.supabaseAnonKey`.
3. **Security**:
   - Never commit or expose `SUPABASE_SERVICE_ROLE_KEY` to client code.
   - Client sends Supabase JWT in `Authorization: Bearer <session.access_token>` on all `/api/*` calls.
4. **Categories (12 in 4 groups)**:
   - `top`: `tshirt`, `shirt`, `top`, `kurta`, `sweater`
   - `bottom`: `jeans`, `pants`, `skirt`, `shorts`
   - `outer`: `jacket`, `hoodie`, `blazer`
   - `onepiece`: `dress`, `jumpsuit`
   - No footwear or accessories in v1.
5. **Freemium Limit**:
   - 30 items for Free users (`<count> / 30 items (Free plan)`).
   - Item 31 upload triggers `HTTP 402 { error, upgrade: true }` $\rightarrow$ surface the upgrade paywall sheet.
6. **Two-Tap Delete UX**:
   - Two-tap inline confirmation: First tap arms button ("Tap again to confirm remove", auto-disarms after 4s), second tap executes `DELETE /api/items/:id`. No native alert popups.
7. **Design Aesthetics**:
   - 2026 luxury fashion-tech startup aesthetic.
   - Light mode first: Canvas `#FAF9F6`, card surfaces `#FFFFFF`, obsidian pill buttons `#111111`.
   - 20px card radius, full-pill action buttons (`rounded-full`), soft floating elevation.
