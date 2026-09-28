# PairFit Mobile UI Design System & Prompt Specification

## 1. Product Summary
**PairFit** is a wardrobe app that answers "What should I wear with this?". Users upload photos of their clothes once (auto-extracting dominant color via Sharp server-side), then tap any item to see ranked best matches from their own closet using color theory with plain-English reasons for every pairing.

## 2. Core User Jobs
1. Sign up / log in with email and password via Supabase Auth.
2. View wardrobe grid with plan status badge (`<count> / 30 items (Free plan)`).
3. Add a clothing item with camera or gallery photo + name + 12 categories in 4 pairing groups.
4. Auto-detect dominant color via server-side Sharp and display swatch + hex code.
5. Tap "Style This" on any item to view ranked matching items across opposite categories.
6. Read plain-English styling rationale (Complementary, Monochrome, Analogous, Triadic, Neutral Anchor) with /100 score.
7. Manage wardrobe with 2-tap inline delete confirmation.
8. View profile with plan usage, Terms of Service, Privacy Policy, and 2-tap Delete Account.
9. Upgrade prompt modal when free item limit (30 items, HTTP 402) is reached.

## 3. Design Style & Philosophy
- **Aesthetic**: 2026 luxury fashion-tech startup, minimal Scandinavian/Tokyo editorial vibe.
- **Theme**: Light-mode first with generous, airy spacing and clean card surfaces.
- **Surfaces & Radii**:
  - Cards: `18px - 22px` border radius
  - Buttons & Chips: `9999px` (Pill-shaped)
  - Modals & Sheets: `24px - 28px` top radius
- **Shadows**: Soft, multi-layered ambient drop shadows (`shadow-sm` / `0 4px 20px -2px rgba(0,0,0,0.06)`).
- **Typography**:
  - Display: Editorial serif / refined sans-serif (e.g., Cormorant / New York / Playfair for hero headlines)
  - UI & Body: Inter / SF Pro with crisp tracking and strong weight contrast (Regular 400, Medium 500, SemiBold 600, Bold 700).

## 4. Color Palette
- **Backgrounds**: `#FFFFFF` (pure white cards), `#FAF9F6` (warm canvas background), `#F4F4F0` (secondary surface)
- **Primary / Brand**: `#111111` (editorial obsidian for primary CTA buttons and dark chips)
- **Accent**: `#3A86FF` / `#4F46E5` (subtle indigo/ocean accent for active tabs and highlights)
- **Harmony Tones**:
  - Score Badge: `#10B981` (High 85-99%), `#F59E0B` (Medium 70-84%), `#6B7280` (Low <70%)
  - Neutrals: `#18181B` (headings), `#52525B` (body/subhead), `#A1A1AA` (subtle captions), `#E4E4E7` (borders)
  - Color Swatches: Dynamic hex from Sharp API response (`item.colorHex`).

## 5. Screen Inventory
1. **Splash Screen**: Minimalist wordmark "PairFit" centered, subtitle "Your closet, curated."
2. **Onboarding / Welcome**: Full-height editorial photo hero, headline "What should I wear with this?", value proposition cards, pill button "Get Started".
3. **Auth Screen**:
   - Clean tabs: "Sign In" vs "Create Account"
   - Email & password inputs with clean borders and active focus states
   - Primary action: Obsidian pill "Sign In" / "Create Account"
   - Social row: Apple Sign-In (primary) + Google OAuth (stretch)
   - Inline error container with soft red banner
4. **Closet / Wardrobe Tab**:
   - Sticky header: "Closet", subtitle with Plan badge `12 / 30 items (Free plan)`
   - Category filter pills: All, Tops, Bottoms, Outerwear, One-Piece
   - 2-column masonry/grid of clothing cards:
     - Edge-to-edge photo with rounded 16px corners
     - Item name
     - Category chip + extracted color swatch dot + hex code (`#2C3E50`)
     - 2-tap inline delete button ("Remove" -> "Tap again to confirm remove" auto-disarming after 4s)
   - Floating Action Button (FAB) or Header CTA: "+ Add Item"
5. **Add Clothing Item Modal**:
   - Camera & Gallery dual trigger buttons
   - Selected photo preview with instant thumbnail
   - Server-extracted color preview badge (once processed)
   - Item name text input
   - 12 category chips grouped into:
     - Top: T-Shirt, Shirt, Top, Kurta, Sweater
     - Bottom: Jeans, Pants, Skirt, Shorts
     - Outerwear: Jacket, Hoodie
     - One-Piece: Dress
   - Action: "Save to Closet" (triggers `POST /api/items`)
6. **Style This / Recommendations Tab**:
   - Anchor item selector carousel ("Pick an item to pair"): thumbnail + name
   - Active Anchor card hero at top with category & color swatch
   - "Ranked Matches" section header sorted by score descending
   - Match Card:
     - High-res photo of matching item from user's closet
     - Match title & category chip
     - Large circular score gauge or pill badge (e.g. `94/100`)
     - Harmony classification badge (e.g. "Complementary", "Analogous", "Neutral Anchor")
     - Plain-English styling reasons list (e.g. "Complementary colors — bold contrast that pops", "Good light-dark contrast")
7. **Profile & Account Screen**:
   - User email & avatar badge
   - Plan status & visual progress bar: `12 / 30 items used`
   - "Upgrade to Pro" card with unlimited items benefit
   - Legal compliance links: "Terms of Service" and "Privacy Policy" (in-app modal or webview)
   - Logout button
   - Danger zone: "Delete Account" with 2-tap confirmation calling Supabase delete
8. **Pro Paywall Modal / Bottom Sheet**:
   - Triggered automatically on 31st item upload (`HTTP 402 { error, upgrade: true }`)
   - Headline: "PairFit Pro — Unlimited Wardrobe"
   - Feature bullet points: Unlimited items, unlimited outfit styling, priority pairing engine
   - Pricing pill selection: Monthly ($9.99/mo) vs Annual ($49.99/yr - save 58%)
   - "Start Free Trial" primary button
   - "Restore Purchases" and terms footer
