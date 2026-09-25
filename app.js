'use strict';

/* ============ 設定 ============ */
const TYPES = {
  movie:  { label: '電影', icon: '🎬' },
  series: { label: '影集', icon: '📺' },
  anime:  { label: '動畫', icon: '✨' },
  doc:    { label: '紀錄片', icon: '🎥' },
};
const WHERE = {
  cinema: { label: '電影院', icon: '🍿' },
  stream: { label: '串流', icon: '📱' },
  tv:     { label: '電視', icon: '🛋️' },
  other:  { label: '其他', icon: '🎞️' },
};
const MOODS = ['😍', '🥹', '😭', '🤯', '😱', '😂', '🤔', '😴'];
const PLATFORMS = ['威秀影城', '秀泰影城', '國賓影城', '美麗華影城', 'Netflix', 'Disney+', 'HBO Max', 'Apple TV+', 'Prime Video', 'friDay影音', 'CATCHPLAY+', 'MyVideo', '愛奇藝'];
const TABS = [['seen', '看過'], ['want', '想看'], ['stats', '統計']];
const WEEK = '日一二三四五六';
// 名稱設計：小寫 seesaw 當作蹺蹺板的板子，下面用三角形撐著
const LOGO = '<span class="logo" role="img" aria-label="seesaw"><span class="plank" aria-hidden="true">seesaw</span><svg class="fulcrum" viewBox="0 0 20 16" aria-hidden="true"><path d="M10 2.5 17.5 14h-15Z" fill="currentColor" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/></svg></span>';
// 線條圖示（顏色跟著文字色）
const svgIcon = (d) => `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const ICON = {
  back: svgIcon('<path d="m15 18-6-6 6-6"/>'),
  gear: svgIcon('<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>'),
  pencil: svgIcon('<path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/><path d="m14.5 5.5 3 3"/>'),
  share: svgIcon('<path d="M12 3v12"/><path d="m8 7 4-4 4 4"/><path d="M8 11H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-2"/>'),
  trash: svgIcon('<path d="M4 7h16"/><path d="M10 11v6M14 11v6"/><path d="M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12"/><path d="M9 7V4h6v3"/>'),
};

/* ============ 小工具 ============ */
const $ = (s, el = document) => el.querySelector(s);
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const parseDate = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const todayISO = () => iso(new Date());
const fmtDate = (s) => { if (!s) return ''; const d = parseDate(s); return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()} (${WEEK[d.getDay()]})`; };
const fmtMonth = (ym) => { const [y, m] = ym.split('-'); return `${y} 年 ${Number(m)} 月`; };
const fmtRating = (v) => (v ? Number(v).toFixed(1) : '');
const parseTags = (s) => [...new Set(String(s || '').split(/[,，、\s#]+/).map((x) => x.trim()).filter(Boolean))];
const parsePeople = (s) => String(s || '').split(/[,，、/&＆]+|\s和\s/).map((x) => x.trim()).filter(Boolean);
const hue = (s) => [...String(s || '')].reduce((h, c) => (h * 31 + c.codePointAt(0)) % 360, 250);
const byWatched = (a, b) => (b.date || '').localeCompare(a.date || '') || (b.createdAt || 0) - (a.createdAt || 0);

// 星星：--v 是 0–5 的分數，用漸層把前幾顆塗成金色（支援半顆星）
const stars = (v) => `<span class="stars" style="--v:${Number(v) || 0}" role="img" aria-label="${v ? `${fmtRating(v)} 顆星` : '未評分'}"></span>`;

function poster(r, cls = '') {
  return `<div class="poster ${cls}" style="--h:${hue(r.title)}">
    <span class="ph-title">${esc(r.title)}</span>
    ${r.poster ? `<img data-photo="${r.poster}" alt="">` : ''}
  </div>`;
}

let toastTimer;
function toast(msg) {
  const el = $('#toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2200);
}

/* ============ 資料：本機優先 + Supabase 雲端同步 ============
 * 所有修改先存進手機（IndexedDB），再在背景上傳到 Supabase。
 * 沒網路時也能新增、修改，連上網路後會自動把「待上傳」的變更送出。
 * 雲端：資料表 seesaw_reviews（每部片一列）、照片空間 seesaw-posters/{user id}/{photo id}.jpg */
const CFG = window.SEESAW_CONFIG || {};
const configured = Boolean(CFG.SUPABASE_URL && CFG.SUPABASE_KEY);
const sb = configured
  ? supabase.createClient(CFG.SUPABASE_URL, CFG.SUPABASE_KEY, {
      // 和 CutiCuti、FooooooD 在同一個網域，登入狀態用不同名稱存，幾個 App 才不會互相登出
      auth: { flowType: 'pkce', persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, storageKey: 'seesaw-auth' },
    })
  : null;
const BUCKET = 'seesaw-posters';
const TABLE = 'seesaw_reviews';

const store = {
  get(k) { try { return localStorage.getItem('seesaw-' + k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem('seesaw-' + k, v); } catch { /* 無痕模式等 */ } },
};

// 本機快取
const DB = {
  db: null,
  open() {
    return new Promise((res, rej) => {
      const r = indexedDB.open('seesaw', 1);
      r.onupgradeneeded = () => {
        r.result.createObjectStore('reviews', { keyPath: 'id' });
        r.result.createObjectStore('photos', { keyPath: 'id' });
      };
      r.onsuccess = () => { this.db = r.result; res(); };
      r.onerror = () => rej(r.error);
    });
  },
  run(names, mode, fn) {
    return new Promise((res, rej) => {
      const tx = this.db.transaction(names, mode);
      const req = fn(tx);
      tx.oncomplete = () => res(req && req.result);
      tx.onerror = () => rej(tx.error);
    });
  },
  all: (s) => DB.run(s, 'readonly', (tx) => tx.objectStore(s).getAll()),
  get: (s, id) => DB.run(s, 'readonly', (tx) => tx.objectStore(s).get(id)),
  put: (s, v) => DB.run(s, 'readwrite', (tx) => tx.objectStore(s).put(v)),
  del: (s, id) => DB.run(s, 'readwrite', (tx) => tx.objectStore(s).delete(id)),
  applyReviews: (puts, dels) => DB.run('reviews', 'readwrite', (tx) => {
    const o = tx.objectStore('reviews');
    puts.forEach((r) => o.put(r));
    dels.forEach((id) => o.delete(id));
  }),
  clear: () => DB.run(['reviews', 'photos'], 'readwrite', (tx) => {
    tx.objectStore('reviews').clear();
    tx.objectStore('photos').clear();
  }),
};

// 還沒上傳到雲端的變更
const pending = {
  empty: () => ({ reviews: [], delReviews: [], photos: [], delPhotos: [] }),
  load() { try { return { ...pending.empty(), ...JSON.parse(store.get('pending')) }; } catch { return pending.empty(); } },
  save(p) { store.set('pending', JSON.stringify(p)); },
  add(kind, id) { const p = pending.load(); if (!p[kind].includes(id)) p[kind].push(id); pending.save(p); },
  drop(kind, ids) { const p = pending.load(); p[kind] = p[kind].filter((x) => !ids.includes(x)); pending.save(p); },
  count() { const p = pending.load(); return p.reviews.length + p.delReviews.length + p.photos.length + p.delPhotos.length; },
  clear() { pending.save(pending.empty()); },
};

const cloud = {
  path: (id) => `${user.id}/${id}.jpg`,
  // 每部片只拿 id 和更新時間（很小），用來判斷哪些有變動、哪些被刪掉
  // Supabase 一次最多回傳 1000 筆，所以分頁拿
  async listIndex() {
    const out = [];
    for (let from = 0; ; from += 1000) {
      const { data, error } = await sb.from(TABLE).select('id, updated_at').order('id').range(from, from + 999);
      if (error) throw error;
      out.push(...data);
      if (data.length < 1000) return out;
    }
  },
  // 只下載有變動的心得內容，每次 100 部
  async getReviews(ids) {
    const out = [];
    for (let i = 0; i < ids.length; i += 100) {
      const { data, error } = await sb.from(TABLE).select('data, updated_at').in('id', ids.slice(i, i + 100));
      if (error) throw error;
      out.push(...data.map((row) => ({ ...row.data, updatedAt: Date.parse(row.updated_at) })));
    }
    return out;
  },
  async saveReview(r) {
    const { error } = await sb.from(TABLE).upsert({ user_id: user.id, id: r.id, data: r, updated_at: new Date(r.updatedAt || Date.now()).toISOString() });
    if (error) throw error;
  },
  async deleteReview(id) {
    const { error } = await sb.from(TABLE).delete().eq('user_id', user.id).eq('id', id);
    if (error) throw error;
  },
  async uploadPhoto(id, blob) {
    const { error } = await sb.storage.from(BUCKET).upload(cloud.path(id), blob, { contentType: 'image/jpeg', cacheControl: '31536000', upsert: true });
    if (error) throw error;
  },
  async downloadPhoto(id) {
    const { data, error } = await sb.storage.from(BUCKET).download(cloud.path(id));
    if (error) throw error;
    return data;
  },
  async removePhotos(ids) {
    if (!ids.length) return;
    const { error } = await sb.storage.from(BUCKET).remove(ids.map(cloud.path));
    if (error) throw error;
  },
};

let user = null;
let reviews = [];
let ui = { tab: 'seen', q: '', filter: 'all', sort: 'date', year: String(new Date().getFullYear()), scroll: 0 };
const photoURLs = new Map(); // photoId -> objectURL

function friendly(err) {
  const msg = err?.message || String(err);
  if (!navigator.onLine || /fetch|Load failed|network/i.test(msg)) return '沒有網路';
  return msg;
}
const isEditing = () => $('#sheet').classList.contains('open');

async function saveReview(r) {
  r.updatedAt = Date.now();
  const i = reviews.findIndex((x) => x.id === r.id);
  if (i >= 0) reviews[i] = r; else reviews.push(r);
  await DB.put('reviews', r);
  pending.add('reviews', r.id);
  scheduleSync();
}
async function deleteReviewData(r) {
  if (r.poster) await deletePhoto(r.poster);
  await DB.del('reviews', r.id);
  pending.drop('reviews', [r.id]);
  pending.add('delReviews', r.id);
  reviews = reviews.filter((x) => x.id !== r.id);
  scheduleSync();
}
async function savePhoto(id, blob) {
  await DB.put('photos', { id, blob });
  pending.add('photos', id);
  scheduleSync();
}
function forgetPhoto(id) {
  if (photoURLs.has(id)) { URL.revokeObjectURL(photoURLs.get(id)); photoURLs.delete(id); }
}
async function deletePhoto(id) {
  await DB.del('photos', id);
  forgetPhoto(id);
  pending.drop('photos', [id]);
  pending.add('delPhotos', id);
  scheduleSync();
}
async function photoBlob(id) {
  const p = await DB.get('photos', id);
  if (p) return p.blob;
  const blob = await cloud.downloadPhoto(id); // 其他裝置拍的照片，第一次看時下載並存到本機
  await DB.put('photos', { id, blob });
  return blob;
}
async function photoURL(id) {
  if (photoURLs.has(id)) return photoURLs.get(id);
  try {
    const u = URL.createObjectURL(await photoBlob(id));
    photoURLs.set(id, u);
    return u;
  } catch { return null; } // 離線且這支手機還沒下載過這張照片
}

// ---- 同步 ----
let syncing = null;
let syncTimer = null;
let lastSync = 0;
function sync() {
  if (!syncing) syncing = doSync().finally(() => { syncing = null; });
  return syncing;
}
function scheduleSync(delay = 800) {
  clearTimeout(syncTimer);
  syncTimer = setTimeout(() => {
    sync().then((changed) => { if (changed && !isEditing()) route(); }).catch(() => {});
  }, delay);
}
async function doSync() {
  if (!user || user.offline) throw new Error('尚未連線');
  // 1. 先把這支手機上的變更送上去
  const p = pending.load();
  for (const id of p.photos) {
    const ph = await DB.get('photos', id);
    if (ph) await cloud.uploadPhoto(id, ph.blob);
  }
  pending.drop('photos', p.photos);
  await cloud.removePhotos(p.delPhotos);
  pending.drop('delPhotos', p.delPhotos);
  for (const id of p.reviews) {
    const r = reviews.find((x) => x.id === id) || (await DB.get('reviews', id));
    if (r) await cloud.saveReview(r);
  }
  pending.drop('reviews', p.reviews);
  for (const id of p.delReviews) await cloud.deleteReview(id);
  pending.drop('delReviews', p.delReviews);

  // 2. 再抓雲端最新資料：先比對每部片的更新時間，只下載有變動的內容
  const index = await cloud.listIndex();
  const isPending = (id, p) => p.reviews.includes(id) || p.delReviews.includes(id);
  const known = new Map(reviews.map((r) => [r.id, r.updatedAt]));
  let still = pending.load();
  const need = index.filter((x) => known.get(x.id) !== Date.parse(x.updated_at) && !isPending(x.id, still)).map((x) => x.id);
  const fetched = await cloud.getReviews(need);

  // 下載途中又有新修改的，保留手機上的版本
  still = pending.load();
  const remoteIds = new Set(index.map((x) => x.id));
  const map = new Map(reviews.map((r) => [r.id, r]));
  const puts = [];
  const dels = [];
  const stalePhotos = [];
  for (const r of fetched) {
    if (isPending(r.id, still)) continue;
    const old = map.get(r.id);
    if (old?.poster && old.poster !== r.poster) stalePhotos.push(old.poster); // 其他裝置換了海報
    map.set(r.id, r);
    puts.push(r);
  }
  for (const [id, r] of map) {
    if (remoteIds.has(id) || still.reviews.includes(id)) continue; // 其他裝置刪掉的
    if (r.poster) stalePhotos.push(r.poster);
    map.delete(id);
    dels.push(id);
  }
  const changed = puts.length > 0 || dels.length > 0;
  if (changed) {
    reviews = [...map.values()];
    await DB.applyReviews(puts, dels);
    for (const id of stalePhotos) { forgetPhoto(id); await DB.del('photos', id); }
  }
  lastSync = Date.now();
  return changed;
}

/* ============ 畫面 ============ */
const app = $('#app');

function renderLogin() {
  document.title = 'seesaw';
  app.innerHTML = `
    <main class="login">
      <img src="icons/icon-192.png" alt="" class="login-icon">
      <h1>${LOGO}</h1>
      <p>記下每一部看過的電影，和看完的心情</p>
      <button class="google-btn" data-act="login">
        <svg viewBox="0 0 48 48" width="20" height="20" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>
        使用 Google 帳號登入
      </button>
      <p class="hint">登入後，心得和海報照片會存在你的 Google 帳號底下，換手機或用電腦開都看得到。</p>
    </main>`;
}

function renderLoading(msg = '載入中…') {
  app.innerHTML = `<div class="empty"><div class="big">🍿</div>${msg}</div>`;
}

function route() {
  if (!user) return renderLogin();
  const m = location.hash.match(/^#\/r\/([\w-]+)/);
  const r = m && reviews.find((x) => x.id === m[1]);
  if (r) renderDetail(r);
  else renderHome();
}

/* ---- 首頁 ---- */
function renderHome() {
  document.title = 'seesaw';
  const fab = { seen: '＋ 記一部', want: '＋ 想看', stats: '' }[ui.tab];
  app.innerHTML = `
    <header class="topbar">
      <div class="bar">
        <div class="brand">${LOGO}</div>
        <button class="line-btn" data-act="settings" aria-label="設定與備份">${ICON.gear}</button>
      </div>
      <nav class="tabs">${TABS.map(([k, l]) => `<button class="tab ${ui.tab === k ? 'on' : ''}" data-act="tab" data-tab="${k}">${l}</button>`).join('')}</nav>
    </header>
    <main class="page" id="page"></main>
    ${fab ? `<button class="fab" data-act="new">${fab}</button>` : ''}`;

  const page = $('#page');
  if (ui.tab === 'stats') {
    page.innerHTML = statsView();
    hydratePhotos(page);
    return;
  }
  const filters = [['all', '全部'], ['fav', '❤️ 最愛'], ...Object.entries(TYPES).map(([k, t]) => [k, t.label])];
  page.innerHTML = `
    <div class="search"><input class="input" id="q" type="search" value="${esc(ui.q)}" placeholder="搜尋片名、標籤、和誰看…" enterkeyhint="search"></div>
    ${ui.tab === 'seen' ? `<div class="filters">
      ${filters.map(([k, l]) => `<button class="fchip ${ui.filter === k ? 'on' : ''}" data-act="filter" data-f="${k}">${l}</button>`).join('')}
      <button class="fchip sort" data-act="sort">${ui.sort === 'date' ? '🕒 最近看的' : '⭐ 評分最高'}</button>
    </div>` : ''}
    <div id="list"></div>`;
  $('#q').oninput = (e) => { ui.q = e.target.value; renderList(); };
  renderList();
}

function renderList() {
  const el = $('#list');
  if (!el) return;
  const all = reviews.filter((r) => r.kind === ui.tab);
  const q = ui.q.trim().toLowerCase();
  let list = all;
  if (q) list = list.filter((r) => [r.title, r.original, r.year, r.with, r.platform, r.oneLiner, r.text, r.quote, ...(r.tags || [])].join(' ').toLowerCase().includes(q));
  if (ui.tab === 'seen') {
    if (ui.filter === 'fav') list = list.filter((r) => r.fav);
    else if (TYPES[ui.filter]) list = list.filter((r) => r.type === ui.filter);
  }

  if (!all.length) {
    el.innerHTML = ui.tab === 'seen'
      ? `<div class="empty"><div class="big">🎬</div><b>還沒有觀影紀錄</b>看完一部片，按右下角把心得記下來吧！</div>`
      : `<div class="empty"><div class="big">🍿</div><b>想看清單是空的</b>聽說不錯、還沒空看的片，先放這裡</div>`;
    return;
  }
  if (!list.length) {
    el.innerHTML = `<div class="empty"><div class="big">🔍</div><b>找不到符合的片</b>換個關鍵字或篩選試試</div>`;
    return;
  }

  if (ui.tab === 'want') {
    list = [...list].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    el.innerHTML = `<h2 class="section">想看 ${list.length} 部</h2>${list.map(wantRow).join('')}`;
  } else if (ui.sort === 'rating') {
    list = [...list].sort((a, b) => (b.rating || 0) - (a.rating || 0) || byWatched(a, b));
    el.innerHTML = `<h2 class="section">共 ${list.length} 部</h2><div class="grid">${list.map(card).join('')}</div>`;
  } else {
    list = [...list].sort(byWatched);
    const groups = new Map();
    list.forEach((r) => {
      const k = (r.date || '').slice(0, 7) || 'none';
      if (!groups.has(k)) groups.set(k, []);
      groups.get(k).push(r);
    });
    el.innerHTML = [...groups].map(([k, rs]) => `
      <h2 class="section">${k === 'none' ? '日期未填' : fmtMonth(k)}・${rs.length} 部</h2>
      <div class="grid">${rs.map(card).join('')}</div>`).join('');
  }
  hydratePhotos(el);
}

function card(r) {
  return `<a class="card" href="#/r/${r.id}">
    ${poster(r)}
    ${r.fav ? '<span class="fav" aria-label="最愛">❤️</span>' : ''}
    <div class="c-title">${esc(r.title)}</div>
    <div class="c-meta">${r.rating ? stars(r.rating) : '<small>未評分</small>'}${r.mood ? `<span class="c-mood">${r.mood}</span>` : ''}</div>
  </a>`;
}

function wantRow(r) {
  const t = TYPES[r.type] || TYPES.movie;
  const sub = [r.year, t.label, r.platform].filter(Boolean).map(esc).join('・');
  return `<div class="want">
    <a class="want-main" href="#/r/${r.id}">
      ${poster(r, 'mini')}
      <div class="want-info">
        <b>${esc(r.title)}</b>
        <small>${sub}</small>
        ${r.oneLiner ? `<p>${esc(r.oneLiner)}</p>` : ''}
      </div>
    </a>
    <button class="want-btn" data-act="watched" data-id="${r.id}">✓ 看完了</button>
  </div>`;
}

/* ---- 單部片 ---- */
function renderDetail(r) {
  document.title = `${r.title} - seesaw`;
  const t = TYPES[r.type] || TYPES.movie;
  const w = WHERE[r.where];
  const seen = r.kind === 'seen';
  const facts = [
    [r.year, t.icon + ' ' + t.label].filter(Boolean).map(esc).join('・'),
    seen && r.date ? `🗓️ ${fmtDate(r.date)}` : '',
    seen && (w || r.platform) ? `${w ? w.icon : '📍'} ${esc([w?.label, r.platform].filter(Boolean).join('・'))}` : '',
    !seen && r.platform ? `📍 ${esc(r.platform)}` : '',
    seen && r.with ? `👥 和 ${esc(r.with)}` : '',
  ].filter(Boolean);

  app.innerHTML = `
    <header class="topbar"><div class="bar">
      <a class="line-btn back" href="#/" aria-label="返回">${ICON.back}</a>
      <div class="title"><b>${esc(r.title)}</b><small>${seen ? '看過' : '想看'}</small></div>
      <button class="line-btn" data-act="edit" data-id="${r.id}" aria-label="編輯">${ICON.pencil}</button>
      <button class="line-btn" data-act="del" data-id="${r.id}" aria-label="刪除">${ICON.trash}</button>
    </div></header>
    <main class="page detail">
      <section class="hero">
        <div class="hero-poster" data-act="view-poster">${poster(r, 'big')}${r.fav ? '<span class="fav">❤️</span>' : ''}</div>
        <div class="hero-info">
          <h1>${esc(r.title)}</h1>
          ${r.original ? `<p class="orig">${esc(r.original)}</p>` : ''}
          <ul class="facts">${facts.map((f) => `<li>${f}</li>`).join('')}</ul>
          ${seen ? `<div class="big-rating">${stars(r.rating)}<b>${fmtRating(r.rating) || '未評分'}</b>${r.mood ? `<span class="m">${r.mood}</span>` : ''}</div>` : ''}
        </div>
      </section>
      ${r.oneLiner ? `<blockquote class="one-liner">${seen ? '' : '<small>為什麼想看</small>'}${esc(r.oneLiner)}</blockquote>` : ''}
      ${seen && r.text ? `<section class="block ${r.spoiler ? 'spoiler' : ''}" id="essay">
        <h2 class="section">觀後心得${r.spoiler ? '・含劇透' : ''}</h2>
        <div class="essay">${esc(r.text)}</div>
        ${r.spoiler ? '<button class="reveal" data-act="reveal">⚠️ 含劇透，點一下顯示</button>' : ''}
      </section>` : ''}
      ${seen && r.quote ? `<section class="block"><h2 class="section">印象最深的台詞</h2><p class="quote">${esc(r.quote)}</p></section>` : ''}
      ${r.tags?.length ? `<div class="tags">${r.tags.map((g) => `<button class="tag" data-act="tag" data-tag="${esc(g)}">#${esc(g)}</button>`).join('')}</div>` : ''}
      ${seen && !r.text && !r.oneLiner && !r.quote ? `<button class="empty-note" data-act="edit" data-id="${r.id}">還沒寫心得，點這裡補上 ✍️</button>` : ''}
      <div class="actions">
        ${seen ? '' : `<button class="btn" data-act="watched" data-id="${r.id}">✓ 看完了，寫心得</button>`}
        <button class="btn ghost with-icon" data-act="share" data-id="${r.id}">${ICON.share}分享${seen ? '心得' : ''}</button>
      </div>
    </main>`;
  hydratePhotos(app);
}

/* ---- 統計 ---- */
function statsView() {
  const seen = reviews.filter((r) => r.kind === 'seen');
  if (!seen.length) return `<div class="empty"><div class="big">📊</div><b>還沒有資料可以統計</b>記下幾部看過的片，這裡就會幫你整理</div>`;
  const years = [...new Set(seen.map((r) => (r.date || '').slice(0, 4)).filter(Boolean))].sort().reverse();
  if (ui.year !== 'all' && !years.includes(ui.year)) ui.year = years[0] || 'all';
  const list = ui.year === 'all' ? seen : seen.filter((r) => (r.date || '').startsWith(ui.year));
  const rated = list.filter((r) => r.rating > 0);
  const avg = rated.length ? rated.reduce((s, r) => s + r.rating, 0) / rated.length : 0;
  const cinema = list.filter((r) => r.where === 'cinema').length;

  const countBy = (items) => {
    const m = new Map();
    items.forEach((k) => m.set(k, (m.get(k) || 0) + 1));
    return [...m].sort((a, b) => b[1] - a[1]);
  };
  const bars = (rows) => {
    const max = Math.max(...rows.map((x) => x[1]), 1);
    return `<div class="list">${rows.map(([l, v]) => `<div class="bar-row"><span>${l}</span><div class="meter"><i style="width:${(v / max) * 100}%"></i></div><span class="v">${v}</span></div>`).join('')}</div>`;
  };

  const byType = countBy(list.map((r) => r.type || 'movie')).map(([k, v]) => [`${TYPES[k]?.icon || ''} ${TYPES[k]?.label || k}`, v]);
  const byWhere = countBy(list.map((r) => r.where).filter((k) => WHERE[k])).map(([k, v]) => [`${WHERE[k].icon} ${WHERE[k].label}`, v]);
  const tags = countBy(list.flatMap((r) => r.tags || [])).slice(0, 8).map(([k, v]) => [`#${esc(k)}`, v]);
  const people = countBy(list.flatMap((r) => parsePeople(r.with))).slice(0, 5).map(([k, v]) => [esc(k), v]);
  const dist = [5, 4.5, 4, 3.5, 3, 2.5, 2, 1.5, 1, 0.5].map((v) => [stars(v), rated.filter((r) => r.rating === v).length]).filter(([, n]) => n);
  const top = [...rated].sort((a, b) => b.rating - a.rating || byWatched(a, b)).slice(0, 3);
  let months = '';
  if (ui.year !== 'all') {
    const counts = Array.from({ length: 12 }, (_, i) => list.filter((r) => Number(r.date.slice(5, 7)) === i + 1).length);
    const max = Math.max(...counts, 1);
    months = `<h2 class="section">每個月看了幾部</h2>
      <div class="months">${counts.map((n, i) => `<div class="mcol"><span class="n">${n || ''}</span><i style="height:${(n / max) * 100}%"></i><small>${i + 1}</small></div>`).join('')}</div>`;
  }

  return `
    <div class="filters">
      ${years.map((y) => `<button class="fchip ${ui.year === y ? 'on' : ''}" data-act="year" data-y="${y}">${y}</button>`).join('')}
      <button class="fchip ${ui.year === 'all' ? 'on' : ''}" data-act="year" data-y="all">全部</button>
    </div>
    <div class="tiles">
      <div class="tile accent"><b>${list.length}</b><small>${ui.year === 'all' ? '總共看了' : `${ui.year} 年看了`}</small></div>
      <div class="tile"><b>${avg ? avg.toFixed(1) : '–'}</b><small>平均評分</small></div>
      <div class="tile"><b>${cinema}</b><small>進電影院</small></div>
    </div>
    ${top.length ? `<h2 class="section">評分最高</h2><div class="grid top3">${top.map(card).join('')}</div>` : ''}
    ${months}
    ${dist.length ? `<h2 class="section">評分分布</h2>${bars(dist)}` : ''}
    <h2 class="section">類型</h2>${bars(byType)}
    ${byWhere.length ? `<h2 class="section">在哪裡看</h2>${bars(byWhere)}` : ''}
    ${tags.length ? `<h2 class="section">常用標籤</h2>${bars(tags)}` : ''}
    ${people.length ? `<h2 class="section">最常一起看的人</h2>${bars(people)}` : ''}
    ${!list.length ? '<div class="empty"><b>這一年還沒有紀錄</b></div>' : ''}`;
}

/* ============ 底部表單 ============ */
let sheetOnClose = null;
function openSheet(html, onMount, onClose) {
  const root = $('#sheet');
  root.innerHTML = `<div class="backdrop" data-act="close-sheet"></div><div class="panel" role="dialog" aria-modal="true">${html}</div>`;
  sheetOnClose = onClose || null;
  document.body.classList.add('noscroll');
  requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add('open')));
  if (onMount) onMount($('.panel', root));
}
async function closeSheet() {
  const root = $('#sheet');
  if (sheetOnClose) { const fn = sheetOnClose; sheetOnClose = null; await fn(); }
  root.classList.remove('open');
  document.body.classList.remove('noscroll');
  setTimeout(() => {
    if (root.classList.contains('open')) return;
    root.innerHTML = '';
    reloadIfIdle();
  }, 300);
}
const head = (title, submitLabel = '儲存') =>
  `<div class="sheet-head"><button type="button" class="link" data-act="close-sheet">取消</button><b>${title}</b><button class="link strong" type="submit">${submitLabel}</button></div>`;

// preset：「看完了」時把想看改成看過、日期帶今天
function reviewForm(r, preset = {}) {
  const isNew = !r;
  const d = { kind: ui.tab === 'want' ? 'want' : 'seen', type: 'movie', where: 'cinema', date: todayISO(), rating: 0, tags: [], ...(r || {}), ...preset };
  const allTags = [...new Set(reviews.flatMap((x) => x.tags || []))].slice(0, 20);
  let posterBlob = null;   // 這次新選的照片（按儲存才寫入）
  let posterRemoved = false;
  let previewURL = null;

  openSheet(`<form id="f" class="rform" data-kind="${d.kind}" autocomplete="off">
    ${head(isNew ? '新增' : preset.kind === 'seen' ? '寫下心得' : '編輯')}
    <div class="seg">
      <label><input type="radio" name="kind" value="seen" ${d.kind === 'seen' ? 'checked' : ''}><span>🎬 看過了</span></label>
      <label><input type="radio" name="kind" value="want" ${d.kind === 'want' ? 'checked' : ''}><span>🍿 想看</span></label>
    </div>
    <div class="top-row">
      <div class="poster-pick" id="pp"></div>
      <div class="grow">
        <label class="field"><span>片名</span><input name="title" required value="${esc(d.title)}" placeholder="例如：你的名字"></label>
        <label class="field"><span>原文片名</span><input name="original" value="${esc(d.original)}" placeholder="選填"></label>
        <label class="field"><span>上映年份</span><input name="year" inputmode="numeric" maxlength="4" value="${esc(d.year)}" placeholder="2016"></label>
      </div>
    </div>
    <div class="pick types">${Object.entries(TYPES).map(([k, t]) => `<label><input type="radio" name="type" value="${k}" ${d.type === k ? 'checked' : ''}><span>${t.icon}<small>${t.label}</small></span></label>`).join('')}</div>

    <div class="only-seen">
      <div class="field"><span>評分</span>
        <div class="rating-row">
          <div class="star-input">${stars(d.rating)}<div class="hits">${Array.from({ length: 10 }, (_, i) => `<button type="button" data-rate="${(i + 1) / 2}" aria-label="${(i + 1) / 2} 顆星"></button>`).join('')}</div></div>
          <b id="rv">${fmtRating(d.rating) || '還沒評分'}</b>
        </div>
        <input type="hidden" name="rating" value="${Number(d.rating) || 0}">
      </div>
      <div class="field"><span>看完的心情</span>
        <div class="moods">${MOODS.map((m) => `<button type="button" class="mood ${d.mood === m ? 'on' : ''}" data-mood="${m}">${m}</button>`).join('')}</div>
        <input type="hidden" name="mood" value="${esc(d.mood)}">
      </div>
      <div class="row">
        <label class="field"><span>觀看日期</span><input type="date" name="date" value="${esc(d.date)}"></label>
        <label class="field"><span>和誰一起看</span><input name="with" value="${esc(d.with)}" placeholder="選填"></label>
      </div>
      <div class="field"><span>在哪裡看</span>
        <div class="pick where">${Object.entries(WHERE).map(([k, w]) => `<label><input type="radio" name="where" value="${k}" ${d.where === k ? 'checked' : ''}><span>${w.icon}<small>${w.label}</small></span></label>`).join('')}</div>
      </div>
    </div>
    <label class="field"><span><i class="only-seen">影城／平台</i><i class="only-want">在哪裡可以看</i></span><input name="platform" list="platforms" value="${esc(d.platform)}" placeholder="例如：威秀、Netflix"></label>
    <datalist id="platforms">${PLATFORMS.map((p) => `<option value="${p}">`).join('')}</datalist>
    <label class="field"><span><i class="only-seen">一句話短評</i><i class="only-want">為什麼想看</i></span><input name="oneLiner" value="${esc(d.oneLiner)}" placeholder="用一句話說說這部片"></label>

    <div class="only-seen">
      <label class="field"><span>觀後心得</span><textarea name="text" rows="8" placeholder="喜歡哪一幕？哪裡讓你印象深刻？有什麼想法？">${esc(d.text)}</textarea></label>
      <label class="toggle"><input type="checkbox" name="spoiler" ${d.spoiler ? 'checked' : ''}><span>⚠️ 心得含劇透（打開時先模糊）</span></label>
      <label class="field"><span>印象最深的台詞</span><textarea name="quote" rows="2" placeholder="選填">${esc(d.quote)}</textarea></label>
      <label class="toggle"><input type="checkbox" name="fav" ${d.fav ? 'checked' : ''}><span>❤️ 加入最愛</span></label>
    </div>
    <label class="field"><span>標籤</span><input name="tags" id="tags" value="${esc((d.tags || []).join(' '))}" placeholder="用空格分開，例如：燒腦 科幻 二刷"></label>
    ${allTags.length ? `<div class="tag-sug">${allTags.map((g) => `<button type="button" class="tag" data-addtag="${esc(g)}">#${esc(g)}</button>`).join('')}</div>` : ''}
    ${isNew ? '' : `<button type="button" class="danger" data-act="del" data-id="${r.id}">刪除這部片</button>`}
  </form>`, (panel) => {
    const form = $('#f', panel);
    const pp = $('#pp', panel);
    const drawPoster = async () => {
      const src = previewURL || (!posterRemoved && d.poster ? await photoURL(d.poster) : null);
      pp.innerHTML = src
        ? `<img src="${src}" alt=""><button type="button" class="x" data-pdel aria-label="移除照片">×</button>`
        : `<label class="file-btn"><span>📷<small>海報／票根</small></span><input type="file" accept="image/*" id="pf"></label>`;
      const input = $('#pf', pp);
      if (input) input.onchange = async (e) => {
        const f = e.target.files[0];
        if (!f) return;
        try {
          posterBlob = await photoForCloud(f);
          if (previewURL) URL.revokeObjectURL(previewURL);
          previewURL = URL.createObjectURL(posterBlob);
          drawPoster();
        } catch (err) { toast(err.message); }
      };
    };
    drawPoster();

    form.addEventListener('change', (e) => { if (e.target.name === 'kind') form.dataset.kind = e.target.value; });
    panel.addEventListener('click', (e) => {
      const rate = e.target.closest('[data-rate]');
      if (rate) {
        const cur = Number(form.rating.value);
        const v = Number(rate.dataset.rate) === cur ? 0 : Number(rate.dataset.rate); // 再點一次同一格 = 取消評分
        form.rating.value = v;
        $('.star-input .stars', panel).style.setProperty('--v', v);
        $('#rv', panel).textContent = fmtRating(v) || '還沒評分';
      }
      const m = e.target.closest('[data-mood]');
      if (m) {
        form.mood.value = form.mood.value === m.dataset.mood ? '' : m.dataset.mood;
        panel.querySelectorAll('.mood').forEach((b) => b.classList.toggle('on', b.dataset.mood === form.mood.value));
      }
      const tg = e.target.closest('[data-addtag]');
      if (tg) {
        const cur = parseTags(form.tags.value);
        if (!cur.includes(tg.dataset.addtag)) form.tags.value = [...cur, tg.dataset.addtag].join(' ');
      }
      if (e.target.closest('[data-pdel]')) {
        if (previewURL) { URL.revokeObjectURL(previewURL); previewURL = null; }
        posterBlob = null;
        posterRemoved = true;
        drawPoster();
      }
    });

    form.onsubmit = async (e) => {
      e.preventDefault();
      const v = Object.fromEntries(new FormData(form));
      const rev = r || { id: uid(), createdAt: Date.now() };
      const oldPoster = rev.poster || '';
      if (posterBlob) {
        const pid = uid();
        await savePhoto(pid, posterBlob);
        rev.poster = pid;
        if (oldPoster) await deletePhoto(oldPoster);
      } else if (posterRemoved && oldPoster) {
        await deletePhoto(oldPoster);
        rev.poster = '';
      }
      Object.assign(rev, {
        kind: v.kind, title: v.title.trim(), original: v.original.trim(), year: v.year.trim(), type: v.type,
        rating: Number(v.rating) || 0, mood: v.mood, date: v.kind === 'seen' ? v.date || todayISO() : '',
        with: v.with.trim(), where: v.where, platform: v.platform.trim(), oneLiner: v.oneLiner.trim(),
        text: v.text.trim(), quote: v.quote.trim(), spoiler: v.spoiler === 'on', fav: v.fav === 'on', tags: parseTags(v.tags),
      });
      await saveReview(rev);
      await closeSheet();
      if (location.hash.startsWith('#/r/')) route();
      else { ui.tab = rev.kind; renderHome(); }
      toast(isNew || preset.kind ? (rev.kind === 'seen' ? '記下來了 🎬' : '加入想看 🍿') : '已儲存');
    };
  }, () => { if (previewURL) URL.revokeObjectURL(previewURL); });
}

function settingsSheet() {
  const n = pending.count();
  const seen = reviews.filter((r) => r.kind === 'seen').length;
  openSheet(`<div>
    <div class="sheet-head"><span style="min-width:48px"></span><b>設定與備份</b><button class="link strong" data-act="close-sheet">完成</button></div>
    <div class="account">
      <img src="${esc(user.user_metadata?.avatar_url || 'icons/icon-192.png')}" alt="" referrerpolicy="no-referrer">
      <div><b>${esc(user.user_metadata?.full_name || 'Google 帳號')}</b><small>${esc(user.email || '離線中')}</small></div>
    </div>
    <p class="hint">資料存在你的 Google 帳號底下，用同一個帳號登入的手機或電腦都會自動同步。沒網路時也能新增、修改，連上網路後會自動上傳。</p>
    <p class="hint">看過 ${seen} 部・想看 ${reviews.length - seen} 部・${n ? `⏳ 有 ${n} 項變更等待上傳` : '✅ 已全部同步'}${lastSync ? `（上次同步 ${new Date(lastSync).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}）` : ''}</p>
    <button class="btn" data-act="sync-now">🔄 立即同步</button>
    <button class="btn ghost" data-act="logout">登出</button>
    <h2 class="section">備份</h2>
    <p class="hint">可以另外匯出一份檔案自己保存（包含海報照片）。</p>
    <button class="btn ghost" data-act="export">⬇️ 匯出備份檔</button>
    <label class="btn ghost file-btn">⬆️ 從備份檔還原<input type="file" accept="application/json,.json" id="imp"></label>
    <h2 class="section">安裝到手機主畫面</h2>
    <p class="hint">
      <b>iPhone：</b>用 Safari 開啟 → 點下方「分享」按鈕 → 「加入主畫面」。<br>
      <b>Android：</b>用 Chrome 開啟 → 右上角 ⋮ → 「安裝應用程式」或「加到主畫面」。
    </p>
  </div>`, (panel) => {
    $('#imp', panel).onchange = async (e) => {
      const f = e.target.files[0];
      e.target.value = '';
      if (f) importData(f);
    };
  });
}

/* ============ 照片 ============ */
function compressImage(file, max, quality) {
  return new Promise((res, rej) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const s = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
      const c = document.createElement('canvas');
      c.width = Math.round(img.naturalWidth * s);
      c.height = Math.round(img.naturalHeight * s);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      c.toBlob((b) => (b ? res(b) : rej(new Error('照片壓縮失敗'))), 'image/jpeg', quality);
    };
    img.onerror = () => { URL.revokeObjectURL(url); rej(new Error(`無法讀取 ${file.name}`)); };
    img.src = url;
  });
}
// 海報壓縮到約 150 KB 以下，省雲端空間也上傳得快（海報牆只顯示小圖，800px 放大看也夠清楚）
async function photoForCloud(file) {
  let blob = await compressImage(file, 800, 0.72);
  if (blob.size > 150_000) blob = await compressImage(file, 640, 0.6);
  return blob;
}
async function hydratePhotos(root) {
  await Promise.all([...root.querySelectorAll('img[data-photo]')].map(async (img) => {
    const u = await photoURL(img.dataset.photo);
    if (u) img.src = u;
  }));
}
function viewPhoto(src) {
  const v = document.createElement('div');
  v.className = 'viewer';
  v.innerHTML = `<img src="${src}" alt="">`;
  v.onclick = () => v.remove();
  document.body.appendChild(v);
}

/* ============ 備份 / 分享 ============ */
const blobToDataURL = (b) => new Promise((res) => { const r = new FileReader(); r.onload = () => res(r.result); r.readAsDataURL(b); });

async function shareFile(file, title) {
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try { await navigator.share({ files: [file], title }); return; }
    catch (err) { if (err.name === 'AbortError') return; }
  }
  const url = URL.createObjectURL(file);
  const a = Object.assign(document.createElement('a'), { href: url, download: file.name });
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

async function exportData() {
  toast('準備備份中…');
  const photos = [];
  for (const r of reviews) {
    if (!r.poster) continue;
    try { photos.push({ id: r.poster, data: await blobToDataURL(await photoBlob(r.poster)) }); }
    catch { /* 離線且沒下載過的照片略過 */ }
  }
  const data = { app: 'seesaw', version: 1, exportedAt: new Date().toISOString(), reviews, photos };
  const file = new File([JSON.stringify(data)], `seesaw-備份-${todayISO()}.json`, { type: 'application/json' });
  await shareFile(file, 'seesaw 備份');
}

async function importData(file) {
  try {
    const data = JSON.parse(await file.text());
    if (data.app !== 'seesaw' || !Array.isArray(data.reviews)) throw new Error('這不是 seesaw 的備份檔');
    if (!confirm(`備份內有 ${data.reviews.length} 部片。\n相同的紀錄會被備份內容覆蓋，確定還原？`)) return;
    for (const p of data.photos || []) await savePhoto(p.id, await (await fetch(p.data)).blob());
    for (const r of data.reviews) await saveReview(r);
    await closeSheet();
    route();
    toast('還原完成 🎉');
  } catch (err) {
    toast('還原失敗：' + err.message);
  }
}

async function shareReview(r) {
  const t = TYPES[r.type] || TYPES.movie;
  const star = (v) => '★'.repeat(Math.floor(v)) + (v % 1 ? '½' : '');
  let text = `${t.icon} ${r.title}${r.year ? `（${r.year}）` : ''}\n`;
  if (r.kind === 'seen') {
    if (r.rating) text += `${star(r.rating)} ${fmtRating(r.rating)} / 5${r.mood ? ' ' + r.mood : ''}\n`;
    if (r.oneLiner) text += `\n「${r.oneLiner}」\n`;
    if (r.text) text += r.spoiler ? '\n（心得含劇透，看完再跟你說 🤫）\n' : `\n${r.text}\n`;
    if (r.quote) text += `\n💬 ${r.quote}\n`;
  } else {
    text += `🍿 想看${r.platform ? `・${r.platform}` : ''}\n${r.oneLiner ? `\n${r.oneLiner}\n` : ''}`;
  }
  if (r.tags?.length) text += `\n${r.tags.map((g) => '#' + g).join(' ')}\n`;
  text += '\n— 記錄於 seesaw 觀影筆記';
  if (navigator.share) {
    try { await navigator.share({ title: r.title, text }); return; } catch (err) { if (err.name === 'AbortError') return; }
  }
  await navigator.clipboard.writeText(text);
  toast('已複製，可以貼到 LINE 或 IG');
}

/* ============ 點擊事件 ============ */
document.addEventListener('click', async (e) => {
  const el = e.target.closest('[data-act]');
  const link = e.target.closest('a[href]');
  if (link && (!el || el.contains(link))) return; // 讓連結（返回、卡片）正常開啟
  if (!el) return;
  const r = reviews.find((x) => x.id === el.dataset.id);
  switch (el.dataset.act) {
    case 'close-sheet': return closeSheet();
    case 'login': return login(el);
    case 'logout': return logout();
    case 'sync-now':
      try {
        toast('同步中…');
        await sync();
        await closeSheet();
        route();
        toast('已同步 ✅');
      } catch (err) { toast('同步失敗：' + friendly(err)); }
      return;
    case 'settings': return settingsSheet();
    case 'export': return exportData();
    case 'tab': ui.tab = el.dataset.tab; window.scrollTo(0, 0); return renderHome();
    case 'filter': ui.filter = el.dataset.f; return renderHome();
    case 'sort': ui.sort = ui.sort === 'date' ? 'rating' : 'date'; return renderHome();
    case 'year': ui.year = el.dataset.y; return renderHome();
    case 'new': return reviewForm();
    case 'edit': return reviewForm(r);
    case 'watched': return reviewForm(r, { kind: 'seen', date: todayISO() });
    case 'share': return shareReview(r);
    case 'reveal': $('#essay').classList.remove('spoiler'); el.remove(); return;
    case 'tag':
      ui.q = el.dataset.tag;
      ui.filter = 'all';
      ui.tab = reviews.some((x) => x.kind === 'seen' && x.tags?.includes(ui.q)) ? 'seen' : 'want';
      location.hash = '#/';
      return;
    case 'view-poster': {
      const img = $('img[src]', el);
      if (img) viewPhoto(img.src);
      return;
    }
    case 'del':
      if (!confirm(`確定刪除「${r.title}」？\n心得和海報照片都會一起刪除，無法復原。`)) return;
      await deleteReviewData(r);
      await closeSheet();
      if (location.hash.startsWith('#/r/')) location.hash = '#/';
      else renderHome();
      return;
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if ($('.viewer')) $('.viewer').remove();
    else if ($('#sheet').classList.contains('open')) closeSheet();
  }
});

// 從單部片返回列表時，回到原本捲動的位置
let lastHash = location.hash;
window.addEventListener('hashchange', () => {
  const toDetail = location.hash.startsWith('#/r/');
  if (toDetail && !lastHash.startsWith('#/r/')) ui.scroll = window.scrollY;
  lastHash = location.hash;
  if (isEditing()) closeSheet();
  route();
  window.scrollTo(0, toDetail ? 0 : ui.scroll);
});

/* ============ 登入 / 啟動 ============ */
async function login(btn) {
  btn.disabled = true;
  const { error } = await sb.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: location.origin + location.pathname, queryParams: { prompt: 'select_account' } },
  });
  if (error) { toast('登入失敗：' + friendly(error)); btn.disabled = false; }
}

