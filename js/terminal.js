/* ==========================================================================
   terminal.js — 100% interactive live terminal with Tab autocomplete,
   Up/Down command history, Ctrl+L / clear, clickable repo links,
   ASCII progress bars, theme switching, matrix/overclock trigger & sudo hire.
   ========================================================================== */
(function () {
  'use strict';
  const LLP = window.LLP;
  const esc = LLP.esc;

  const HIST_KEY = 'llp-term-history';

  const COMMANDS = {
    help: 'Lista todos los comandos disponibles',
    whoami: 'Perfil técnico resumido en JSON y tabla ASCII',
    about: 'Alias de whoami · resumen de ingeniería y enfoque',
    skills: 'Barras de progreso en texto de mi stack técnico',
    projects: 'Lista mis repositorios con enlaces clicables',
    theme: 'Cambia el tema: theme dark | theme light | theme toggle',
    'sudo hire': 'Dispara animación de acceso y abre ~/contact',
    matrix: 'Activa el modo secreto Matrix + telemetría Overclock',
    neofetch: 'Resumen del sistema y telemetría del entorno',
    ls: 'Lista las secciones y archivos del workspace',
    cd: 'Navega a una vista: cd projects | trajectory | lab | contact | ~',
    cat: 'Muestra un archivo (ej. cat luis.config.ts | cat README.md)',
    cv: 'Descarga directa de mi CV en PDF',
    contact: 'Copia mi email al portapapeles y muestra enlaces',
    clear: 'Limpia la pantalla de la terminal (o Ctrl+L)'
  };

  const AUTOCOMPLETE_POOL = [
    'help', 'whoami', 'about', 'skills', 'projects',
    'theme dark', 'theme light', 'theme toggle',
    'sudo hire', 'matrix', 'neofetch', 'clear',
    'ls', 'cd /', 'cd projects', 'cd trajectory', 'cd lab', 'cd contact',
    'cat luis.config.ts', 'cat README.md', 'cv', 'contact'
  ];

  function bar(pct, width = 22) {
    const filled = Math.round((pct / 100) * width);
    return '█'.repeat(filled) + '░'.repeat(Math.max(0, width - filled));
  }

  function pad(str, len) {
    const s = String(str);
    return s.length >= len ? s.slice(0, len) : s + ' '.repeat(len - s.length);
  }

  LLP.initTerminal = function () {
    const termBox = LLP.$('#terminal');
    const body = LLP.$('#term-body');
    const out = LLP.$('#term-output');
    const form = LLP.$('#term-form');
    const input = LLP.$('#term-input');
    if (!termBox || !out || !form || !input) return;

    let history = [];
    try {
      history = JSON.parse(sessionStorage.getItem(HIST_KEY) || '[]');
    } catch (_) {
      history = [];
    }
    let histIdx = history.length;

    function saveHistory() {
      try { sessionStorage.setItem(HIST_KEY, JSON.stringify(history.slice(-60))); } catch (_) { /* ignore */ }
    }

    function scrollBottom() {
      body.scrollTop = body.scrollHeight;
    }

    function printPromptLine(cmdText) {
      const div = document.createElement('div');
      div.className = 'term-entry-cmd';
      div.innerHTML = `<span class="term-prompt"><span class="p-user">luis@portfolio</span><span class="p-sep">:</span><span class="p-path">~/lab</span><span class="p-sign">$</span></span> <span class="term-cmd-echo">${esc(cmdText)}</span>`;
      out.appendChild(div);
    }

    function printHTML(html, cls = 'term-block') {
      const div = document.createElement('div');
      div.className = cls;
      div.innerHTML = html;
      out.appendChild(div);
      scrollBottom();
    }

    function banner() {
      printHTML(
        `<div class="term-banner">` +
        `<span class="t-accent">LLP-OS v2026.10</span> · Interactive Dev Shell (zsh) · <span class="t-muted">Tab autocompleta · ↑/↓ historial</span>\n` +
        `Escribe <button type="button" class="term-inline-cmd" data-run-cmd="help">help</button>, ` +
        `<button type="button" class="term-inline-cmd" data-run-cmd="whoami">whoami</button>, ` +
        `<button type="button" class="term-inline-cmd" data-run-cmd="skills">skills</button>, ` +
        `<button type="button" class="term-inline-cmd" data-run-cmd="projects">projects</button> o ` +
        `<button type="button" class="term-inline-cmd" data-run-cmd="sudo hire">sudo hire</button>.` +
        `</div>`
      );
    }

    const handlers = {
      help() {
        const rows = Object.entries(COMMANDS)
          .map(([cmd, desc]) => `  <button type="button" class="term-inline-cmd" data-run-cmd="${esc(cmd)}">${esc(pad(cmd, 14))}</button> <span class="t-muted">${esc(desc)}</span>`)
          .join('\n');
        printHTML(
          `<div class="t-head">Comandos disponibles en LLP-OS:</div><pre class="term-pre">${rows}</pre>` +
          `<div class="t-muted">Tip: pulsa <kbd class="kbd">Tab</kbd> para autocompletar, <kbd class="kbd">↑</kbd><kbd class="kbd">↓</kbd> para historial o <kbd class="kbd">Ctrl+K</kbd> para Command Palette.</div>`
        );
      },

      whoami() {
        const p = LLP.profile;
        const json = {
          name: p.name,
          handle: '@' + p.handle,
          role: p.role,
          location: 'Madrid, ES · UTC+1',
          education: {
            engineering_foundation: 'Etapa universitaria en Ingeniería: programación de bajo nivel, lógica computacional, matemática discreta y diseño de algoritmos',
            current_specialization: 'CFGS Desarrollo de Aplicaciones Multiplataforma (DAM) + Ciberseguridad'
          },
          focus: p.focus,
          languages: p.languages,
          available: p.available
        };
        const ascii = [
          '┌────────────────────┬────────────────────────────────────────────────────────────────────┐',
          '│ FIELD              │ VALUE                                                              │',
          '├────────────────────┼────────────────────────────────────────────────────────────────────┤',
          `│ Developer          │ ${pad(p.name + ' (@' + p.handle + ')', 66)} │`,
          `│ Role               │ ${pad('Software Engineer · DAM · Backend & Cybersecurity', 66)} │`,
          `│ Base Ingeniería    │ ${pad('Bajo nivel (C), Lógica, Matemática Discreta y Algoritmos', 66)} │`,
          `│ Flagship Project   │ ${pad('VulnFollowUp (DevSecOps / EU DORA 2022/2554)', 66)} │`,
          `│ Location           │ ${pad('📍 Madrid, ES · UTC+1 (Presencial / Híbrido / Remoto)', 66)} │`,
          '└────────────────────┴────────────────────────────────────────────────────────────────────┘'
        ].join('\n');
        printHTML(
          `<pre class="term-pre t-ascii">${esc(ascii)}</pre>` +
          `<pre class="term-pre t-json">${esc(JSON.stringify(json, null, 2))}</pre>`
        );
      },

      about() {
        handlers.whoami();
      },

      skills() {
        const lines = LLP.skills.map((s) => {
          const name = pad(s.name, 24);
          const pct = pad(s.level + '%', 4);
          return `  <span class="t-key">${esc(name)}</span> <span class="t-bar">[${bar(s.level)}]</span> <span class="t-accent">${esc(pct)}</span> <span class="t-muted">// ${esc(s.note)}</span>`;
        }).join('\n');
        printHTML(
          `<div class="t-head">Stack &amp; Niveles de Dominio:</div>` +
          `<pre class="term-pre">${lines}</pre>`
        );
      },

      projects() {
        const lines = LLP.projects.map((p, i) => {
          const idx = String(i + 1).padStart(2, '0');
          const primaryLang = Object.keys(p.langs)[0] || 'Config';
          const url = 'https://github.com/' + p.repo;
          return `  <span class="t-muted">${idx}.</span> <a href="${url}" target="_blank" rel="noopener noreferrer" class="term-link">${esc(pad(p.name, 22))}</a> ` +
                 `<span class="t-chip">[${esc(primaryLang)}]</span> <span class="t-muted">${esc(p.tagline)}</span> ` +
                 `<button type="button" class="term-inline-cmd" data-arch="${esc(p.id)}">[arch]</button>`;
        }).join('\n');
        printHTML(
          `<div class="t-head">Repositorios verificados en GitHub (<a href="https://github.com/Thepimen" target="_blank" rel="noopener noreferrer" class="term-link">@Thepimen</a>):</div>` +
          `<pre class="term-pre">${lines}</pre>`
        );
      },

      theme(arg) {
        const mode = (arg || '').trim().toLowerCase();
        if (mode === 'dark' || mode === 'light') {
          LLP.theme.set(mode);
          printHTML(`<span class="t-accent">✓</span> Tema actualizado a <b>${esc(mode)}</b> (guardado en localStorage).`);
        } else if (mode === 'toggle') {
          LLP.theme.toggle();
          printHTML(`<span class="t-accent">✓</span> Tema alternado a <b>${esc(LLP.theme.get())}</b>.`);
        } else {
          printHTML(
            `Tema actual: <b>${esc(LLP.theme.get())}</b>. Uso: ` +
            `<button type="button" class="term-inline-cmd" data-run-cmd="theme dark">theme dark</button> | ` +
            `<button type="button" class="term-inline-cmd" data-run-cmd="theme light">theme light</button> | ` +
            `<button type="button" class="term-inline-cmd" data-run-cmd="theme toggle">theme toggle</button>`
          );
        }
      },

      hire() {
        printHTML(
          `<pre class="term-pre t-accent">[sudo] password for visitor: ********\n` +
          `✓ verifying engineering credentials ........ OK\n` +
          `✓ checking availability in Madrid / Remote .. AVAILABLE\n` +
          `✓ granting recruiter privileges ............. ACCESS GRANTED\n` +
          `→ Redirigiendo a ~/contact ...</pre>`
        );
        if (typeof LLP.triggerHireFlash === 'function') {
          LLP.triggerHireFlash();
        } else {
          LLP.router.navigate('/contact');
        }
      },

      matrix() {
        if (typeof LLP.toggleOverclock === 'function') {
          const active = LLP.toggleOverclock();
          printHTML(
            active
              ? `<span class="t-accent">⚡ OVERCLOCK / MATRIX MODE ACTIVADO</span> · Lluvia de código a 60fps + HUD de telemetría en vivo (pulsa <kbd class="kbd">Esc</kbd> para salir).`
              : `<span class="t-muted">Modo Matrix / Overclock desactivado.</span>`
          );
        }
      },

      neofetch() {
        const mem = performance && performance.memory
          ? `${Math.round(performance.memory.usedJSHeapSize / 1048576)} MB / ${Math.round(performance.memory.jsHeapSizeLimit / 1048576)} MB`
          : 'N/A (browser protected)';
        const art = [
          '      /\\        luis@portfolio',
          '     /  \\       --------------',
          '    / /\\ \\      OS: LLP-DevOS 2026.10 (Web/POSIX)',
          '   / /  \\ \\     Host: Madrid, ES · UTC+1',
          '  / /    \\ \\    Kernel: eBPF CO-RE + Go + JVM 17',
          ' / /      \\ \\   Base: Low-Level C · Logic · Discrete Math · Algorithms',
          '/_/        \\_\\  Stack: Java · TS/JS · C · Go · Python · SQL · Android',
          `                Theme: ${LLP.theme.get()} · Viewport: ${window.innerWidth}x${window.innerHeight}`,
          `                JS Heap: ${mem}`
        ].join('\n');
        printHTML(`<pre class="term-pre t-accent">${esc(art)}</pre>`);
      },

      ls() {
        printHTML(
          `<pre class="term-pre">` +
          `<span class="t-accent">drwxr-xr-x</span>  <button type="button" class="term-inline-cmd" data-run-cmd="cd /">home/</button>        ` +
          `<span class="t-accent">drwxr-xr-x</span>  <button type="button" class="term-inline-cmd" data-run-cmd="cd projects">projects/</button>    ` +
          `<span class="t-accent">drwxr-xr-x</span>  <button type="button" class="term-inline-cmd" data-run-cmd="cd trajectory">trajectory/</button>\n` +
          `<span class="t-accent">drwxr-xr-x</span>  <button type="button" class="term-inline-cmd" data-run-cmd="cd lab">lab/</button>         ` +
          `<span class="t-accent">drwxr-xr-x</span>  <button type="button" class="term-inline-cmd" data-run-cmd="cd contact">contact/</button>     ` +
          `<span class="t-muted">-rw-r--r--</span>  <button type="button" class="term-inline-cmd" data-run-cmd="cat luis.config.ts">luis.config.ts</button>` +
          `</pre>`
        );
      },

      cd(arg) {
        const raw = (arg || '~').trim().toLowerCase().replace(/^\/+|\/+$/g, '');
        const map = { '': '/', '~': '/', home: '/', projects: '/projects', trajectory: '/trajectory', lab: '/lab', terminal: '/lab', contact: '/contact' };
        const dest = map[raw];
        if (!dest) {
          printHTML(`<span class="t-err">cd: no existe el directorio '${esc(arg)}'</span>`);
          return;
        }
        printHTML(`<span class="t-muted">→ navegando a ${esc(dest)} …</span>`);
        LLP.router.navigate(dest);
      },

      cat(arg) {
        const f = (arg || '').trim().toLowerCase();
        if (!f || f.includes('config')) {
          printHTML(
            `<pre class="term-pre">export const luis = {\n` +
            `  name: "${esc(LLP.profile.name)}",\n` +
            `  location: "📍 Madrid, ES · UTC+1",\n` +
            `  engineeringBase: ["Low-Level C", "Computational Logic", "Discrete Math", "Algorithm Design"],\n` +
            `  specialization: ["Multiplatform Dev (DAM)", "Backend Architecture", "Cybersecurity"],\n` +
            `  featuredRepo: "https://github.com/Thepimen/VulnFollowUp"\n` +
            `};</pre>`
          );
        } else {
          printHTML(`<span class="t-muted">Archivo '${esc(arg)}': prueba <code class="inline-code">cat luis.config.ts</code> o <code class="inline-code">whoami</code>.</span>`);
        }
      },

      cv() {
        printHTML(`<span class="t-accent">✓</span> Descargando <a class="term-link" href="assets/cv.pdf" download="CV_Luis_Lazaro_Pimentel.pdf">CV_Luis_Lazaro_Pimentel.pdf</a>…`);
        const a = document.createElement('a');
        a.href = 'assets/cv.pdf';
        a.download = 'CV_Luis_Lazaro_Pimentel.pdf';
        document.body.appendChild(a);
        a.click();
        a.remove();
      },

      contact() {
        LLP.copyEmail();
        printHTML(
          `<span class="t-accent">✓</span> Email copiado al portapapeles: <a class="term-link" href="mailto:${esc(LLP.profile.email)}">${esc(LLP.profile.email)}</a> · ` +
          `<a class="term-link" href="${esc(LLP.profile.github)}" target="_blank" rel="noopener noreferrer">GitHub</a> · ` +
          `<a class="term-link" href="${esc(LLP.profile.linkedin)}" target="_blank" rel="noopener noreferrer">LinkedIn</a>`
        );
      },

      clear() {
        out.innerHTML = '';
      }
    };

    function exec(rawInput) {
      const raw = String(rawInput || '').trim();
      printPromptLine(raw);
      if (!raw) { scrollBottom(); return; }

      history.push(raw);
      saveHistory();
      histIdx = history.length;

      const lower = raw.toLowerCase().replace(/\s+/g, ' ');
      if (lower === 'sudo hire' || lower === 'hire' || lower.startsWith('sudo hire ')) {
        handlers.hire();
        return;
      }
      if (lower === 'konami' || lower === 'overclock') {
        handlers.matrix();
        return;
      }

      const [cmd, ...rest] = raw.split(/\s+/);
      const key = cmd.toLowerCase();
      const arg = rest.join(' ');

      if (Object.prototype.hasOwnProperty.call(handlers, key)) {
        handlers[key](arg);
      } else {
        printHTML(
          `<span class="t-err">zsh: command not found: ${esc(cmd)}</span> · escribe <button type="button" class="term-inline-cmd" data-run-cmd="help">help</button> para ver los comandos.`
        );
      }
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = input.value;
      input.value = '';
      exec(val);
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        const cur = input.value.trimStart().toLowerCase();
        if (!cur) return;
        const matches = AUTOCOMPLETE_POOL.filter((c) => c.startsWith(cur));
        if (matches.length === 1) {
          input.value = matches[0];
        } else if (matches.length > 1) {
          printPromptLine(input.value);
          printHTML(`<span class="t-muted">${matches.map(esc).join('   ')}</span>`);
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (history.length && histIdx > 0) {
          histIdx--;
          input.value = history[histIdx];
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (histIdx < history.length - 1) {
          histIdx++;
          input.value = history[histIdx];
        } else {
          histIdx = history.length;
          input.value = '';
        }
      } else if (e.key.toLowerCase() === 'l' && e.ctrlKey) {
        e.preventDefault();
        handlers.clear();
      }
    });

    // Clicking anywhere inside the terminal body focuses the input (unless selecting text or clicking a link/button)
    termBox.addEventListener('click', (e) => {
      const inlineBtn = e.target.closest('[data-run-cmd]');
      if (inlineBtn) {
        exec(inlineBtn.dataset.runCmd);
        input.focus();
        return;
      }
      if (e.target.closest('a, button')) return;
      if (window.getSelection && String(window.getSelection()).length > 0) return;
      input.focus();
    });

    // Quick-run buttons in the sidebar
    const quick = LLP.$('#quick-cmds');
    if (quick) {
      quick.addEventListener('click', (e) => {
        const b = e.target.closest('[data-cmd]');
        if (!b) return;
        exec(b.dataset.cmd);
        input.focus();
      });
    }

    banner();

    LLP.terminal = {
      run(cmd) {
        if (LLP.router.current !== '/lab') LLP.router.navigate('/lab');
        exec(cmd);
        input.focus();
      },
      focus() {
        input.focus();
      }
    };

    LLP.on('route', (path) => {
      if (path === '/lab') {
        requestAnimationFrame(() => input.focus({ preventScroll: true }));
      }
    });
  };
})();
