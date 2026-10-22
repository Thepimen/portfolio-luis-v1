/* ==========================================================================
   main.js — application bootstrap, global keyboard shortcuts (Linear/GitHub
   style `G` chords + backtick terminal jump), Bento cards and live GitHub feed.
   ========================================================================== */
(function () {
  'use strict';
  const LLP = window.LLP;

  function initHeaderAndShortcuts() {
    LLP.theme.sync();
    const toggle = LLP.$('#theme-toggle');
    if (toggle) toggle.addEventListener('click', () => LLP.theme.toggle(toggle));

    if (LLP.isMac) {
      LLP.$$('[data-mod-key]').forEach((el) => { el.textContent = '⌘ K'; });
    }

    // Bento cards with data-href act as accessible links
    LLP.$$('[data-href]').forEach((card) => {
      const go = () => LLP.router.navigate(card.dataset.href);
      card.addEventListener('click', go);
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          go();
        }
      });
    });

    // Global developer shortcuts: `G` + `H/P/T/L/C` and `` ` `` for Lab terminal
    let gChord = false;
    let gTimer = null;
    document.addEventListener('keydown', (e) => {
      if (LLP.isTyping(e) || e.ctrlKey || e.metaKey || e.altKey) return;
      const k = e.key.toLowerCase();

      if (e.key === '`') {
        e.preventDefault();
        LLP.router.navigate('/lab');
        return;
      }

      if (k === 'g' && !gChord) {
        gChord = true;
        clearTimeout(gTimer);
        gTimer = setTimeout(() => { gChord = false; }, 1000);
        return;
      }

      if (gChord) {
        gChord = false;
        clearTimeout(gTimer);
        const routes = { h: '/', p: '/projects', t: '/trajectory', l: '/lab', c: '/contact' };
        if (routes[k]) {
          e.preventDefault();
          LLP.router.navigate(routes[k]);
        }
      }
    });
  }

  function initHomeActivity() {
    LLP.github.load().then((gh) => {
      const repoCounter = LLP.$('[data-live="repos"]');
      if (repoCounter && gh.publicRepos) repoCounter.textContent = gh.publicRepos;

      const list = LLP.$('#activity-list');
      if (!list || !gh.repos) return;
      const top = gh.repos.filter((r) => !r.fork).slice(0, 4);
      if (!top.length) return;
      list.innerHTML = top.map((r) => `
        <li class="activity-item">
          <a href="https://github.com/${LLP.esc(r.full)}" target="_blank" rel="noopener noreferrer" class="mono">${LLP.esc(r.name)}</a>
          <span class="activity-time mono">${LLP.esc(LLP.relTime(r.pushed))}</span>
        </li>
      `).join('');
    }).catch(() => { /* fallback stays */ });
  }

  function boot() {
    initHeaderAndShortcuts();
    LLP.startClock();
    LLP.initProjects();
    LLP.initTrajectory();
    LLP.initAlgos();
    LLP.initTerminal();
    LLP.initLab();
    LLP.initContact();
    LLP.initPalette();
    LLP.initOverclock();
    LLP.router.init();
    initHomeActivity();
    requestAnimationFrame(() => LLP.moveIndicator());
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