async function logout() {
  const n = pending.count();
  const msg = n
    ? `還有 ${n} 項變更沒上傳到雲端，登出會遺失這些變更！\n確定要登出嗎？`
    : '確定要登出嗎？\n這支手機上的快取會被清除，雲端的資料不受影響，下次登入就會回來。';
  if (!confirm(msg)) return;
  await closeSheet();
  await sb.auth.signOut({ scope: 'local' }); // 只登出這支手機
  // 清掉本機快取，避免下一個使用這台裝置的人看到
  reviews = [];
  photoURLs.forEach((u) => URL.revokeObjectURL(u));
  photoURLs.clear();
  pending.clear();
  store.set('cache-user', '');
  await DB.clear().catch(() => {});
}

async function boot() {
  if (!user) return route();
  if (store.get('cache-user') !== user.id) {
    // 換了帳號：清掉上一個人留在這支手機的快取
    await DB.clear();
    pending.clear();
    store.set('cache-user', user.id);
  }
  reviews = await DB.all('reviews');
  if (reviews.length) route(); else renderLoading('同步中…');
  try {
    await sync();
    if (!isEditing()) route();
  } catch (err) {
    if (!reviews.length) route();
    toast(user.offline ? '目前離線，顯示的是上次同步的資料' : '同步失敗：' + friendly(err));
  }
}

