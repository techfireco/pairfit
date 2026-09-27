// PairFit API — Express + Supabase (self-hosted on Coolify).
//
// Architecture:
//   Supabase -> Auth (email/password + Google OAuth), Postgres (profiles, items),
//               Storage (wardrobe photos, private bucket, signed URLs)
//   Express  -> color-theory recommendation engine, freemium limit checks,
//               server-side color extraction (sharp), static frontend.
//
// Why a backend (not local-first):
//   - User registers once -> account + wardrobe live on the SERVER.
//   - Refresh, cache clear, new phone, new browser — login and everything is back.

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';
const FREE_ITEM_LIMIT = Number(process.env.FREE_ITEM_LIMIT || 30);
const BUCKET = 'wardrobe';
const SIGNED_URL_TTL = 7 * 24 * 3600; // 7 days

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY env vars — see docs/SUPABASE_COOLIFY.md');
  process.exit(1);
}

// service_role bypasses RLS; the API enforces per-user isolation itself.
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Public config for the frontend (anon key is safe to expose by design).
app.get('/api/config', (req, res) => {
  res.json({ supabaseUrl: SUPABASE_URL, supabaseAnonKey: SUPABASE_ANON_KEY });
});

// ---------------------------------------------------------------------------
// Color-theory matching engine (unchanged)
// ---------------------------------------------------------------------------
const CATEGORY_GROUPS = {
  top: ['tshirt', 'shirt', 'top', 'kurta', 'sweater'],
  bottom: ['jeans', 'pants', 'skirt', 'shorts'],
  outer: ['jacket', 'hoodie', 'blazer'],
  onepiece: ['dress', 'jumpsuit'],
};

function groupOf(cat) {
  for (const [g, list] of Object.entries(CATEGORY_GROUPS)) {
    if (list.includes(cat)) return g;
  }
  return 'top';
}

// Which garment groups can pair with which (top<->bottom, layers over anything)
function pairsWith(g1, g2) {
  if (g1 === g2) return false;
  const pairs = new Set([
    'top|bottom', 'bottom|top',
    'top|outer', 'outer|top',
    'bottom|outer', 'outer|bottom',
    'onepiece|outer', 'outer|onepiece',
  ]);
  return pairs.has(g1 + '|' + g2);
}

function isNeutral(h, s, l) {
  return s < 18 || l > 88 || l < 10; // black / white / grey / beige family
}

function hueDist(h1, h2) {
  const d = Math.abs(h1 - h2) % 360;
  return d > 180 ? 360 - d : d;
}

function isDenim(item) {
  return item.category === 'jeans' && item.h >= 190 && item.h <= 260 && item.s > 12;
}

function scorePair(a, b) {
  const reasons = [];
  let score = 50;

  if (isNeutral(a.h, a.s, a.l) || isNeutral(b.h, b.s, b.l)) {
    score = 88;
    reasons.push('Neutral pairing — clean and safe');
  } else {
    const d = hueDist(a.h, b.h);
    const lDiff = Math.abs(a.l - b.l);
    if (d >= 150 && d <= 210) {
      score = 92; reasons.push('Complementary colors — bold contrast that pops');
    } else if (d <= 12 && lDiff >= 15) {
      score = 87; reasons.push('Monochrome look — same family, different shade');
    } else if (d <= 12) {
      score = 62; reasons.push('Too matchy — same color and shade looks flat');
    } else if (d <= 35) {
      score = 88; reasons.push('Analogous harmony — neighboring colors blend well');
    } else if (d >= 95 && d <= 145) {
      score = 82; reasons.push('Triadic energy — vibrant balance');
    } else {
      score = 58; reasons.push('Clashing hues — risky, needs confidence');
    }
  }

  if (Math.abs(a.l - b.l) >= 30) {
    score += 4;
    reasons.push('Good light–dark contrast');
  }
  if (isDenim(a) || isDenim(b)) {
    score += 4;
    reasons.push('Denim goes with almost everything');
  }

  return { score: Math.min(99, Math.round(score)), reasons };
}

function recommend(item, wardrobe) {
  const g = groupOf(item.category);
  return wardrobe
    .filter(o => o.id !== item.id && pairsWith(g, groupOf(o.category)))
    .map(o => Object.assign({ item: o }, scorePair(item, o)))
    .sort((x, y) => y.score - x.score);
}

// ---------------------------------------------------------------------------
// Server-side color extraction (sharp) — one source of truth for web + mobile
// ---------------------------------------------------------------------------
function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      default: h = (r - g) / d + 4;
    }
    h *= 60;
  }
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
}

async function dominantColor(buffer) {
  const { data, info } = await sharp(buffer)
    .resize(120, 120, { fit: 'cover' })
    .raw()
    .toBuffer({ resolveWithObject: true });
  let r = 0, g = 0, b = 0, n = 0;
  const x0 = Math.floor(info.width * 0.25), x1 = Math.floor(info.width * 0.75);
  const y0 = Math.floor(info.height * 0.25), y1 = Math.floor(info.height * 0.75);
  const ch = info.channels;
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const i = (y * info.width + x) * ch;
      r += data[i]; g += data[i + 1]; b += data[i + 2]; n++;
    }
  }
  r = Math.round(r / n); g = Math.round(g / n); b = Math.round(b / n);
  return { hex: rgbToHex(r, g, b), ...rgbToHsl(r, g, b) };
}

