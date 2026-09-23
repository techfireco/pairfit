/* PairFit frontend — auth, closet, and "style this" recommendations */
let token = localStorage.getItem('pairfit_token');
let closet = [];

const CATEGORY_LABELS = {
  tshirt: 'T-Shirt', shirt: 'Shirt', top: 'Top', kurta: 'Kurta', sweater: 'Sweater',
  jeans: 'Jeans', pants: 'Pants', skirt: 'Skirt', shorts: 'Shorts',
  jacket: 'Jacket', hoodie: 'Hoodie', dress: 'Dress'
};

function esc(s) {
  return String(s || '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

async function api(path, opts = {}) {
  const res = await fetch(path, {
    ...opts,
    headers: { ...(opts.headers || {}), ...(token ? { Authorization: 'Bearer ' + token } : {}) }
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Something went wrong');
  return data;
}

/* ---------------- auth ---------------- */
function showAuth(which) {
  document.getElementById('tab-login').classList.toggle('active', which === 'login');
  document.getElementById('tab-register').classList.toggle('active', which === 'register');
  document.getElementById('form-login').classList.toggle('hidden', which !== 'login');
  document.getElementById('form-register').classList.toggle('hidden', which !== 'register');
  document.getElementById('auth-error').textContent = '';
}

async function doRegister() {
  const name = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value;
  try {
    const data = await api('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    loginSuccess(data.token);
  } catch (e) { document.getElementById('auth-error').textContent = e.message; }
}

async function doLogin() {
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  try {
    const data = await api('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    loginSuccess(data.token);
  } catch (e) { document.getElementById('auth-error').textContent = e.message; }
}

function loginSuccess(t) {
  token = t;
  localStorage.setItem('pairfit_token', t);
  boot();
}

function logout() {
  token = null;
  localStorage.removeItem('pairfit_token');
  document.getElementById('view-app').classList.add('hidden');
  document.getElementById('view-auth').classList.remove('hidden');
}

/* ---------------- views ---------------- */
function showView(name) {
  document.getElementById('view-closet').classList.toggle('hidden', name !== 'closet');
  document.getElementById('view-style').classList.toggle('hidden', name !== 'style');
  document.getElementById('nav-closet').classList.toggle('active', name === 'closet');
  document.getElementById('nav-style').classList.toggle('active', name === 'style');
  if (name === 'style') renderStylePicker();
}

/* ---------------- closet ---------------- */
async function loadCloset() {
  closet = await api('/api/items');
  renderCloset();
}

function renderCloset() {
  const grid = document.getElementById('closet-grid');
  if (!closet.length) {
    grid.innerHTML = '<p class="empty">Your closet is empty. Add your first item above.</p>';
    return;
  }
  grid.innerHTML = closet.map(item => `
    <div class="card">
      <img src="${esc(item.photoUrl)}" alt="${esc(item.name)}" loading="lazy">
      <div class="card-body">
        <div class="card-title">${esc(item.name)}</div>
        <div class="card-meta">
          <span class="chip">${esc(CATEGORY_LABELS[item.category] || item.category)}</span>
          <span class="swatch" style="background:${esc(item.colorHex)}" title="${esc(item.colorHex)}"></span>
        </div>
        <button class="danger-link" onclick="deleteItem('${item.id}')">Remove</button>
      </div>
    </div>`).join('');
}

async function deleteItem(id) {
  if (!confirm('Remove this item from your closet?')) return;
  await api('/api/items/' + id, { method: 'DELETE' });
  await loadCloset();
}

/* ---------------- color extraction (browser canvas) ---------------- */
function extractColor(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        const size = 120;
        const c = document.createElement('canvas');
        c.width = size; c.height = size;
        const ctx = c.getContext('2d');
        ctx.drawImage(img, 0, 0, size, size);
        const data = ctx.getImageData(0, 0, size, size).data;
        let r = 0, g = 0, b = 0, n = 0;
        // sample the center region to skip photo backgrounds/edges
        for (let y = Math.floor(size * 0.25); y < size * 0.75; y += 3) {
          for (let x = Math.floor(size * 0.25); x < size * 0.75; x += 3) {
            const i = (y * size + x) * 4;
            r += data[i]; g += data[i + 1]; b += data[i + 2]; n++;
          }
        }
        r = Math.round(r / n); g = Math.round(g / n); b = Math.round(b / n);
        URL.revokeObjectURL(img.src);
        resolve({ hex: rgbToHex(r, g, b), ...rgbToHsl(r, g, b) });
      } catch (e) { reject(e); }
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

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

async function addItem() {
  const fileInput = document.getElementById('photo-input');
  const name = document.getElementById('item-name').value.trim();
  const category = document.getElementById('item-category').value;
  const status = document.getElementById('upload-status');
  if (!fileInput.files.length) { status.textContent = 'Please choose a photo first.'; return; }
  status.textContent = 'Analyzing color…';
  try {
    const color = await extractColor(fileInput.files[0]);
    const form = new FormData();
    form.append('photo', fileInput.files[0]);
    form.append('name', name || 'Untitled');
    form.append('category', category);
    form.append('colorHex', color.hex);
    form.append('h', color.h);
    form.append('s', color.s);
    form.append('l', color.l);
    status.textContent = 'Uploading…';
    await api('/api/items', { method: 'POST', body: form });
    status.textContent = 'Added (' + color.hex + ')';
    fileInput.value = '';
    document.getElementById('item-name').value = '';
    await loadCloset();
  } catch (e) { status.textContent = 'Error: ' + e.message; }
}

/* ---------------- style this ---------------- */
function renderStylePicker() {
  const picker = document.getElementById('style-picker');
  document.getElementById('style-results').innerHTML = '';
  if (!closet.length) {
    picker.innerHTML = '<p class="empty">Add some clothes to your closet first.</p>';
    return;
  }
  picker.innerHTML = '<p class="hint">Tap an item to see what goes with it:</p>' + closet.map(item => `
    <div class="card pick" onclick="styleItem('${item.id}')">
      <img src="${esc(item.photoUrl)}" alt="${esc(item.name)}" loading="lazy">
      <div class="card-body"><div class="card-title">${esc(item.name)}</div></div>
    </div>`).join('');
}

async function styleItem(id) {
  const box = document.getElementById('style-results');
  box.innerHTML = '<p>Finding matches…</p>';
  try {
    const { item, recommendations } = await api('/api/recommend/' + id);
    if (!recommendations.length) {
      box.innerHTML = '<p class="empty">No matching items yet — add more clothes in a pairing category (e.g. tops if you picked jeans).</p>';
      return;
    }
    box.innerHTML = `<h3>Best matches for <em>${esc(item.name)}</em></h3>` +
      recommendations.map(r => `
        <div class="match">
          <img src="${esc(r.item.photoUrl)}" alt="${esc(r.item.name)}" loading="lazy">
          <div class="match-body">
            <div class="match-title">${esc(r.item.name)}
              <span class="chip">${esc(CATEGORY_LABELS[r.item.category] || r.item.category)}</span>
            </div>
            <div class="score-bar"><div class="score-fill" style="width:${r.score}%"></div></div>
            <div class="score-label">${r.score}/100</div>
            <ul class="reasons">${r.reasons.map(x => '<li>' + esc(x) + '</li>').join('')}</ul>
          </div>
        </div>`).join('');
  } catch (e) { box.innerHTML = '<p class="error">Error: ' + esc(e.message) + '</p>'; }
}

/* ---------------- boot ---------------- */
document.getElementById('tab-login').onclick = () => showAuth('login');
document.getElementById('tab-register').onclick = () => showAuth('register');

async function boot() {
  document.getElementById('view-auth').classList.add('hidden');
  document.getElementById('view-app').classList.remove('hidden');
  showView('closet');
  await loadCloset();
}

if (token) { boot().catch(() => logout()); }
