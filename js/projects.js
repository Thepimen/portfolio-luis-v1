/* ==========================================================================
   projects.js — GitHub repo cards, IDE explorer, tech filter, live stats,
   architecture dialog.
   ========================================================================== */
(function () {
  'use strict';
  const LLP = window.LLP;
  const esc = LLP.esc;
  const icon = (id) => `<svg class="ico" aria-hidden="true"><use href="#i-${id}"/></svg>`;

  function langStats(langs) {
    const total = Object.values(langs).reduce((a, b) => a + b, 0) || 1;
    return Object.entries(langs)
      .map(([name, bytes]) => ({
        name: name === 'Config' ? 'Docker · Wazuh config' : name,
        key: name,
        pct: (bytes / total) * 100,
        color: LLP.langColors[name] || '#6b7280'
      }))
      .sort((a, b) => b.pct - a.pct);
  }
  LLP.langStats = langStats;

  function langBar(p) {
    const stats = langStats(p.langs);
    const label = stats.map((s) => `${s.name} ${s.pct.toFixed(1)}%`).join(', ');
    const bar = stats.map((s) => `<span style="width:${s.pct.toFixed(2)}%;background:${s.color}" title="${esc(s.name)} ${s.pct.toFixed(1)}%"></span>`).join('');
    const legend = stats.slice(0, 3).map((s) => `<li><i style="background:${s.color}"></i>${esc(s.name)} <b>${s.pct.toFixed(1)}%</b></li>`).join('');
    return `<div class="lang-bar" role="img" aria-label="Lenguajes: ${esc(label)}">${bar}</div><ul class="lang-legend mono">${legend}</ul>`;
  }
  LLP.langBar = langBar;

  function card(p) {
    const url = 'https://github.com/' + p.repo;
    const [owner, name] = p.repo.split('/');
    return `<article class="repo-card spot${p.featured ? ' repo-card-featured' : ''}" id="repo-${p.id}" data-id="${p.id}" data-cats="${p.cats.join(' ')}" tabindex="-1">
      <header class="repo-head">
        ${icon('repo')}
        <a class="repo-name mono" href="${url}" target="_blank" rel="noopener noreferrer">${esc(owner)}/<b>${esc(name)}</b></a>
        <span class="vis mono">Public</span>
        ${p.featured ? '<span class="chip chip-accent mono">★ featured</span>' : ''}
      </header>
      <div class="repo-preview diagram-host" data-diagram="${p.id}" data-compact="${p.featured ? 'false' : 'true'}" aria-hidden="true"></div>
      <p class="repo-desc">${esc(p.tagline)}</p>
      <ul class="badge-row" aria-label="Arquitectura">${p.badges.map((b) => `<li class="badge">${esc(b)}</li>`).join('')}</ul>
      ${langBar(p)}
      <footer class="repo-foot">
        <div class="repo-meta mono">
          <span title="Estrellas">${icon('star')}<b data-stars>${p.stars}</b></span>
          <span title="Commits">${icon('commit')}<b data-commits>${p.commits ?? '—'}</b> commits</span>
          <span data-pushed>${p.year}</span>
        </div>
        <div class="repo-actions">
          <a class="btn btn-sm btn-ghost" href="${url}" target="_blank" rel="noopener noreferrer">${icon('github')} View Code</a>
          <button type="button" class="btn btn-sm btn-primary" data-arch="${p.id}">Architecture</button>
        </div>
      </footer>
    </article>`;
  }

  function explorer() {
    const tree = LLP.$('#explorer-tree');
    if (!tree) return;
    tree.innerHTML = Object.entries(LLP.categories).map(([key, label]) => {
      const items = LLP.projects.filter((p) => p.cats.includes(key));
      return `<details open class="tree-folder">
        <summary>${icon('folder')}<span>${key}/</span><span class="tree-count">${items.length}</span></summary>
        <ul>${items.map((p) => `<li><button type="button" class="tree-file" data-goto="${p.id}" title="${esc(label)}">${icon('file')}<span>${esc(p.name)}</span><i class="tree-lang" style="background:${langStats(p.langs)[0].color}"></i></button></li>`).join('')}</ul>
      </details>`;
    }).join('');
    tree.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-goto]');
      if (!btn) return;
      LLP.$$('.tree-file').forEach((b) => b.classList.toggle('is-active', b === btn));
      focusRepo(btn.dataset.goto);
    });
  }

  function focusRepo(id) {
    const el = document.getElementById('repo-' + id);
    if (!el) return;
    if (el.classList.contains('is-hidden')) applyFilter('all', '');
    el.scrollIntoView({ behavior: LLP.reducedMotion ? 'auto' : 'smooth', block: 'center' });
    el.classList.remove('is-flash'); void el.offsetWidth; el.classList.add('is-flash');
    el.focus({ preventScroll: true });
  }
  LLP.focusRepo = focusRepo;

  let currentFilter = 'all';
  let currentQuery = '';
  function applyFilter(filter, query) {
    currentFilter = filter; currentQuery = query.trim().toLowerCase();
    LLP.$$('#project-filters .filter').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.filter === filter)));
    const search = LLP.$('#project-search');
    if (search && search.value.toLowerCase() !== currentQuery) search.value = query;
    let visible = 0;
    LLP.projects.forEach((p) => {
      const el = document.getElementById('repo-' + p.id);
      if (!el) return;
      const hay = [p.name, p.tagline, ...p.badges, ...Object.keys(p.langs)].join(' ').toLowerCase();
      const show = (filter === 'all' || p.cats.includes(filter)) && (!currentQuery || hay.includes(currentQuery));
      el.classList.toggle('is-hidden', !show);
      if (show) visible++;
    });
    const grid = LLP.$('#repo-grid');
    let empty = LLP.$('.repo-empty', grid);
    if (!visible) {
      if (!empty) { empty = document.createElement('p'); empty.className = 'repo-empty mono'; grid.appendChild(empty); }
      empty.textContent = `grep: no matches for "${query}"`;
    } else if (empty) empty.remove();
  }
  LLP.filterProjects = (f) => applyFilter(f, currentQuery);

  function filters() {
    LLP.$$('#project-filters .filter').forEach((b) => {
      const f = b.dataset.filter;
      const n = f === 'all' ? LLP.projects.length : LLP.projects.filter((p) => p.cats.includes(f)).length;
      LLP.$('.count', b).textContent = n;
      b.addEventListener('click', () => applyFilter(f, currentQuery));
    });
    const search = LLP.$('#project-search');
    if (search) search.addEventListener('input', () => applyFilter(currentFilter, search.value));
  }

  /* ---------- live GitHub stats ---------- */
  let commitsRequested = false;
  function liveStats() {
    LLP.github.load().then((gh) => {
      LLP.projects.forEach((p) => {
        const r = gh.repos.find((x) => x.full.toLowerCase() === p.repo.toLowerCase());
        const el = document.getElementById('repo-' + p.id);
        if (!r || !el) return;
        p.stars = r.stars;
        LLP.$('[data-stars]', el).textContent = r.stars;
        const pushed = LLP.$('[data-pushed]', el);
        pushed.textContent = LLP.relTime(r.pushed);
        pushed.title = 'Último push: ' + new Date(r.pushed).toLocaleString('es-ES');
        if (gh.commits && gh.commits[p.repo] != null) LLP.$('[data-commits]', el).textContent = gh.commits[p.repo];
      });
    }).catch(() => { /* offline or rate limited → static snapshot stays */ });
  }
  async function liveCommits() {
    if (commitsRequested) return;
    commitsRequested = true;
    try { await LLP.github.load(); } catch (_) { return; }
    for (const p of LLP.projects) {
      try {
        const n = await LLP.github.commits(p.repo);
        p.commits = n;
        const el = document.getElementById('repo-' + p.id);
        if (el) LLP.$('[data-commits]', el).textContent = n;
      } catch (_) { break; } // rate-limited: keep placeholders
    }
  }

  /* ---------- architecture dialog ---------- */
  function openArch(id) {
    const p = LLP.projects.find((x) => x.id === id);
    const dlg = LLP.$('#arch-dialog');
    if (!p || !dlg) return;
    const url = 'https://github.com/' + p.repo;
    LLP.$('#arch-crumb').textContent = p.repo + ' · architecture.md';
    LLP.$('#arch-title').textContent = p.name;
    LLP.$('#arch-diagram').innerHTML = LLP.diagram(p.diagram, { width: 760 });
    LLP.$('#arch-body').innerHTML = `
      <p class="arch-tagline">${esc(p.tagline)}</p>
      <div class="arch-grid">
        <div>
          <h3 class="arch-h mono">// highlights</h3>
          <ul class="arch-list">${p.highlights.map((h) => `<li>${esc(h)}</li>`).join('')}</ul>
          ${p.endpoints ? `<h3 class="arch-h mono">// endpoints</h3><pre class="arch-code mono">${p.endpoints.map((e) => esc(e)).join('\n')}</pre>` : ''}
        </div>
        <div>
          <h3 class="arch-h mono">// languages</h3>
          ${langBar(p)}
          <h3 class="arch-h mono">// stack</h3>
          <ul class="badge-row">${p.badges.map((b) => `<li class="badge">${esc(b)}</li>`).join('')}</ul>
          <div class="card-actions">
            <a class="btn btn-sm btn-primary" href="${url}" target="_blank" rel="noopener noreferrer">${icon('github')} View Code</a>
          </div>
        </div>
      </div>`;
    if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
  }
  LLP.openArch = openArch;

  function closeArch() {
    const dlg = LLP.$('#arch-dialog');
    if (dlg.open) { if (typeof dlg.close === 'function') dlg.close(); else dlg.removeAttribute('open'); }
  }

  LLP.initProjects = function () {
    const grid = LLP.$('#repo-grid');
    if (grid) grid.innerHTML = LLP.projects.map(card).join('');
    LLP.mountDiagrams(document);
    explorer();
    filters();
    liveStats();

    document.addEventListener('click', (e) => {
      const b = e.target.closest('[data-arch]');
      if (b) openArch(b.dataset.arch);
    });
    const dlg = LLP.$('#arch-dialog');
    LLP.$('#arch-close').addEventListener('click', closeArch);
    dlg.addEventListener('click', (e) => { if (e.target === dlg) closeArch(); });

    LLP.on('route', (path) => { if (path === '/projects') liveCommits(); });
  };
})();