// ---------------------------------------------------------------------------
// Auth — verify the Supabase JWT on every request
// ---------------------------------------------------------------------------
async function auth(req, res, next) {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Login required' });
  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) throw new Error('bad token');
    req.user = data.user;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Session expired, please login again' });
  }
}

async function getProfile(userId) {
  const { data } = await supabase.from('profiles').select('is_pro').eq('id', userId).single();
  return data || { is_pro: false };
}

async function itemCount(userId) {
  const { count } = await supabase.from('items').select('id', { count: 'exact', head: true }).eq('user_id', userId);
  return count || 0;
}

async function signedUrl(photoPath) {
  const { data } = await supabase.storage.from(BUCKET).createSignedUrl(photoPath, SIGNED_URL_TTL);
  return data ? data.signedUrl : null;
}

function toItem(row, url) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    colorHex: row.color_hex,
    h: Number(row.h), s: Number(row.s), l: Number(row.l),
    photoUrl: url,
    createdAt: row.created_at,
  };
}

// ---------------------------------------------------------------------------
// Wardrobe API
// ---------------------------------------------------------------------------
app.get('/api/me', auth, async (req, res) => {
  const profile = await getProfile(req.user.id);
  const count = await itemCount(req.user.id);
  res.json({
    id: req.user.id,
    email: req.user.email,
    name: req.user.user_metadata && req.user.user_metadata.name,
    isPro: !!profile.is_pro,
    itemCount: count,
    itemLimit: profile.is_pro ? null : FREE_ITEM_LIMIT,
  });
});

app.get('/api/items', auth, async (req, res) => {
  const { data, error } = await supabase
    .from('items').select('*').eq('user_id', req.user.id).order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: 'Could not load closet' });
  const out = [];
  for (const row of data) out.push(toItem(row, await signedUrl(row.photo_path)));
  res.json(out);
});

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } });

app.post('/api/items', auth, upload.single('photo'), async (req, res) => {
  try {
    const { name, category } = req.body || {};
    if (!req.file) return res.status(400).json({ error: 'Photo is required' });
    if (!category) return res.status(400).json({ error: 'Category is required' });

    // Freemium gate: free plan caps the wardrobe size
    const profile = await getProfile(req.user.id);
    const count = await itemCount(req.user.id);
    if (!profile.is_pro && count >= FREE_ITEM_LIMIT) {
      return res.status(402).json({
        error: `Free plan limit reached (${FREE_ITEM_LIMIT} items). Upgrade to Pro for unlimited.`,
        upgrade: true,
      });
    }

    // One source of truth: server extracts the dominant color
    const color = await dominantColor(req.file.buffer);
    // Web-optimized copy for storage (max 1600px, jpeg)
    const web = await sharp(req.file.buffer)
      .resize(1600, 1600, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 82 })
      .toBuffer();

    const photoPath = `${req.user.id}/${crypto.randomUUID()}.jpg`;
    const { error: upErr } = await supabase.storage
      .from(BUCKET).upload(photoPath, web, { contentType: 'image/jpeg', upsert: false });
    if (upErr) return res.status(500).json({ error: 'Photo upload failed' });

    const { data, error } = await supabase.from('items').insert({
      user_id: req.user.id,
      name: name || 'Untitled',
      category,
      color_hex: color.hex,
      h: color.h, s: color.s, l: color.l,
      photo_path: photoPath,
    }).select().single();
    if (error) {
      await supabase.storage.from(BUCKET).remove([photoPath]);
      return res.status(500).json({ error: 'Could not save item' });
    }
    res.json(toItem(data, await signedUrl(photoPath)));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

app.delete('/api/items/:id', auth, async (req, res) => {
  const { data: row } = await supabase
    .from('items').select('id, photo_path')
    .eq('id', req.params.id).eq('user_id', req.user.id).single();
  if (!row) return res.status(404).json({ error: 'Item not found' });
  await supabase.storage.from(BUCKET).remove([row.photo_path]);
  await supabase.from('items').delete().eq('id', row.id);
  res.json({ ok: true });
});

// The core feature: pick any item -> ranked matches with color-theory reasons
app.get('/api/recommend/:itemId', auth, async (req, res) => {
  const { data, error } = await supabase
    .from('items').select('*').eq('user_id', req.user.id);
  if (error) return res.status(500).json({ error: 'Could not load closet' });
  const wardrobe = [];
  for (const row of data) wardrobe.push(toItem(row, await signedUrl(row.photo_path)));
  const item = wardrobe.find(i => i.id === req.params.itemId);
  if (!item) return res.status(404).json({ error: 'Item not found' });
  res.json({ item, recommendations: recommend(item, wardrobe) });
});

app.listen(PORT, () => console.log('PairFit API running on http://localhost:' + PORT));
