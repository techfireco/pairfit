// PairFit backend — Express API + JWT auth + server-side photo storage.
//
// Why a backend (not local-first):
//   - User registers once -> account + wardrobe live on the SERVER.
//   - Photos are stored in /uploads/<userId>/ on the server disk.
//   - Refresh, cache clear, new phone, new browser — login and everything is back.
//   - For production, point uploads at object storage (S3/R2) and db.json at Postgres.

const express = require('express');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { load, save } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'pairfit-dev-secret-change-me';

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const UPLOAD_ROOT = path.join(__dirname, 'uploads');
fs.mkdirSync(UPLOAD_ROOT, { recursive: true });

// ---------------------------------------------------------------------------
// Color-theory matching engine
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
// Uploads — stored per-user on the server, survives refresh/cache-clear
// ---------------------------------------------------------------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(UPLOAD_ROOT, req.user.id);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = (path.extname(file.originalname) || '.jpg').toLowerCase();
    cb(null, crypto.randomUUID() + ext);
  },
});
const upload = multer({ storage, limits: { fileSize: 8 * 1024 * 1024 } });

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------
function auth(req, res, next) {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Login required' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Session expired, please login again' });
  }
}

function signToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '30d' });
}

const publicUser = u => ({ id: u.id, name: u.name, email: u.email });

app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body || {};
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email and password are required' });
  }
  const db = load();
  if (db.users.find(u => u.email === email.toLowerCase())) {
    return res.status(400).json({ error: 'Email already registered' });
  }
  const user = {
    id: crypto.randomUUID(),
    name,
    email: email.toLowerCase(),
    passwordHash: bcrypt.hashSync(password, 10),
    createdAt: new Date().toISOString(),
  };
  db.users.push(user);
  save(db);
  res.json({ token: signToken(user), user: publicUser(user) });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  const db = load();
  const user = db.users.find(u => u.email === (email || '').toLowerCase());
  if (!user || !bcrypt.compareSync(password || '', user.passwordHash)) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  res.json({ token: signToken(user), user: publicUser(user) });
});

app.get('/api/auth/me', auth, (req, res) => {
  const db = load();
  const user = db.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(publicUser(user));
});

// ---------------------------------------------------------------------------
// Wardrobe API
// ---------------------------------------------------------------------------
app.get('/api/items', auth, (req, res) => {
  const db = load();
  res.json(db.items.filter(i => i.userId === req.user.id));
});

app.post('/api/items', auth, upload.single('photo'), (req, res) => {
  const { name, category, colorHex, h, s, l } = req.body || {};
  if (!req.file) return res.status(400).json({ error: 'Photo is required' });
  if (!category) return res.status(400).json({ error: 'Category is required' });
  const db = load();
  const item = {
    id: crypto.randomUUID(),
    userId: req.user.id,
    name: name || 'Untitled',
    category,
    colorHex: colorHex || '#888888',
    h: Number(h) || 0,
    s: Number(s) || 0,
    l: Number(l) || 50,
    photoUrl: '/uploads/' + req.user.id + '/' + req.file.filename,
    createdAt: new Date().toISOString(),
  };
  db.items.push(item);
  save(db);
  res.json(item);
});

app.delete('/api/items/:id', auth, (req, res) => {
  const db = load();
  const idx = db.items.findIndex(i => i.id === req.params.id && i.userId === req.user.id);
  if (idx === -1) return res.status(404).json({ error: 'Item not found' });
  const [item] = db.items.splice(idx, 1);
  save(db);
  const filePath = path.join(UPLOAD_ROOT, req.user.id, path.basename(item.photoUrl));
  fs.unlink(filePath, () => {});
  res.json({ ok: true });
});

// The core feature: pick any item -> ranked matches with color-theory reasons
app.get('/api/recommend/:itemId', auth, (req, res) => {
  const db = load();
  const wardrobe = db.items.filter(i => i.userId === req.user.id);
  const item = wardrobe.find(i => i.id === req.params.itemId);
  if (!item) return res.status(404).json({ error: 'Item not found' });
  res.json({ item, recommendations: recommend(item, wardrobe) });
});

app.use('/uploads', express.static(UPLOAD_ROOT));

app.listen(PORT, () => console.log('PairFit running on http://localhost:' + PORT));
