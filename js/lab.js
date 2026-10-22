/* ==========================================================================
   lab.js — NanoKV FNV-1a consistent-hash ring visualiser + Home mini-terminal
   ========================================================================== */
(function () {
  'use strict';
  const LLP = window.LLP;
  const esc = LLP.esc;

  /* 32-bit FNV-1a hash (unsigned) */
  function fnv1a32(str) {
    let h = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
    }
    return h >>> 0;
  }

  const VNODES = [
    { id: 'shard-01#v0', shard: 'shard-01', host: '10.20.0.11:7100', deg: 28, color: '#34D399' },
    { id: 'shard-02#v0', shard: 'shard-02', host: '10.20.0.12:7100', deg: 92, color: '#22D3EE' },
    { id: 'shard-03#v0', shard: 'shard-03', host: '10.20.0.13:7100', deg: 154, color: '#A78BFA' },
    { id: 'shard-01#v1', shard: 'shard-01', host: '10.20.0.11:7100', deg: 215, color: '#34D399' },
    { id: 'shard-02#v1', shard: 'shard-02', host: '10.20.0.12:7100', deg: 276, color: '#22D3EE' },
    { id: 'shard-03#v1', shard: 'shard-03', host: '10.20.0.13:7100', deg: 334, color: '#A78BFA' }
  ];

  function polar(cx, cy, r, deg) {
    const rad = ((deg - 90) * Math.PI) / 180;
    return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
  }

  function initHashRing() {
    const keyInput = LLP.$('#hash-key');
    const svg = LLP.$('#ring-svg');
    const out = LLP.$('#hash-out');
    if (!keyInput || !svg || !out) return;

    function update() {
      const key = keyInput.value || 'default:key';
      const hash = fnv1a32(key);
      const deg = (hash / 0xffffffff) * 360;
      const target = VNODES.find((v) => v.deg >= deg) || VNODES[0];

      const cx = 100, cy = 100, R = 72;
      const [kx, ky] = polar(cx, cy, R, deg);
      const [tx, ty] = polar(cx, cy, R, target.deg);

      const vnodesSvg = VNODES.map((v) => {
        const [vx, vy] = polar(cx, cy, R, v.deg);
        const isHit = v.id === target.id;
        return `<g class="ring-vnode${isHit ? ' is-hit' : ''}">
          <circle cx="${vx.toFixed(1)}" cy="${vy.toFixed(1)}" r="${isHit ? 6.5 : 4.2}" fill="${v.color}"/>
          <text x="${vx.toFixed(1)}" y="${(vy + (vy < cy ? -10 : 15)).toFixed(1)}" text-anchor="middle" class="ring-lbl">${v.id}</text>
        </g>`;
      }).join('');

      svg.innerHTML = `
        <circle cx="${cx}" cy="${cy}" r="${R}" class="ring-track"/>
        <line x1="${kx.toFixed(1)}" y1="${ky.toFixed(1)}" x2="${tx.toFixed(1)}" y2="${ty.toFixed(1)}" class="ring-route" stroke="${target.color}"/>
        ${vnodesSvg}
        <circle cx="${kx.toFixed(1)}" cy="${ky.toFixed(1)}" r="5" class="ring-key"/>
        <text x="${cx}" y="${cy - 4}" text-anchor="middle" class="ring-center-title">${esc(target.shard)}</text>
        <text x="${cx}" y="${cy + 12}" text-anchor="middle" class="ring-center-sub">0x${hash.toString(16).padStart(8, '0')}</text>
      `;

      out.innerHTML = `
        <div><dt>fnv1a_32</dt><dd>0x${hash.toString(16).padStart(8, '0')}</dd></div>
        <div><dt>angle</dt><dd>${deg.toFixed(1)}°</dd></div>
        <div><dt>vnode</dt><dd>${esc(target.id)}</dd></div>
        <div><dt>replica</dt><dd>${esc(target.host)}</dd></div>
      `;
    }

    keyInput.addEventListener('input', update);
    update();
  }

  function initMiniTerm() {
    const pre = LLP.$('#mini-term');
    if (!pre) return;
    pre.innerHTML =
      `<span class="t-accent">luis@portfolio</span>:<span class="p-path">~</span>$ whoami\n` +
      `→ Luis Lázaro · Software Eng (DAM + Security)\n` +
      `<span class="t-accent">luis@portfolio</span>:<span class="p-path">~</span>$ skills --top\n` +
      `  Low-level &amp; Algos  [███████████████████░] 88%\n` +
      `  JS / TS / Fullstack[█████████████████░░░] 85%\n` +
      `  Java / Backend     [█████████████████░░░] 84%`;
  }

  LLP.initLab = function () {
    initHashRing();
    initMiniTerm();
  };
})();