// 從背景切回來、或網路恢復時，自動同步
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && user && Date.now() - lastSync > 30000) scheduleSync(0);
});
window.addEventListener('online', async () => {
  if (user?.offline) {
    const { data } = await sb.auth.getSession();
    if (data.session) user = data.session.user;
  }
  if (user) scheduleSync(0);
});

// 新版上線時自動更新：切回 App 時檢查，有新版就重新載入（正在編輯時，等關掉表單再更新）
let updateReady = false;
function reloadIfIdle() {
  if (updateReady && !isEditing()) location.reload();
}
if ('serviceWorker' in navigator) {
  const hadController = Boolean(navigator.serviceWorker.controller);
  navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).then((reg) => {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') reg.update().catch(() => {});
    });
  }).catch(() => {});
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadController) return; // 第一次安裝，畫面本來就是最新的
    updateReady = true;
    reloadIfIdle();
  });
}

(async () => {
  if (!configured) {
    app.innerHTML = '<div class="empty"><div class="big">🔧</div><b>還沒連上雲端資料庫</b>請在 config.js 填入 Supabase 的 Project URL 和 Publishable key</div>';
    return;
  }
  renderLoading();
  await DB.open();
  const { data } = await sb.auth.getSession(); // 會順便處理 Google 登入完跳回來的網址
  const params = new URLSearchParams(location.search);
  if (params.has('code') || params.has('error')) {
    const err = params.get('error_description');
    if (err) toast('登入失敗：' + err);
    history.replaceState(null, '', location.pathname + location.hash);
  }
  user = data.session?.user ?? null;
  // 離線打開時登入憑證可能無法更新：先用上次同步的資料，網路恢復後再重新連線
  if (!user && !navigator.onLine && store.get('cache-user')) user = { id: store.get('cache-user'), offline: true };
  sb.auth.onAuthStateChange((_event, session) => {
    const u = session?.user ?? null;
    if ((u?.id ?? null) === (user?.id ?? null)) { if (u) user = u; return; } // 同一個人（例如憑證更新）
    if (!u && user?.offline) return;
    user = u;
    boot();
  });
  boot();
})().catch((err) => {
  app.innerHTML = `<div class="empty"><div class="big">⚠️</div><b>啟動失敗</b>${esc(friendly(err))}<br>若是無痕模式，請改用一般模式開啟。</div>`;
});
