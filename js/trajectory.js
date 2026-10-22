/* ==========================================================================
   trajectory.js — interactive timeline, skill bars, tech icon grids.
   ========================================================================== */
(function () {
  'use strict';
  const LLP = window.LLP;
  const esc = LLP.esc;
  const DEVICON = 'https://cdn.jsdelivr.net/gh/devicons/devicon@v2.16.0/icons/';
  const TRACK_LABEL = { edu: 'formación', eng: 'ingeniería', work: 'experiencia' };

  /* ---------- tech icons (real logos via Devicon, monogram fallback) ---------- */
  function techItem(t) {
    return `<li class="tech" title="${esc(t.n)}">
      <span class="tech-ico"><img src="${DEVICON}${t.i}/${t.i}-original.svg" alt="" width="26" height="26" loading="lazy" decoding="async" data-mono="${esc(t.n.slice(0, 2))}"></span>
      <span class="tech-name mono">${esc(t.n)}</span></li>`;
  }
  function wireIconFallback(ctx) {
    LLP.$$('img[data-mono]', ctx).forEach((img) => {
      img.addEventListener('error', () => {
        const s = document.createElement('span');
        s.className = 'tech-mono mono';
        s.textContent = img.dataset.mono;
        img.replaceWith(s);
      }, { once: true });
    });
  }
  LLP.renderStacks = function () {
    const home = LLP.$('#home-stack');
    if (home) { home.innerHTML = LLP.stack.filter((t) => t.home).map(techItem).join(''); wireIconFallback(home); }
    const full = LLP.$('#full-stack');
    if (full) { full.innerHTML = LLP.stack.map(techItem).join(''); wireIconFallback(full); }
  };

  /* ---------- skill bars ---------- */
  function renderSkills() {
    const ul = LLP.$('#skill-bars');
    if (!ul) return;
    ul.innerHTML = LLP.skills.map((s) => `<li class="skill">
      <div class="skill-row"><span class="skill-name">${esc(s.name)}</span><span class="skill-pct mono">${s.level}%</span></div>
      <div class="skill-track" role="progressbar" aria-valuenow="${s.level}" aria-valuemin="0" aria-valuemax="100" aria-label="${esc(s.name)}"><span class="skill-fill" style="--w:${s.level}%"></span></div>
      <span class="skill-note mono">${esc(s.note)}</span></li>`).join('');
  }

  /* ---------- timeline ---------- */
  function renderTimeline() {
    const ol = LLP.$('#timeline');
    if (!ol) return;
    ol.innerHTML = '<span class="tl-progress" aria-hidden="true"></span>' + LLP.timeline.map((it, i) => {
      const repos = it.repos.map((r) => {
        const p = LLP.projects.find((x) => x.name === r);
        return p
          ? `<button type="button" class="chip chip-btn mono" data-repo="${p.id}">↗ ${esc(r)}</button>`
          : `<a class="chip chip-btn mono" href="https://github.com/${LLP.profile.handle}/${encodeURIComponent(r)}" target="_blank" rel="noopener noreferrer">↗ ${esc(r)}</a>`;
      }).join('');
      return `<li class="tl-item${it.next ? ' tl-next' : ''}" data-track="${it.track}">
        <span class="tl-node" aria-hidden="true"></span>
        <button type="button" class="tl-card spot" aria-expanded="${i === 0}" aria-controls="tl-d-${i}">
          <span class="tl-meta"><span class="tl-period mono">${esc(it.period)}</span><span class="tl-track tl-track-${it.track} mono">${TRACK_LABEL[it.track]}</span></span>
          <span class="tl-title">${esc(it.title)}</span>
          <span class="tl-org mono">${esc(it.org)}</span>
          <span class="tl-summary">${esc(it.summary)}</span>
          <span class="tl-chevron mono" aria-hidden="true">+</span>
        </button>
        <div class="tl-detail" id="tl-d-${i}"${i === 0 ? '' : ' hidden'}>
          <ul class="tl-bullets">${it.bullets.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>
          <div class="tl-tags">${it.tags.map((t) => `<span class="badge">${esc(t)}</span>`).join('')}${repos}</div>
        </div>
      </li>`;
    }).join('');

    ol.addEventListener('click', (e) => {
      const repo = e.target.closest('[data-repo]');
      if (repo) {
        LLP.router.navigate('/projects');
        requestAnimationFrame(() => LLP.focusRepo(repo.dataset.repo));
        return;
      }
      const btn = e.target.closest('.tl-card');
      if (!btn) return;
      const open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      document.getElementById(btn.getAttribute('aria-controls')).hidden = open;
      updateProgress();
    });

    LLP.$$('#timeline-filters .filter').forEach((b) => b.addEventListener('click', () => {
      const track = b.dataset.track;
      LLP.$$('#timeline-filters .filter').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      LLP.$$('.tl-item', ol).forEach((li) => li.classList.toggle('is-dim', track !== 'all' && li.dataset.track !== track));
    }));
  }

  /* progress line fills as the timeline crosses the viewport centre */
  function updateProgress() {
    const ol = LLP.$('#timeline');
    if (!ol || ol.closest('.view').hidden) return;
    const r = ol.getBoundingClientRect();
    const mid = window.innerHeight * 0.55;
    const ratio = Math.min(1, Math.max(0, (mid - r.top) / r.height));
    ol.style.setProperty('--progress', ratio.toFixed(3));
    LLP.$$('.tl-item', ol).forEach((li) => {
      li.classList.toggle('is-reached', li.getBoundingClientRect().top < mid);
    });
  }

  LLP.initTrajectory = function () {
    renderSkills();
    renderTimeline();
    LLP.renderStacks();
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);
    LLP.on('route', (path) => {
      if (path === '/trajectory') {
        requestAnimationFrame(() => {
          LLP.$$('.skill-bars').forEach((u) => u.classList.add('is-on'));
          updateProgress();
        });
      }
    });
  };
})();
