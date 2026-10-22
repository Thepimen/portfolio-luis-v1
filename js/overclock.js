/* ==========================================================================
   overclock.js — Easter Egg #2: Konami Code (↑ ↑ ↓ ↓ ← → ← → B A) & `matrix`
   command. Launches a 60fps Canvas code-rain overlay + Overclock HUD with
   live FPS, JS heap memory, DOM node count and cursor coordinates.
   Also provides the `sudo hire` access-granted animation.
   ========================================================================== */
(function () {
  'use strict';
  const LLP = window.LLP;

  const KONAMI = [
    'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
    'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
    'b', 'a'
  ];

  const GLYPHS = '01アイウエオカキクケコサシスセソタチツテトナニヌネノ{}[]()<>/\\*=+-:;eBPF_CORE_WAL_DORA';

  LLP.initOverclock = function () {
    const canvas = LLP.$('#matrix-canvas');
    const hud = LLP.$('#hud');
    const hudGrid = LLP.$('#hud-grid');
    const hudClose = LLP.$('#hud-close');
    const flash = LLP.$('#access-flash');
    if (!canvas || !hud || !hudGrid) return;

    const ctx = canvas.getContext('2d');
    let active = false;
    let rafId = 0;
    let drops = [];
    let fontSize = 15;
    let frameCount = 0;
    let fps = 60;
    let lastFpsTime = performance.now();

    function resize() {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const cols = Math.ceil(window.innerWidth / fontSize);
      drops = Array.from({ length: cols }, () => Math.random() * -40);
    }

    function renderTelemetry() {
      const mem = performance && performance.memory
        ? `${(performance.memory.usedJSHeapSize / 1048576).toFixed(1)} MB`
        : 'protected';
      const domNodes = document.getElementsByTagName('*').length;
      hudGrid.innerHTML =
        `<div><dt>FPS</dt><dd>${fps}</dd></div>` +
        `<div><dt>JS HEAP</dt><dd>${mem}</dd></div>` +
        `<div><dt>CURSOR</dt><dd>${LLP.pointer.x}, ${LLP.pointer.y}</dd></div>` +
        `<div><dt>DOM NODES</dt><dd>${domNodes}</dd></div>` +
        `<div><dt>ROUTE</dt><dd>~${LLP.router.current || '/'}</dd></div>` +
        `<div><dt>MODE</dt><dd>OVERCLOCK</dd></div>`;
    }

    function tick(now) {
      if (!active) return;
      frameCount++;
      if (now - lastFpsTime >= 450) {
        fps = Math.min(144, Math.round((frameCount * 1000) / (now - lastFpsTime)));
        frameCount = 0;
        lastFpsTime = now;
        renderTelemetry();
      }

      ctx.fillStyle = 'rgba(9, 10, 15, 0.12)';
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

      ctx.font = `500 ${fontSize}px "JetBrains Mono", monospace`;
      for (let i = 0; i < drops.length; i++) {
        const ch = GLYPHS[(Math.random() * GLYPHS.length) | 0];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        ctx.fillStyle = Math.random() > 0.88 ? '#A7F3D0' : '#10B981';
        ctx.fillText(ch, x, y);

        if (y > window.innerHeight && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i] += 0.65;
      }

      rafId = requestAnimationFrame(tick);
    }

    function start() {
      if (active) return true;
      active = true;
      document.documentElement.classList.add('is-overclock');
      canvas.classList.add('is-on');
      hud.hidden = false;
      resize();
      lastFpsTime = performance.now();
      frameCount = 0;
      renderTelemetry();
      rafId = requestAnimationFrame(tick);
      LLP.toast('⚡ OVERCLOCK / MATRIX ACTIVADO (Esc para salir)');
      return true;
    }

    function stop() {
      if (!active) return false;
      active = false;
      cancelAnimationFrame(rafId);
      document.documentElement.classList.remove('is-overclock');
      canvas.classList.remove('is-on');
      hud.hidden = true;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      LLP.toast('Overclock desactivado');
      return false;
    }

    LLP.toggleOverclock = function (force) {
      const next = typeof force === 'boolean' ? force : !active;
      return next ? start() : stop();
    };

    window.addEventListener('resize', () => {
      if (active) resize();
    });

    if (hudClose) hudClose.addEventListener('click', stop);

    // Konami Code detector
    let pos = 0;
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && active) {
        stop();
        return;
      }
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      const expected = KONAMI[pos];
      if (key === expected) {
        pos++;
        if (pos === KONAMI.length) {
          pos = 0;
          LLP.toggleOverclock();
        }
      } else {
        pos = key === KONAMI[0] ? 1 : 0;
      }
    });

    // `sudo hire` animation
    LLP.triggerHireFlash = function () {
      if (!flash) {
        LLP.router.navigate('/contact');
        return;
      }
      flash.hidden = false;
      flash.classList.add('is-on');
      setTimeout(() => {
        LLP.router.navigate('/contact');
        const nameInput = LLP.$('#f-name');
        if (nameInput) nameInput.focus();
      }, 650);
      setTimeout(() => {
        flash.classList.remove('is-on');
        flash.hidden = true;
      }, 1350);
    };
  };
})();
