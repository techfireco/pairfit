/* PairFit frontend — Supabase auth, closet, and "style this" recommendations.
   Auth (register/login/Google) is handled by Supabase directly.
   The API only serves wardrobe data + recommendations, verified via the Supabase JWT. */
let sb = null; // supabase-js client
let closet = [];
let me = null;

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
  const { data: { session } } = await sb.auth.getSession();
  const res = await fetch(path, {
    ...opts,
    headers: {
      ...(opts.headers || {}),
      ...(session ? { Authorization: 'Bearer ' + session.access_token } : {})
    }
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || 'Something went wrong');
    err.upgrade = !!data.upgrade;
    throw err;
  }
  return data;
}

/* ---------------- auth ---------------- */
function showAuth(which) {
  document.getElementById('tab-login').classList.toggle('active', which === 'login');
  document.getElementById('tab-register').classList.toggle('active', which !== 'login');
  document.getElementById('form-login').classList.toggle('hidden', which !== 'login');
  document.getElementById('form-register').classList.toggle('hidden', which !== 'register');
  document.getElementById('auth-error').textContent = '';
}

function authError(msg) {
  document.getElementById('auth-error').textContent = msg;
}

async function doRegister() {
  const name = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value;
  if (!email || !password) { authError('Email and password are required'); return; }
  const { data, error } = await sb.auth.signUp({
    email, password, options: { data: { name } }
  });
  if (error) { authError(error.message); return; }
  if (!data.session) {
    authError('Account created! Check your email to confirm, then login.');
    showAuth('login');
    return;
  }
  enterApp();
}

async function doLogin() {
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const { error } = await sb.auth.signInWithPassword({ email, password });
  if (error) authError(error.message);
  else enterApp();
}

async function doGoogleLogin() {
  const { error } = await sb.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin }
  });
  if (error) authError(error.message);
}

async function logout() {
  await sb.auth.signOut();
  showLogin();
}

function showLogin() {
  document.getElementById('view-app').classList.add('hidden');
  document.getElementById('view-auth').classList.remove('hidden');
}

async function enterApp() {
  document.getElementById('view-auth').classList.add('hidden');
  document.getElementById('view-app').classList.remove('hidden');
  showView('closet');
  try {
    me = await api('/api/me');
  } catch (e) { me = null; }
  updatePlanBadge();
  await loadCloset();
}

function updatePlanBadge() {
  const el = document.getElementById('plan-status');
  if (!el || !me) return;
  el.textContent = me.isPro
    ? 'Pro plan — unlimited items'
    : `${me.itemCount} / ${me.itemLimit} items (Free plan)`;
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
        <button class="danger-link" onclick="askDelete(this, '${item.id}')">Remove</button>
      </div>
    </div>`).join('');
}

// Two-tap inline delete confirmation. Deliberately avoids native confirm():
// it is auto-dismissed in some automation/webviews and blocks the UI thread.
function askDelete(btn, id) {
  if (btn.dataset.armed) { deleteItem(id, btn); return; }
  btn.dataset.armed = '1';
  btn.textContent = 'Tap again to confirm remove';
  btn.classList.add('armed');
  setTimeout(() => {
    if (!btn.isConnected) return;
    delete btn.dataset.armed;
    btn.textContent = 'Remove';
    btn.classList.remove('armed');
  }, 4000);
}

async function deleteItem(id, btn) {
  if (btn) { btn.disabled = true; btn.textContent = 'Removing...'; }
  try {
    await api('/api/items/' + id, { method: 'DELETE' });
  } catch (e) {
    if (btn) {
      btn.disabled = false;
      btn.textContent = 'Remove';
      btn.classList.remove('armed');
      delete btn.dataset.armed;
    }
    alert(e.message || 'Could not remove item');
    return;
  }
  if (me) me.itemCount = Math.max(0, me.itemCount - 1);
  updatePlanBadge();
  await loadCloset();
}

/* ---------------- add item (color is extracted server-side now) ---------------- */
async function addItem() {
  const fileInput = document.getElementById('photo-input');
  const name = document.getElementById('item-name').value.trim();
  const category = document.getElementById('item-category').value;
  const status = document.getElementById('upload-status');
  if (!fileInput.files.length) { status.textContent = 'Please choose a photo first.'; return; }
  status.textContent = 'Uploading & analyzing…';
  try {
    const form = new FormData();
    form.append('photo', fileInput.files[0]);
    form.append('name', name || 'Untitled');
    form.append('category', category);
    const item = await api('/api/items', { method: 'POST', body: form });
    status.textContent = 'Added (' + item.colorHex + ')';
    fileInput.value = '';
    document.getElementById('item-name').value = '';
    if (me) me.itemCount++;
    updatePlanBadge();
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

(async function boot() {
  try {
    const cfg = await fetch('/api/config').then(r => r.json());
    if (!cfg.supabaseUrl || !cfg.supabaseAnonKey) throw new Error('no-config');
    sb = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey);
  } catch (e) {
    document.getElementById('auth-error').textContent =
      'Could not reach the server. Is the API running with SUPABASE_URL set?';
    return;
  }
  sb.auth.onAuthStateChange((_event, session) => {
    if (session) enterApp(); else showLogin();
  });
  const { data: { session } } = await sb.auth.getSession();
  if (session) enterApp(); else showLogin();
})();
