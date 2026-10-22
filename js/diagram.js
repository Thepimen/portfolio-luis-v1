/* ==========================================================================
   diagram.js — dynamic SVG architecture diagrams generated from data.
   Columns of nodes, connected left→right by animated data-flow paths.
   ========================================================================== */
(function () {
  'use strict';
  const LLP = window.LLP;

  function fit(text, maxChars) {
    return text.length > maxChars ? text.slice(0, Math.max(1, maxChars - 1)) + '…' : text;
  }

  /**
   * Builds an SVG string for a diagram definition.
   * @param {{cols: Array<Array<{t:string, s?:string}>>}} def
   * @param {{width?: number, compact?: boolean}} [opts]
   */
  LLP.diagram = function (def, opts = {}) {
    const cols = def.cols;
    const W = opts.width || 640;
    const pad = 10;
    const gap = opts.compact ? 26 : 34;
    const nodeH = opts.compact ? 40 : 46;
    const rowGap = 12;
    const maxRows = Math.max(...cols.map((c) => c.length));
    const H = pad * 2 + maxRows * nodeH + (maxRows - 1) * rowGap;
    const nodeW = (W - pad * 2 - gap * (cols.length - 1)) / cols.length;
    const chars = Math.floor((nodeW - 16) / 7.1);
    const subChars = Math.floor((nodeW - 16) / 6.1);
    const animate = !LLP.reducedMotion;

    const pos = cols.map((col, ci) => {
      const total = col.length * nodeH + (col.length - 1) * rowGap;
      const y0 = (H - total) / 2;
      return col.map((n, ri) => ({ x: pad + ci * (nodeW + gap), y: y0 + ri * (nodeH + rowGap), n }));
    });

    let edges = '';
    let dots = '';
    let k = 0;
    for (let ci = 0; ci < pos.length - 1; ci++) {
      pos[ci].forEach((a) => {
        pos[ci + 1].forEach((b) => {
          const x1 = a.x + nodeW, y1 = a.y + nodeH / 2, x2 = b.x, y2 = b.y + nodeH / 2;
          const mx = (x1 + x2) / 2;
          const d = `M${x1.toFixed(1)} ${y1.toFixed(1)} C${mx.toFixed(1)} ${y1.toFixed(1)} ${mx.toFixed(1)} ${y2.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`;
          edges += `<path class="d-flow" d="${d}"/>`;
          if (animate) {
            const dur = (1.8 + (k % 3) * 0.35).toFixed(2);
            dots += `<circle class="d-dot" r="2.6"><animateMotion dur="${dur}s" begin="${(k * 0.27).toFixed(2)}s" repeatCount="indefinite" path="${d}"/></circle>`;
          }
          k++;
        });
      });
    }

    let nodes = '';
    pos.forEach((col, ci) => col.forEach(({ x, y, n }) => {
      const cls = ci === 0 ? 'd-node d-node-in' : ci === pos.length - 1 ? 'd-node d-node-out' : 'd-node';
      nodes += `<g class="${cls}">
        <rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${nodeW.toFixed(1)}" height="${nodeH}" rx="7"/>
        <text class="d-title" x="${(x + 9).toFixed(1)}" y="${(y + (n.s ? nodeH / 2 - 3 : nodeH / 2 + 4)).toFixed(1)}">${LLP.esc(fit(n.t, chars))}</text>
        ${n.s ? `<text class="d-sub" x="${(x + 9).toFixed(1)}" y="${(y + nodeH / 2 + 12).toFixed(1)}">${LLP.esc(fit(n.s, subChars))}</text>` : ''}
      </g>`;
    }));

    return `<svg class="diagram" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Diagrama de arquitectura">
      <g class="d-edges">${edges}</g><g class="d-dots">${dots}</g><g class="d-nodes">${nodes}</g></svg>`;
  };

  LLP.mountDiagrams = function (ctx = document) {
    LLP.$$('[data-diagram]', ctx).forEach((host) => {
      const p = LLP.projects.find((x) => x.id === host.dataset.diagram);
      if (p) host.innerHTML = LLP.diagram(p.diagram, { compact: host.dataset.compact === 'true' });
    });
  };
})();
