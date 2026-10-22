/* ==========================================================================
   algo.js — Algorithm Inspector: step-by-step visual execution on <canvas>.
   Sorting (QuickSort · MergeSort · Insertion) and grid pathfinding
   (A* · Dijkstra · BFS). Algorithms are written as generators so every
   comparison / write / visit can be paused, stepped and counted.
   ========================================================================== */
(function () {
  'use strict';
  const LLP = window.LLP;

  /* ---------------- sorting generators (mutate `a`, yield highlights) ---------------- */
  const SORTS = {
    quick: {
      name: 'QuickSort (Lomuto)', cx: 'O(n log n) medio · O(n²) peor',
      *run(a, st) {
        function* qs(lo, hi) {
          if (lo > hi) return;
          if (lo === hi) { st.sorted.add(lo); return; }
          const pv = a[hi];
          let i = lo;
          for (let j = lo; j < hi; j++) {
            st.cmp++;
            yield { cmp: [j, hi], pivot: hi, range: [lo, hi] };
            if (a[j] < pv) {
              [a[i], a[j]] = [a[j], a[i]]; st.wr += 2;
              yield { swap: [i, j], pivot: hi, range: [lo, hi] };
              i++;
            }
          }
          [a[i], a[hi]] = [a[hi], a[i]]; st.wr += 2;
          st.sorted.add(i);
          yield { swap: [i, hi], range: [lo, hi] };
          yield* qs(lo, i - 1);
          yield* qs(i + 1, hi);
        }
        yield* qs(0, a.length - 1);
      }
    },
    merge: {
      name: 'MergeSort (top-down)', cx: 'O(n log n) · O(n) memoria',
      *run(a, st) {
        function* ms(lo, hi) {
          if (hi <= lo) return;
          const mid = (lo + hi) >> 1;
          yield* ms(lo, mid);
          yield* ms(mid + 1, hi);
          const L = a.slice(lo, mid + 1), R = a.slice(mid + 1, hi + 1);
          let i = 0, j = 0, k = lo;
          while (i < L.length && j < R.length) {
            st.cmp++;
            yield { cmp: [lo + i, mid + 1 + j], range: [lo, hi] };
            a[k] = L[i] <= R[j] ? L[i++] : R[j++]; st.wr++;
            yield { set: [k], range: [lo, hi] }; k++;
          }
          while (i < L.length) { a[k] = L[i++]; st.wr++; yield { set: [k], range: [lo, hi] }; k++; }
          while (j < R.length) { a[k] = R[j++]; st.wr++; yield { set: [k], range: [lo, hi] }; k++; }
        }
        yield* ms(0, a.length - 1);
      }
    },
    insertion: {
      name: 'Insertion Sort', cx: 'O(n²) · estable · in-place',
      *run(a, st) {
        for (let i = 1; i < a.length; i++) {
          let j = i;
          while (j > 0) {
            st.cmp++;
            yield { cmp: [j - 1, j], range: [0, i] };
            if (a[j - 1] > a[j]) {
              [a[j - 1], a[j]] = [a[j], a[j - 1]]; st.wr += 2;
              yield { swap: [j - 1, j], range: [0, i] };
              j--;
            } else break;
          }
        }
      }
    }
  };

  /* ---------------- min-heap for Dijkstra / A* ---------------- */
  class MinHeap {
    constructor() { this.h = []; }
    get size() { return this.h.length; }
    push(item, pri, tie = 0) {
      const h = this.h; h.push({ item, pri, tie });
      let i = h.length - 1;
      while (i > 0) {
        const p = (i - 1) >> 1;
        if (this.lt(h[i], h[p])) { [h[i], h[p]] = [h[p], h[i]]; i = p; } else break;
      }
    }
    pop() {
      const h = this.h; const top = h[0]; const last = h.pop();
      if (h.length) {
        h[0] = last; let i = 0;
        for (;;) {
          const l = 2 * i + 1, r = l + 1; let m = i;
          if (l < h.length && this.lt(h[l], h[m])) m = l;
          if (r < h.length && this.lt(h[r], h[m])) m = r;
          if (m === i) break;
          [h[i], h[m]] = [h[m], h[i]]; i = m;
        }
      }
      return top.item;
    }
    lt(a, b) { return a.pri < b.pri || (a.pri === b.pri && a.tie < b.tie); }
  }

  /* ---------------- pathfinding generators ---------------- */
  function neighbours(g, idx) {
    const c = idx % g.cols, r = (idx / g.cols) | 0, out = [];
    if (r > 0) out.push(idx - g.cols);
    if (c < g.cols - 1) out.push(idx + 1);
    if (r < g.rows - 1) out.push(idx + g.cols);
    if (c > 0) out.push(idx - 1);
    return out.filter((n) => !g.walls[n]);
  }
  function tracePath(prev, end) {
    const path = []; let cur = end;
    while (cur !== -1 && cur !== undefined) { path.push(cur); cur = prev[cur]; }
    return path.reverse();
  }
  const PATHS = {
    astar: {
      name: 'A* (heurística Manhattan)', cx: 'O(E log V) · óptimo con h admisible',
      *run(g, st) {
        const N = g.cols * g.rows, gs = new Float64Array(N).fill(Infinity), prev = new Int32Array(N).fill(-1), closed = new Uint8Array(N);
        const h = (i) => Math.abs((i % g.cols) - (g.end % g.cols)) + Math.abs(((i / g.cols) | 0) - ((g.end / g.cols) | 0));
        const open = new MinHeap(); gs[g.start] = 0; open.push(g.start, h(g.start), h(g.start));
        while (open.size) {
          const cur = open.pop();
          if (closed[cur]) continue;
          closed[cur] = 1; st.visited++;
          yield { visit: cur };
          if (cur === g.end) { yield { path: tracePath(prev, cur) }; return; }
          for (const n of neighbours(g, cur)) {
            const ng = gs[cur] + 1;
            if (ng < gs[n]) { gs[n] = ng; prev[n] = cur; open.push(n, ng + h(n), h(n)); yield { frontier: n }; }
          }
        }
        yield { path: [] };
      }
    },
    dijkstra: {
      name: 'Dijkstra (min-heap)', cx: 'O((V+E) log V) · pesos ≥ 0',
      *run(g, st) {
        const N = g.cols * g.rows, dist = new Float64Array(N).fill(Infinity), prev = new Int32Array(N).fill(-1), done = new Uint8Array(N);
        const pq = new MinHeap(); dist[g.start] = 0; pq.push(g.start, 0);
        let seq = 0;
        while (pq.size) {
          const cur = pq.pop();
          if (done[cur]) continue;
          done[cur] = 1; st.visited++;
          yield { visit: cur };
          if (cur === g.end) { yield { path: tracePath(prev, cur) }; return; }
          for (const n of neighbours(g, cur)) {
            const nd = dist[cur] + 1;
            if (nd < dist[n]) { dist[n] = nd; prev[n] = cur; pq.push(n, nd, seq++); yield { frontier: n }; }
          }
        }
        yield { path: [] };
      }
    },
    bfs: {
      name: 'BFS (cola FIFO)', cx: 'O(V+E) · óptimo sin pesos',
      *run(g, st) {
        const N = g.cols * g.rows, prev = new Int32Array(N).fill(-1), seen = new Uint8Array(N);
        const q = [g.start]; let head = 0; seen[g.start] = 1;
        while (head < q.length) {
          const cur = q[head++]; st.visited++;
          yield { visit: cur };
          if (cur === g.end) { yield { path: tracePath(prev, cur) }; return; }
          for (const n of neighbours(g, cur)) {
            if (!seen[n]) { seen[n] = 1; prev[n] = cur; q.push(n); yield { frontier: n }; }
          }
        }
        yield { path: [] };
      }
    }
  };

  const SPEEDS = [0.2, 0.4, 1, 2, 3, 5, 8, 14, 24, 45];

  class AlgoInspector {
    constructor(host) {
      this.host = host;
      this.mode = host.dataset.algo === 'path' ? 'path' : 'sort';
      this.running = false;
      this.acc = 0;
      this.build();
      this.setMode(this.mode);
      this.ro = new ResizeObserver(() => this.resize());
      this.ro.observe(this.stage);
      LLP.on('theme', () => { this.readColors(); this.draw(); });
      LLP.on('route', () => { if (this.running && !this.visible()) this.pause(); });
    }

    build() {
      this.host.innerHTML = `
        <div class="algo-top">
          <div class="seg" role="tablist" aria-label="Modo del inspector">
            <button type="button" role="tab" class="seg-btn" data-mode="sort">Sorting</button>
            <button type="button" role="tab" class="seg-btn" data-mode="path">Pathfinding</button>
          </div>
          <label class="algo-select"><span class="sr-only">Algoritmo</span><select class="mono" data-ref="algo"></select></label>
          <div class="algo-ctrls">
            <button type="button" class="btn btn-sm btn-primary" data-act="run">▶ Run</button>
            <button type="button" class="btn btn-sm btn-ghost" data-act="step">Step</button>
            <button type="button" class="btn btn-sm btn-ghost" data-act="reset">Shuffle</button>
            <button type="button" class="btn btn-sm btn-ghost" data-act="clear">Clear</button>
          </div>
          <label class="speed mono">speed <input type="range" min="1" max="10" value="6" data-ref="speed" aria-label="Velocidad"></label>
        </div>
        <div class="algo-stage" data-ref="stage"><canvas data-ref="canvas"></canvas></div>
        <div class="algo-foot">
          <dl class="algo-stats mono" data-ref="stats"></dl>
          <div class="algo-legend mono" data-ref="legend"></div>
        </div>`;
      const ref = (n) => this.host.querySelector(`[data-ref="${n}"]`);
      this.sel = ref('algo'); this.speed = ref('speed'); this.stage = ref('stage');
      this.canvas = ref('canvas'); this.ctx = this.canvas.getContext('2d');
      this.statsEl = ref('stats'); this.legendEl = ref('legend');
      this.btnRun = this.host.querySelector('[data-act="run"]');
      this.btnReset = this.host.querySelector('[data-act="reset"]');
      this.btnClear = this.host.querySelector('[data-act="clear"]');

      this.host.querySelectorAll('.seg-btn').forEach((b) => b.addEventListener('click', () => this.setMode(b.dataset.mode)));
      this.sel.addEventListener('change', () => this.prepare());
      this.btnRun.addEventListener('click', () => (this.running ? this.pause() : this.play()));
      this.host.querySelector('[data-act="step"]').addEventListener('click', () => { this.pause(); this.step(); this.draw(); });
      this.btnReset.addEventListener('click', () => { this.pause(); this.mode === 'sort' ? this.shuffle() : this.maze(); });
      this.btnClear.addEventListener('click', () => { this.pause(); this.clearWalls(); });

      // grid editing (pathfinding)
      this.canvas.addEventListener('pointerdown', (e) => this.onDown(e));
      this.canvas.addEventListener('pointermove', (e) => this.onMove(e));
      window.addEventListener('pointerup', () => { this.drag = null; });
    }

    visible() { return this.host.offsetParent !== null; }

    setMode(mode) {
      this.pause();
      this.mode = mode;
      this.host.querySelectorAll('.seg-btn').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.mode === mode)));
      const list = mode === 'sort' ? SORTS : PATHS;
      this.sel.innerHTML = Object.entries(list).map(([k, v]) => `<option value="${k}">${v.name}</option>`).join('');
      this.btnReset.textContent = mode === 'sort' ? 'Shuffle' : 'Maze';
      this.btnClear.hidden = mode === 'sort';
      this.canvas.classList.toggle('is-grid', mode === 'path');
      this.legendEl.innerHTML = mode === 'sort'
        ? '<span><i class="lg-cmp"></i>compare</span><span><i class="lg-swap"></i>write</span><span><i class="lg-pivot"></i>pivot</span><span><i class="lg-done"></i>sorted</span>'
        : '<span><i class="lg-start"></i>start</span><span><i class="lg-end"></i>goal</span><span><i class="lg-visit"></i>visited</span><span><i class="lg-front"></i>frontier</span><span><i class="lg-path"></i>path</span>';
      this.readColors();
      // When mounted inside a hidden view the stage has no width yet: initialise with
      // defaults now and re-initialise with the real size on the first visible resize.
      this.pendingInit = this.stage.clientWidth === 0;
      if (mode === 'sort') this.shuffle(); else this.initGrid();
      this.resize();
    }

    readColors() {
      this.c = {
        bar: LLP.cssVar('--algo-bar'), cmp: LLP.cssVar('--accent-2'), swap: LLP.cssVar('--warn'),
        pivot: LLP.cssVar('--danger'), done: LLP.cssVar('--accent'), range: LLP.cssVar('--algo-range'),
        cell: LLP.cssVar('--bg-elev-2'), wall: LLP.cssVar('--algo-wall'), grid: LLP.cssVar('--border'),
        visit: LLP.cssVar('--algo-visit'), front: LLP.cssVar('--algo-front')
      };
    }

    /* ---------- sorting state ---------- */
    shuffle() {
      const n = this.stage.clientWidth < 520 ? 28 : 56;
      this.arr = Array.from({ length: n }, () => 6 + Math.floor(Math.random() * 94));
      this.prepare();
    }

    /* ---------- grid state ---------- */
    initGrid() {
      const narrow = this.stage.clientWidth < 560;
      this.g = { cols: narrow ? 21 : 41, rows: narrow ? 15 : 19 };
      this.g.walls = new Uint8Array(this.g.cols * this.g.rows);
      const mid = (this.g.rows / 2) | 0;
      this.g.start = mid * this.g.cols + 2;
      this.g.end = mid * this.g.cols + (this.g.cols - 3);
      this.maze();
    }
    maze() {
      const g = this.g;
      g.walls.fill(0);
      for (let i = 0; i < g.walls.length; i++) if (Math.random() < 0.27) g.walls[i] = 1;
      g.walls[g.start] = 0; g.walls[g.end] = 0;
      this.prepare();
    }
    clearWalls() { this.g.walls.fill(0); this.prepare(); }

    prepare() {
      this.st = { cmp: 0, wr: 0, steps: 0, visited: 0, sorted: new Set(), t0: 0, ms: 0 };
      this.done = false;
      this.hl = null;
      if (this.mode === 'sort') {
        this.work = this.arr.slice();
        this.gen = SORTS[this.sel.value].run(this.work, this.st);
      } else {
        const N = this.g.cols * this.g.rows;
        this.visit = new Uint8Array(N); this.front = new Uint8Array(N); this.path = null;
        this.gen = PATHS[this.sel.value].run(this.g, this.st);
      }
      this.btnRun.textContent = '▶ Run';
      this.draw();
      this.stats();
    }

    play() {
      if (this.done) this.prepare();
      this.running = true;
      this.btnRun.textContent = '❚❚ Pause';
      if (!this.st.t0) this.st.t0 = performance.now();
      const loop = () => {
        if (!this.running) return;
        if (!this.visible()) { this.pause(); return; }
        this.acc += SPEEDS[(+this.speed.value || 6) - 1];
        while (this.acc >= 1 && !this.done) { this.step(); this.acc -= 1; }
        this.draw();
        if (this.done) { this.pause(); this.btnRun.textContent = '↻ Replay'; return; }
        this.raf = requestAnimationFrame(loop);
      };
      this.raf = requestAnimationFrame(loop);
    }
    pause() {
      this.running = false;
      cancelAnimationFrame(this.raf);
      if (this.btnRun && !this.done) this.btnRun.textContent = '▶ Run';
    }

    step() {
      if (this.done) return;
      const r = this.gen.next();
      if (r.done) { this.finish(); return; }
      this.st.steps++;
      const ev = r.value;
      if (this.mode === 'sort') this.hl = ev;
      else {
        if (ev.visit != null) { this.visit[ev.visit] = 1; this.front[ev.visit] = 0; }
        if (ev.frontier != null) this.front[ev.frontier] = 1;
        if (ev.path) { this.path = ev.path; this.finish(); }
      }
      this.stats();
    }
    finish() {
      this.done = true;
      this.hl = null;
      if (this.st.t0) this.st.ms = performance.now() - this.st.t0;
      if (this.mode === 'sort') this.work.forEach((_, i) => this.st.sorted.add(i));
      this.stats();
    }

    stats() {
      const s = this.st;
      const meta = (this.mode === 'sort' ? SORTS : PATHS)[this.sel.value];
      const rows = this.mode === 'sort'
        ? [['n', this.work.length], ['comparisons', s.cmp], ['writes', s.wr], ['steps', s.steps], ['complexity', meta.cx]]
        : [['grid', `${this.g.cols}×${this.g.rows}`], ['visited', s.visited], ['path', this.path ? (this.path.length ? this.path.length - 1 : 'sin ruta') : '—'], ['steps', s.steps], ['complexity', meta.cx]];
      this.statsEl.innerHTML = rows.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('');
    }

    /* ---------- canvas ---------- */
    resize() {
      if (!this.stage.clientWidth) return;
      if (this.pendingInit) {
        this.pendingInit = false;
        this.readColors();
        if (this.mode === 'sort') this.shuffle(); else this.initGrid();
      }
      const w = Math.max(240, this.stage.clientWidth);
      const h = this.mode === 'sort' ? Math.round(Math.min(280, Math.max(180, w * 0.32))) : Math.round(w * (this.g.rows / this.g.cols));
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      this.canvas.style.height = h + 'px';
      this.canvas.width = Math.round(w * dpr);
      this.canvas.height = Math.round(h * dpr);
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      this.W = w; this.H = h;
      this.draw();
    }

    draw() {
      if (!this.W) return;
      if (this.mode === 'sort') this.drawSort(); else this.drawGrid();
    }

    drawSort() {
      const { ctx, W, H, c } = this;
      const a = this.work; const n = a.length;
      ctx.clearRect(0, 0, W, H);
      const bw = W / n;
      const hl = this.hl || {};
      if (hl.range) {
        ctx.fillStyle = c.range;
        ctx.fillRect(hl.range[0] * bw, 0, (hl.range[1] - hl.range[0] + 1) * bw, H);
      }
      for (let i = 0; i < n; i++) {
        let col = this.st.sorted.has(i) ? c.done : c.bar;
        if (hl.pivot === i) col = c.pivot;
        if (hl.cmp && hl.cmp.includes(i)) col = c.cmp;
        if ((hl.swap && hl.swap.includes(i)) || (hl.set && hl.set.includes(i))) col = c.swap;
        const bh = (a[i] / 100) * (H - 8);
        ctx.fillStyle = col;
        const x = i * bw + Math.max(0.5, bw * 0.12);
        const w = Math.max(1, bw * 0.76);
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(x, H - bh, w, bh, [Math.min(3, w / 2), Math.min(3, w / 2), 0, 0]);
        else ctx.rect(x, H - bh, w, bh);
        ctx.fill();
      }
    }

    drawGrid() {
      const { ctx, W, H, c, g } = this;
      const cw = W / g.cols, ch = H / g.rows;
      ctx.clearRect(0, 0, W, H);
      const onPath = new Set(this.path || []);
      for (let i = 0; i < g.cols * g.rows; i++) {
        const x = (i % g.cols) * cw, y = ((i / g.cols) | 0) * ch;
        let col = c.cell;
        if (g.walls[i]) col = c.wall;
        else if (onPath.has(i)) col = c.done;
        else if (this.visit[i]) col = c.visit;
        else if (this.front[i]) col = c.front;
        if (i === g.start) col = c.cmp;
        if (i === g.end) col = c.pivot;
        ctx.fillStyle = col;
        ctx.fillRect(x + 0.75, y + 0.75, cw - 1.5, ch - 1.5);
      }
    }

    cellAt(e) {
      const r = this.canvas.getBoundingClientRect();
      const c = Math.floor(((e.clientX - r.left) / r.width) * this.g.cols);
      const row = Math.floor(((e.clientY - r.top) / r.height) * this.g.rows);
      if (c < 0 || row < 0 || c >= this.g.cols || row >= this.g.rows) return -1;
      return row * this.g.cols + c;
    }
    onDown(e) {
      if (this.mode !== 'path') return;
      const i = this.cellAt(e);
      if (i < 0) return;
      this.pause();
      if (i === this.g.start) this.drag = { kind: 'start' };
      else if (i === this.g.end) this.drag = { kind: 'end' };
      else { this.drag = { kind: 'paint', val: this.g.walls[i] ? 0 : 1 }; this.g.walls[i] = this.drag.val; }
      this.canvas.setPointerCapture(e.pointerId);
      this.prepare();
    }
    onMove(e) {
      if (!this.drag || this.mode !== 'path') return;
      const i = this.cellAt(e);
      if (i < 0) return;
      const g = this.g;
      if (this.drag.kind === 'start' && i !== g.end) { g.start = i; g.walls[i] = 0; }
      else if (this.drag.kind === 'end' && i !== g.start) { g.end = i; g.walls[i] = 0; }
      else if (this.drag.kind === 'paint' && i !== g.start && i !== g.end) g.walls[i] = this.drag.val;
      this.prepare();
    }
  }

  LLP.initAlgos = function () {
    LLP.algos = LLP.$$('[data-algo]').map((el) => new AlgoInspector(el));
  };
})();
