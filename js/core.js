/* ==========================================================================
   core.js — utilities, event bus, theme engine, router, GitHub live data,
   spotlight micro-interactions, clock, toast.
   ========================================================================== */
(function () {
  'use strict';
  const LLP = window.LLP;
  const root = document.documentElement;

  /* ---------- tiny helpers ---------- */
  LLP.$ = (sel, ctx = document) => ctx.querySelector(sel);
  LLP.$$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  LLP.esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  LLP.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  LLP.isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
  LLP.isTyping = (e) => {
    const t = e.target;
    return !!t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));
  };
  LLP.sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  LLP.cssVar = (name) => getComputedStyle(root).getPropertyValue(name).trim();

  /* ---------- event bus ---------- */
  const bus = new EventTarget();
  LLP.on = (type, fn) => bus.addEventListener(type, (e) => fn(e.detail));
  LLP.emit = (type, detail) => bus.dispatchEvent(new CustomEvent(type, { detail }));

  /* ---------- toast ---------- */
  let toastTimer;
  LLP.toast = (msg) => {
    const el = LLP.$('#toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('is-on'), 2400);
  };

  /* ---------- clipboard ---------- */
  LLP.copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (_) {
      const ta = document.createElement('textarea');
      ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      let ok = false;
      try { ok = document.execCommand('copy'); } catch (__) { ok = false; }
      ta.remove();
      return ok;
    }
  };
  LLP.copyEmail = async () => {
    const ok = await LLP.copyText(LLP.profile.email);
    LLP.toast(ok ? '✓ Email copiado: ' + LLP.profile.email : 'No se pudo copiar · ' + LLP.profile.email);
    return ok;
  };

  /* ======================================================================
     THEME ENGINE · persisted in localStorage, animated with View Transitions
     ====================================================================== */
  const THEME_KEY = 'llp-theme';
  LLP.theme = {
    get: () => root.getAttribute('data-theme') || 'dark',
    set(next) {
      if (next !== 'dark' && next !== 'light') return;
      try { localStorage.setItem(THEME_KEY, next); } catch (_) { /* private mode */ }
      if (next === this.get()) { syncThemeUI(next); LLP.emit('theme', next); return; }
      root.classList.add('theme-anim');
      root.setAttribute('data-theme', next);
      syncThemeUI(next);
      LLP.emit('theme', next);
      clearTimeout(this._t);
      this._t = setTimeout(() => root.classList.remove('theme-anim'), 320);
    },
    toggle(origin) { this.set(this.get() === 'dark' ? 'light' : 'dark', origin); },
    sync() { syncThemeUI(this.get()); }
  };
  function syncThemeUI(t) {
    const btn = LLP.$('#theme-toggle');
    if (btn) btn.setAttribute('aria-label', t === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
    const sb = LLP.$('#sb-theme');
    if (sb) sb.textContent = t;
    const meta = LLP.$('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', t === 'dark' ? '#090A0F' : '#F8FAFC');
  }

  /* ======================================================================
     ROUTER · History API (http/https) with hash fallback (file://)
     ====================================================================== */
  const ROUTES = ['/', '/projects', '/trajectory', '/lab', '/contact'];
  const ALIASES = { '/terminal': '/lab', '/home': '/', '/index.html': '/', '/about': '/trajectory' };
  const useHash = location.protocol === 'file:';

  function normalize(p) {
    p = String(p || '/').split('?')[0].split('#')[0].toLowerCase().replace(/\/+$/, '') || '/';
    if (ALIASES[p]) p = ALIASES[p];
    return ROUTES.includes(p) ? p : '/';
  }
  function readLocation() {
    if (location.hash.startsWith('#/')) return normalize(location.hash.slice(1));
    return useHash ? '/' : normalize(location.pathname);
  }

  LLP.router = {
    routes: ROUTES,
    current: null,
    navigate(path, opts = {}) {
      const target = normalize(path);
      if (target === this.current) {
        window.scrollTo({ top: 0, behavior: LLP.reducedMotion ? 'auto' : 'smooth' });
        return;
      }
      const url = useHash ? '#' + target : target;
      if (opts.replace) history.replaceState({ route: target }, '', url);
      else history.pushState({ route: target }, '', url);
      render(target);
    },
    init() {
      if (useHash) {
        LLP.$$('a[data-link]').forEach((a) => a.setAttribute('href', '#' + normalize(a.getAttribute('href'))));
      }
      document.addEventListener('click', (e) => {
        const a = e.target.closest('a[data-link]');
        if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        this.navigate(a.getAttribute('href').replace(/^#/, ''));
      });
      window.addEventListener('popstate', () => render(readLocation()));
      window.addEventListener('hashchange', () => render(readLocation()));
      const initial = readLocation();
      // Canonicalise legacy hash URLs (#/projects) when served over http.
      if (!useHash && location.hash.startsWith('#/')) history.replaceState({ route: initial }, '', initial);
      render(initial, true);
    }
  };

  function render(path, first) {
    const views = LLP.$$('.view');
    let next = null;
    views.forEach((v) => {
      const match = v.dataset.view === path;
      if (match) next = v;
      v.hidden = !match;
      v.classList.remove('view-enter');
    });
    if (!next) return;
    if (!first && !LLP.reducedMotion) {
      void next.offsetWidth; // restart animation
      next.classList.add('view-enter');
    }
    LLP.router.current = path;
    document.title = next.dataset.title || document.title;
    LLP.$$('.tab').forEach((t) => {
      if (t.dataset.route === path) t.setAttribute('aria-current', 'page');
      else t.removeAttribute('aria-current');
    });
    moveIndicator();
    const sb = LLP.$('#sb-route');
    if (sb) sb.textContent = '~' + (path === '/' ? '/' : path);
    if (!first) {
      window.scrollTo(0, 0);
      LLP.$('#main').focus({ preventScroll: true });
    }
    LLP.emit('route', path);
  }

  function moveIndicator() {
    const ind = LLP.$('.tab-indicator');
    const active = LLP.$('.tab[aria-current="page"]');
    if (!ind || !active) return;
    ind.style.width = active.offsetWidth + 'px';
    ind.style.transform = `translateX(${active.offsetLeft}px)`;
  }
  window.addEventListener('resize', moveIndicator);
  LLP.moveIndicator = moveIndicator;

  /* ======================================================================
     GITHUB LIVE DATA · 1 call for repos + 1 for user, commits lazily.
     Cached in sessionStorage (30 min) to stay far below the 60 req/h limit.
     ====================================================================== */
  const GH_KEY = 'llp-gh-v1';
  const GH_TTL = 30 * 60 * 1000;
  function readCache() {
    try {
      const c = JSON.parse(sessionStorage.getItem(GH_KEY) || 'null');
      if (c && Date.now() - c.ts < GH_TTL) return c;
    } catch (_) { /* ignore */ }
    return null;
  }
  function writeCache(data) {
    try { sessionStorage.setItem(GH_KEY, JSON.stringify(Object.assign({ ts: Date.now() }, data))); } catch (_) { /* ignore */ }
  }
  LLP.github = {
    _p: null,
    load() {
      if (this._p) return this._p;
      const cached = readCache();
      if (cached && cached.repos) { this._p = Promise.resolve(cached); return this._p; }
      const user = LLP.profile.handle;
      const opts = { headers: { Accept: 'application/vnd.github+json' } };
      this._p = Promise.all([
        fetch(`https://api.github.com/users/${user}`, opts).then((r) => (r.ok ? r.json() : Promise.reject(r.status))),
        fetch(`https://api.github.com/users/${user}/repos?per_page=100&sort=pushed`, opts).then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      ]).then(([u, repos]) => {
        const data = {
          publicRepos: u.public_repos,
          repos: repos.map((r) => ({ name: r.name, full: r.full_name, stars: r.stargazers_count, pushed: r.pushed_at, fork: r.fork })),
          commits: (cached && cached.commits) || {}
        };
        writeCache(data);
        return data;
      });
      return this._p;
    },
    async commits(full) {
      const cached = readCache() || {};
      const map = cached.commits || {};
      if (map[full] != null) return map[full];
      const res = await fetch(`https://api.github.com/repos/${full}/commits?per_page=1`, { headers: { Accept: 'application/vnd.github+json' } });
      if (!res.ok) throw new Error(String(res.status));
      const link = res.headers.get('Link') || '';
      const m = link.match(/[?&]page=(\d+)>;\s*rel="last"/);
      const n = m ? parseInt(m[1], 10) : (await res.json()).length;
      const fresh = readCache();
      if (fresh) { fresh.commits = fresh.commits || {}; fresh.commits[full] = n; writeCache(fresh); }
      return n;
    }
  };

  LLP.relTime = (iso) => {
    const diff = (Date.now() - new Date(iso).getTime()) / 1000;
    const rtf = new Intl.RelativeTimeFormat('es', { numeric: 'auto' });
    const steps = [[60, 'second'], [3600, 'minute', 60], [86400, 'hour', 3600], [2592000, 'day', 86400], [31536000, 'month', 2592000], [Infinity, 'year', 31536000]];
    for (const [lim, unit, div = 1] of steps) {
      if (diff < lim) return rtf.format(-Math.round(diff / div), unit);
    }
    return '';
  };

  /* ======================================================================
     SPOTLIGHT (cursor-following glow) + status bar cursor telemetry
     ====================================================================== */
  LLP.pointer = { x: 0, y: 0 };
  let rafPending = false, lastEvt = null;
  document.addEventListener('pointermove', (e) => {
    lastEvt = e;
    LLP.pointer.x = e.clientX; LLP.pointer.y = e.clientY;
    if (rafPending) return;
    rafPending = true;
    requestAnimationFrame(() => {
      rafPending = false;
      const ev = lastEvt;
      const card = ev.target.closest && ev.target.closest('.spot');
      if (card) {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', (ev.clientX - r.left) + 'px');
        card.style.setProperty('--my', (ev.clientY - r.top) + 'px');
      }
      const sb = document.getElementById('sb-cursor');
      if (sb) sb.textContent = `Ln ${Math.round(ev.clientY + window.scrollY)}, Col ${Math.round(ev.clientX)}`;
    });
  }, { passive: true });

  /* ======================================================================
     CLOCK + live UTC offset for Europe/Madrid (CET/CEST aware)
     ====================================================================== */
  LLP.startClock = () => {
    const fmt = new Intl.DateTimeFormat('es-ES', { timeZone: 'Europe/Madrid', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    const el = LLP.$('#clock');
    const tick = () => { if (el) el.textContent = fmt.format(new Date()); };
    tick();
    setInterval(tick, 1000);
  };
})();
