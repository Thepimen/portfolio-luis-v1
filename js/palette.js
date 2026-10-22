/* ==========================================================================
   palette.js — Command Palette (Ctrl+K / Cmd+K) inspired by Raycast / Linear.
   Supports fuzzy filtering, keyboard navigation (↑/↓/Enter/Esc), view routing,
   theme toggle, clipboard copy, CV download, and repo architecture launch.
   ========================================================================== */
(function () {
  'use strict';
  const LLP = window.LLP;
  const esc = LLP.esc;

  function buildActions() {
    const base = [
      { id: 'nav-home', group: 'Navegación', label: 'Ir a Inicio (Overview & Bento)', kbd: 'G H', run: () => LLP.router.navigate('/') },
      { id: 'nav-projects', group: 'Navegación', label: 'Ir a Proyectos & GitHub', kbd: 'G P', run: () => LLP.router.navigate('/projects') },
      { id: 'nav-trajectory', group: 'Navegación', label: 'Ir a Trayectoria & Stack', kbd: 'G T', run: () => LLP.router.navigate('/trajectory') },
      { id: 'nav-lab', group: 'Navegación', label: 'Ir a Interactive Dev Lab (Terminal)', kbd: 'G L', run: () => LLP.router.navigate('/lab') },
      { id: 'nav-contact', group: 'Navegación', label: 'Ir a Contacto', kbd: 'G C', run: () => LLP.router.navigate('/contact') },

      { id: 'act-theme-toggle', group: 'Tema & Apariencia', label: 'Alternar tema (Dark / Light Mode)', kbd: 'T', run: () => LLP.theme.toggle() },
      { id: 'act-theme-dark', group: 'Tema & Apariencia', label: 'Activar Modo Oscuro (IDE Dark)', kbd: 'dark', run: () => LLP.theme.set('dark') },
      { id: 'act-theme-light', group: 'Tema & Apariencia', label: 'Activar Modo Claro (Engineering Paper)', kbd: 'light', run: () => LLP.theme.set('light') },

      { id: 'act-copy-email', group: 'Acciones rápidas', label: `Copiar email (${LLP.profile.email})`, kbd: 'Copy', run: () => LLP.copyEmail() },
      { id: 'act-hire', group: 'Acciones rápidas', label: 'Ejecutar sudo hire (Contratar / Contacto)', kbd: 'sudo', run: () => LLP.triggerHireFlash ? LLP.triggerHireFlash() : LLP.router.navigate('/contact') },
      { id: 'act-matrix', group: 'Easter Eggs', label: 'Activar Modo Matrix + Telemetría Overclock (60fps)', kbd: 'matrix', run: () => LLP.toggleOverclock && LLP.toggleOverclock() },
      {
        id: 'act-cv-es', group: 'Acciones rápidas', label: 'Descargar CV en Español (PDF · ATS 1-col)', kbd: 'CV ES',
        run: () => {
          const a = document.createElement('a');
          a.href = LLP.profile.cv_es || 'assets/cv_es.pdf';
          a.download = 'CV_Luis_Lazaro_Pimentel_ES.pdf';
          document.body.appendChild(a);
          a.click();
          a.remove();
        }
      },
      {
        id: 'act-cv-en', group: 'Acciones rápidas', label: 'Download CV in English (PDF · ATS 1-col)', kbd: 'CV EN',
        run: () => {
          const a = document.createElement('a');
          a.href = LLP.profile.cv_en || 'assets/cv_en.pdf';
          a.download = 'CV_Luis_Lazaro_Pimentel_EN.pdf';
          document.body.appendChild(a);
          a.click();
          a.remove();
        }
      },
      {
        id: 'act-github', group: 'Enlaces externos', label: 'Abrir perfil de GitHub (@Thepimen)', kbd: '↗',
        run: () => window.open(LLP.profile.github, '_blank', 'noopener')
      },
      {
        id: 'act-linkedin', group: 'Enlaces externos', label: 'Abrir LinkedIn', kbd: '↗',
        run: () => window.open(LLP.profile.linkedin, '_blank', 'noopener')
      }
    ];

    const repoActions = LLP.projects.map((p) => ({
      id: 'repo-' + p.id,
      group: 'Proyectos & Arquitectura',
      label: `${p.name} — ${p.tagline}`,
      kbd: Object.keys(p.langs)[0] || 'Repo',
      run: () => {
        LLP.router.navigate('/projects');
        requestAnimationFrame(() => LLP.openArch && LLP.openArch(p.id));
      }
    }));

    return base.concat(repoActions);
  }

  LLP.initPalette = function () {
    const backdrop = LLP.$('#palette');
    const input = LLP.$('#palette-input');
    const list = LLP.$('#palette-list');
    const trigger = LLP.$('#cmdk-trigger');
    if (!backdrop || !input || !list) return;

    const actions = buildActions();
    let filtered = actions.slice();
    let activeIdx = 0;

    function renderList() {
      if (!filtered.length) {
        list.innerHTML = `<li class="palette-empty mono">Sin resultados para "${esc(input.value)}"</li>`;
        return;
      }
      let lastGroup = '';
      list.innerHTML = filtered.map((it, idx) => {
        const groupHeader = it.group !== lastGroup
          ? `<li class="palette-group mono" role="presentation">${esc(it.group)}</li>`
          : '';
        lastGroup = it.group;
        return `${groupHeader}<li class="palette-item${idx === activeIdx ? ' is-active' : ''}" role="option" id="pal-opt-${idx}" aria-selected="${idx === activeIdx}" data-idx="${idx}">
          <span class="palette-label">${esc(it.label)}</span>
          <kbd class="kbd mono">${esc(it.kbd)}</kbd>
        </li>`;
      }).join('');
      const activeEl = LLP.$(`#pal-opt-${activeIdx}`, list);
      if (activeEl) activeEl.scrollIntoView({ block: 'nearest' });
    }

    function filter(q) {
      const needle = (q || '').trim().toLowerCase();
      filtered = !needle
        ? actions.slice()
        : actions.filter((a) => (a.label + ' ' + a.group + ' ' + a.kbd).toLowerCase().includes(needle));
      activeIdx = 0;
      renderList();
    }

    function open() {
      backdrop.hidden = false;
      input.value = '';
      filter('');
      requestAnimationFrame(() => input.focus());
    }

    function close() {
      if (backdrop.hidden) return;
      backdrop.hidden = true;
    }

    function execute(idx) {
      const item = filtered[idx];
      if (!item) return;
      close();
      item.run();
    }

    if (trigger) trigger.addEventListener('click', open);
    LLP.$$('[data-open-palette]').forEach((b) => b.addEventListener('click', open));

    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) close();
    });

    list.addEventListener('mousemove', (e) => {
      const li = e.target.closest('.palette-item');
      if (!li) return;
      const idx = Number(li.dataset.idx);
      if (!Number.isNaN(idx) && idx !== activeIdx) {
        activeIdx = idx;
        LLP.$$('.palette-item', list).forEach((el, i) => {
          el.classList.toggle('is-active', i === activeIdx);
          el.setAttribute('aria-selected', String(i === activeIdx));
        });
      }
    });

    list.addEventListener('click', (e) => {
      const li = e.target.closest('.palette-item');
      if (!li) return;
      execute(Number(li.dataset.idx));
    });

    input.addEventListener('input', () => filter(input.value));

    input.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (filtered.length) { activeIdx = (activeIdx + 1) % filtered.length; renderList(); }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (filtered.length) { activeIdx = (activeIdx - 1 + filtered.length) % filtered.length; renderList(); }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        execute(activeIdx);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        close();
      }
    });

    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (backdrop.hidden) open(); else close();
      } else if (e.key === 'Escape' && !backdrop.hidden) {
        close();
      }
    });

    LLP.palette = { open, close };
  };
})();
