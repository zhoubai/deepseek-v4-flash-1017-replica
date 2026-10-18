/* ============================================================
   SCENE 05 — 通过率 × 费用散点折线图（37.5 → 44.0s）
   浅色 macOS 窗口 × 官方图 × 红色斩杀线 × 深色胶囊
   ============================================================ */
Replica.registerScene({
  id: 'chart',
  title: '通过率与每任务费用',
  start: 37.5,
  end: 44.0,
  build(root) {
    /* ---------- 坐标映射（win-body 局部坐标，772×512） ---------- */
    const X = (c) => 137 + 269 * Math.log10(c);
    const Y = (p) => 174 + (70 - p) * 7.85;
    const f = (n) => Math.round(n * 10) / 10;

    const C = {
      teal: '#5FA8A1', slate: '#8A93A6', blue: '#4D6BFE', navy: '#23368F',
      green: '#7BC043', purple: '#8E7BD8', sand: '#D9AE86', rose: '#D96A80',
      ink: '#3B4FA8', gold: '#D8B23A', cell: '#4FA35A',
    };

    /* ---------- 系列数据 [cost, pass, effortLabel, dx, dy] ---------- */
    const SER = [
      { // GPT-6 Sol
        color: C.teal, w: 2.0, r: 1.9,
        pts: [
          [1.05, 34.8, 'low', -4, 12], [1.5, 43.5], [2.55, 56.3, 'med', 5, 12],
          [3.9, 63.2], [6.2, 67.8, 'high', 8, 11], [10.5, 69.6, 'xhigh', 0, 12], [18, 72.8],
        ],
        name: { t: 'GPT-6 Sol', x: 84, y: 464 },
      },
      { // GPT-6.1 Sol
        color: C.slate, w: 2.0, r: 1.9,
        pts: [
          [2.1, 69.7], [4.4, 77.0, 'max', -38, -3], [5.8, 74.9, 'high', 10, -2],
          [7.6, 73.4], [12, 73.3, 'xhigh', -6, 13], [20, 73.3],
        ],
        name: { t: 'GPT-6.1 Sol', x: 388, y: 151 },
      },
      { // GPT-6 Luna
        color: C.slate, w: 2.0, r: 1.9,
        pts: [
          [0.73, 61.5, 'xhigh', -40, 8], [1.15, 63.2, 'low', -27, 1],
          [1.5, 67.2, 'max', -28, -7], [2.1, 69.7],
        ],
        name: { t: 'GPT-6 Luna', x: 106, y: 255 },
      },
      { // DeepSeek V4.1 Flash
        color: C.blue, w: 3.8, sq: 5.6,
        pts: [
          [1.45, 67.2, 'low', -16, 12], [2.0, 69.7, 'high', -7, -8],
          [3.3, 74.4, 'med', 9, 12], [4.4, 77.0, 'max', 3, -9],
        ],
        name: { t: 'DeepSeek V4.1 Flash', x: 187, y: 214, c: '#2E3B66' },
      },
      { // DeepSeek V4.1 Flash 1017
        color: C.navy, w: 4.2, r: 3.6,
        pts: [[0.75, 73.1, 'low', -11, -8], [0.97, 73.6, 'high', 10, 12], [1.29, 76.9]],
        navyLabel: true,
      },
      { // Gemini 3.8 Flash
        color: C.green, w: 2.0, r: 1.9,
        pts: [[13.4, 71.1, 'high', 6, 12], [15.8, 74.7], [19.7, 77.3]],
        name: { t: 'Gemini 3.8 Flash', x: 462, y: 140, c: '#5D9634' },
      },
      { // GPT-6 Astra
        color: C.purple, w: 2.0, r: 1.9,
        pts: [
          [9.6, 63.4, 'low', -8, 13], [12.9, 72.4, 'med', -14, 13], [16, 73.5, 'high', 2, 13],
          [20, 74.6], [25, 74.4, 'xhigh', 6, -7], [35, 75.0, 'max', 0, 13], [45, 74.9],
        ],
        name: { t: 'GPT-6 Astra', x: 600, y: 142, c: '#7A63C9' },
      },
      { // Claude Opus 5
        color: C.sand, w: 2.0, r: 1.9,
        pts: [
          [12.8, 64.7, 'low', 2, 13], [20, 70, 'med', -3, 13], [30, 74.3, 'high', -2, 13],
          [40, 75.8], [55, 76.5], [68, 76.8, 'max', 0, -7],
        ],
        name: { t: 'Claude Opus 5', x: 654, y: 148, c: '#BE926A' },
      },
      { // Claude Fable 5
        color: C.rose, w: 2.0, r: 1.9,
        pts: [
          [20, 58.8, 'low', 0, 13], [30, 61.5, 'med', -4, 13], [40, 65.2, 'high', 2, 13],
          [52, 67.6, 'xhigh', 0, 13], [70, 68.8], [95, 69.6], [120, 69.8, 'max', 0, 13],
        ],
        name: { t: 'Claude Fable 5', x: 690, y: 167, c: '#D05F76' },
      },
    ];

    /* ---------- 星标 ---------- */
    const STARS = [
      { x: 188, y: 226, r: 6.5, fill: C.gold, label: 'GLM-5.3 Flash · max', lx: 204, ly: 231, lc: '#A8862C' },
      { x: 521, y: 184, r: 6.5, fill: C.gold, label: 'GLM-5.3 · max', lx: 493, ly: 203, lc: '#A8862C' },
      { x: 267, y: 305, r: 7.2, fill: '#5F7BE8', label: 'DeepSeek V4 Flash · max', lx: 281, ly: 309, lc: '#4C63A8' },
      { x: 421, y: 227, r: 9.5, fill: '#1F2E6E', label: 'DeepSeek V4 Pro · max', lx: 292, ly: 248, lc: '#23368F' },
      { x: 534, y: 182, r: 7.2, fill: '#4FA35A', label: 'Kimi K3 · max', lx: 546, ly: 187, lc: '#3F8A4A' },
    ];

    const starPts = (x, y, r) => {
      const pts = [];
      for (let i = 0; i < 10; i++) {
        const rr = i % 2 ? r * 0.42 : r;
        const a = -Math.PI / 2 + (i * Math.PI) / 5;
        pts.push((x + rr * Math.cos(a)).toFixed(1) + ',' + (y + rr * Math.sin(a)).toFixed(1));
      }
      return pts.join(' ');
    };

    /* ---------- 折线 / 散点 SVG ---------- */
    function seriesHTML(s, idx) {
      const pts = s.pts.map((p) => [X(p[0]), Y(p[1])]);
      const d = 'M' + pts.map((p) => f(p[0]) + ',' + f(p[1])).join(' L ');
      let o = '<g class="s5-ser s5-ser--' + idx + '">';
      o += '<path class="s5-line" d="' + d + '" fill="none" stroke="' + s.color +
        '" stroke-width="' + s.w + '" stroke-linecap="round" stroke-linejoin="round"/>';
      s.pts.forEach((p) => {
        const x = X(p[0]), y = Y(p[1]);
        if (s.sq) {
          o += '<rect class="s5-dot" x="' + f(x - s.sq / 2) + '" y="' + f(y - s.sq / 2) +
            '" width="' + s.sq + '" height="' + s.sq + '" rx="1" fill="' + s.color +
            '" stroke="#FFFFFF" stroke-width="1.2"/>';
        } else {
          o += '<circle class="s5-dot" cx="' + f(x) + '" cy="' + f(y) + '" r="' + s.r +
            '" fill="' + s.color + '" stroke="#FFFFFF" stroke-width="' + (s.w > 4 ? 1.6 : 1) + '"/>';
        }
      });
      s.pts.forEach((p) => {
        if (!p[2]) return;
        o += '<text class="s5-eff" x="' + f(X(p[0]) + p[3]) + '" y="' + f(Y(p[1]) + p[4]) +
          '" fill="' + s.color + '">' + p[2] + '</text>';
      });
      if (s.name) {
        o += '<text class="s5-name" x="' + s.name.x + '" y="' + s.name.y + '" fill="' +
          (s.name.c || s.color) + '">' + s.name.t + '</text>';
      }
      o += '</g>';
      return o;
    }

    const svg = `
      <svg class="s5-svg" viewBox="0 0 772 512" preserveAspectRatio="none">
        <defs>
          <linearGradient id="s5-plotbg" x1="0" y1="0" x2="0.85" y2="1">
            <stop offset="0" stop-color="#FCFDFF"/>
            <stop offset="0.40" stop-color="#F0F4FD"/>
            <stop offset="1" stop-color="#DFE6FA"/>
          </linearGradient>
          <linearGradient id="s5-wash" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="#E8392F" stop-opacity="0"/>
            <stop offset="1" stop-color="#E8392F" stop-opacity=".075"/>
          </linearGradient>
        </defs>

        <!-- 绘图区 -->
        <g class="s5-frame">
          <rect class="s5-plotbg" x="64" y="72" width="690" height="398" fill="url(#s5-plotbg)"/>
          <rect class="s5-topwhite" x="64" y="72" width="690" height="47.5" fill="#FCFDFF" opacity=".92"/>
          <rect class="s5-washall" x="64" y="72" width="690" height="398" fill="#E8392F" opacity="0"/>
          <rect class="s5-killwash" x="100" y="119.5" width="654" height="350.5" fill="url(#s5-wash)" opacity="0"/>
          <g class="s5-grid">
            <line x1="64" y1="95.5" x2="754" y2="95.5"/>
            <line x1="64" y1="174" x2="754" y2="174"/>
            <line x1="64" y1="252.5" x2="754" y2="252.5"/>
            <line x1="64" y1="331" x2="754" y2="331"/>
            <line x1="64" y1="409.5" x2="754" y2="409.5"/>
          </g>
          <g class="s5-grid s5-grid--v">
            <line x1="137" y1="72" x2="137" y2="470"/>
            <line x1="218" y1="72" x2="218" y2="470"/>
            <line x1="325" y1="72" x2="325" y2="470"/>
            <line x1="406" y1="72" x2="406" y2="470"/>
            <line x1="487" y1="72" x2="487" y2="470"/>
            <line x1="594" y1="72" x2="594" y2="470"/>
            <line x1="675" y1="72" x2="675" y2="470"/>
          </g>
          <line class="s5-axis" x1="64" y1="470" x2="754" y2="470"/>
          <line class="s5-axis" x1="64" y1="72" x2="64" y2="470"/>

          <!-- y ticks -->
          <g class="s5-ticks-y">
            <text x="56" y="99" text-anchor="end">80%</text>
            <text x="56" y="177.5" text-anchor="end">70%</text>
            <text x="56" y="256" text-anchor="end">60%</text>
            <text x="56" y="334.5" text-anchor="end">50%</text>
            <text x="56" y="413" text-anchor="end">40%</text>
          </g>
          <text class="s5-axistitle" x="19" y="272" text-anchor="middle" transform="rotate(-90 19 272)">通过率（Pass@1）</text>

          <!-- 77% 虚线 -->
          <line class="s5-ref" x1="64" y1="119.5" x2="754" y2="119.5"/>
          <line class="s5-ref s5-ref--v" x1="100.2" y1="119.5" x2="100.2" y2="470"/>

          <!-- 折线组 -->
          <g class="s5-series">
            ${SER.map(seriesHTML).join('')}
          </g>

          <!-- 1017 系列标签 -->
          <g class="s5-navy-lab">
            <text x="78" y="94" fill="${C.ink}">DeepSeek V4.1 Flash-1017</text>
            <text x="100" y="104" fill="${C.navy}" font-weight="700">max · 77.0%</text>
          </g>

          <!-- 星标 -->
          <g class="s5-stars">
            ${STARS.map((st) => `<g class="s5-star"><polygon points="${starPts(st.x, st.y, st.r)}" fill="${st.fill}"/></g>`).join('')}
          </g>
          <g class="s5-starnames">
            ${STARS.map((st) => `<text x="${st.lx}" y="${st.ly}" fill="${st.lc}">${st.label}</text>`).join('')}
          </g>

          <!-- 斩杀线 -->
          <g class="s5-kill">
            <line class="s5-kill-v" x1="100.2" y1="470" x2="100.2" y2="119.5" stroke="#E8392F"/>
            <line class="s5-kill-h" x1="100.2" y1="119.5" x2="709" y2="119.5" stroke="#E8392F"/>
            <ellipse class="s5-ring" cx="137" cy="122" rx="68" ry="36" transform="rotate(-8 137 122)" fill="none" stroke="#3D57E8"/>
            <ellipse class="s5-ring2" cx="139" cy="123" rx="70" ry="35" transform="rotate(-6.5 139 123)" fill="none" stroke="#3D57E8"/>
          </g>

          <!-- 底部费用条 -->
          <g class="s5-bars">
            <rect class="s5-bar s5-bar--ds" x="135" y="461" width="82" height="9" rx="4.5" fill="#6075F2"/>
            <rect class="s5-bar s5-bar--op" x="407" y="461" width="270" height="9" rx="4.5" fill="#B73832"/>
          </g>

          <!-- x ticks -->
          <g class="s5-ticks-x">
            <text x="137" y="486" text-anchor="middle">¥1</text>
            <text x="218" y="486" text-anchor="middle">¥2</text>
            <text x="325" y="486" text-anchor="middle">¥5</text>
            <text x="406" y="486" text-anchor="middle">¥10</text>
            <text x="487" y="486" text-anchor="middle">¥20</text>
            <text x="594" y="486" text-anchor="middle">¥50</text>
            <text x="675" y="486" text-anchor="middle">¥100</text>
          </g>
          <text class="s5-axistitle" x="407" y="504" text-anchor="middle">每任务平均费用（人民币，对数刻度）</text>
        </g>
      </svg>`;

    /* ---------- DOM ---------- */
    root.innerHTML = `
      <div class="bg bg-hex"></div>
      <div class="vignette"></div>
      <div class="s5-stage">
        ${UI.win({
          title: 'DeepSWE 通过率与每任务费用 · 官方图',
          tone: 'light',
          left: 48, top: 34, width: 772, height: 546,
          cls: 's5-win',
          body: `<div class="s5-head">
              <div class="s5-title"><b>DeepSWE v1.1</b><span>通过率（Pass@1）与每任务费用</span></div>
              <div class="s5-sub">评测框架：mini_swe_v2</div>
            </div>${svg}`,
        })}
        ${UI.avatar({ kind: 'host', size: 150, left: 1040, top: 97, cls: 's5-avatar' })}
        <div class="s5-pill s5-pill--1"><i></i>1017：每个任务约 ¥1–2</div>
        <div class="s5-pill s5-pill--2"><i></i>对手太多 ¥10–¥100</div>
        <div class="s5-pill s5-pill--3"><i></i>还更贵，分还比它低</div>
        ${UI.stamp({ size: 86, ink: 'indigo', rotate: -14, left: 269, top: 107, cls: 's5-stamp' })}
      </div>`;

    const q = (s) => root.querySelector(s);
    const qa = (s) => Array.prototype.slice.call(root.querySelectorAll(s));
    const win = q('.s5-win');
    const head = q('.s5-head');
    const avatar = q('.s5-avatar');
    const stampWrap = q('.s5-stamp');
    const pills = qa('.s5-pill');
    const ring = q('.s5-ring');
    const ring2 = q('.s5-ring2');
    const plotbg = q('.s5-plotbg');
    const killWash = q('.s5-killwash');
    const washAll = q('.s5-washall');

    const tl = gsap.timeline({ paused: true });

    /* ---------- 初始态 ---------- */
    tl.set(win, { opacity: 0, y: 26, scale: 0.986, transformOrigin: '50% 60%' }, 0);
    tl.set(head, { opacity: 0, y: -8 }, 0);
    tl.set(avatar, { opacity: 0, scale: 0.88 }, 0);
    tl.set(plotbg, { opacity: 0 }, 0);
    tl.set('.s5-grid line', { opacity: 0 }, 0);
    tl.set('.s5-axis', { opacity: 0, scaleX: 0, transformOrigin: '0% 50%' }, 0);
    tl.set('.s5-ticks-x text, .s5-ticks-y text', { opacity: 0 }, 0);
    tl.set('.s5-axistitle', { opacity: 0 }, 0);
    tl.set('.s5-ref', { opacity: 0 }, 0);
    tl.set('.s5-navy-lab', { opacity: 0 }, 0);
    tl.set('.s5-star, .s5-starnames text', { opacity: 0 }, 0);
    tl.set(pills, { opacity: 0, x: 34, scale: 0.96 }, 0);
    tl.set(killWash, { opacity: 0 }, 0);
    tl.set(washAll, { opacity: 0 }, 0);
    tl.set('.s5-kill-v, .s5-kill-h', { opacity: 0 }, 0);
    tl.set([ring, ring2], { opacity: 0 }, 0);

    /* SVG 线条 / 散点初始态（需要测量长度） */
    qa('.s5-line').forEach((p) => {
      const L = p.getTotalLength();
      gsap.set(p, { strokeDasharray: L, strokeDashoffset: L });
    });
    qa('.s5-dot').forEach((d) => gsap.set(d, { scale: 0, transformOrigin: '50% 50%' }));
    qa('.s5-eff, .s5-name').forEach((t) => gsap.set(t, { opacity: 0 }));

    const len = (el) => {
      const L = el.getTotalLength ? el.getTotalLength() : 300;
      gsap.set(el, { strokeDasharray: L, strokeDashoffset: L });
      return L;
    };
    const killVL = len(q('.s5-kill-v'));
    const killHL = len(q('.s5-kill-h'));
    const ringL = ring.getTotalLength();
    gsap.set([ring, ring2], { strokeDasharray: ringL, strokeDashoffset: ringL });
    qa('.s5-ref').forEach((l) => {
      const L = l.getTotalLength();
      gsap.set(l, { strokeDasharray: '5 4', strokeDashoffset: L, opacity: 0 });
    });

    /* ---------- 入场 ---------- */
    tl.to(win, { opacity: 1, y: 0, scale: 1, duration: 0.72, ease: 'power3.out' }, 0.14);
    tl.to(head, { opacity: 1, y: 0, duration: 0.44, ease: 'power2.out' }, 0.5);
    tl.to(avatar, { opacity: 1, scale: 1, duration: 0.36, ease: 'back.out(1.6)' }, 0.5);

    /* 绘图区 / 轴 / 网格 */
    tl.to(plotbg, { opacity: 1, duration: 0.45, ease: 'power1.out' }, 0.62);
    tl.to('.s5-grid line', { opacity: 1, duration: 0.4, stagger: 0.008, ease: 'none' }, 0.72);
    tl.to('.s5-axis', { opacity: 1, scaleX: 1, duration: 0.42, ease: 'power2.out' }, 0.62);
    tl.to('.s5-ticks-x text', { opacity: 1, duration: 0.3, stagger: 0.03 }, 0.82);
    tl.to('.s5-ticks-y text', { opacity: 1, duration: 0.3, stagger: 0.03 }, 0.78);
    tl.to('.s5-axistitle', { opacity: 1, duration: 0.35, stagger: 0.06 }, 0.92);
    tl.to('.s5-ref', { opacity: 1, duration: 0.3 }, 0.95);
    tl.to('.s5-ref', { strokeDashoffset: 0, duration: 0.55, ease: 'power2.inOut' }, 0.95);
    tl.to('.s5-ref--v', { strokeDashoffset: 0, duration: 0.45, ease: 'power2.inOut' }, 1.2);

    /* ---------- 折线依次绘制 ---------- */
    const serStart = [0.95, 1.03, 1.1, 1.2, 1.32, 1.45, 1.53, 1.64, 1.75];
    qa('.s5-ser').forEach((g, i) => {
      const t0 = serStart[i];
      const line = g.querySelector('.s5-line');
      tl.to(line, { strokeDashoffset: 0, duration: 0.52, ease: 'power1.inOut' }, t0);
      const dots = g.querySelectorAll('.s5-dot');
      tl.to(dots, { scale: 1, duration: 0.28, ease: 'back.out(2.2)', stagger: 0.055 }, t0 + 0.1);
      const labs = g.querySelectorAll('.s5-eff');
      if (labs.length) tl.to(labs, { opacity: 1, duration: 0.25, stagger: 0.03 }, t0 + 0.16);
      const nm = g.querySelectorAll('.s5-name');
      if (nm.length) tl.to(nm, { opacity: 1, duration: 0.3 }, t0 + 0.22);
    });
    tl.to('.s5-navy-lab', { opacity: 1, duration: 0.35 }, 1.42);

    /* 星标 */
    tl.to('.s5-star', { opacity: 1, duration: 0.32, stagger: 0.06, ease: 'back.out(1.8)' }, 1.7);
    tl.to('.s5-starnames text', { opacity: 1, duration: 0.3, stagger: 0.06 }, 1.78);

    /* 手绘圈住 DeepSeek 数据簇（原片为靛蓝手绘椭圆，非红色） */
    tl.to([ring, ring2], { opacity: 1, duration: 0.16 }, 2.28);
    tl.to([ring, ring2], { strokeDashoffset: 0, duration: 0.6, ease: 'power2.inOut' }, 2.28);
    tl.to('.s5-ring', { strokeWidth: 4.9, duration: 1.5, ease: 'sine.inOut', repeat: -1, yoyo: true }, 2.9);

    /* ---------- 斩杀线 ---------- */
    tl.to('.s5-kill-v', { opacity: 1, duration: 0.12 }, 2.52);
    tl.to('.s5-kill-v', { strokeDashoffset: 0, duration: 0.42, ease: 'power2.in' }, 2.53);
    tl.to('.s5-kill-h', { opacity: 1, duration: 0.12 }, 2.9);
    tl.to('.s5-kill-h', { strokeDashoffset: 0, duration: 0.58, ease: 'power2.out' }, 2.91);
    tl.to(killWash, { opacity: 1, duration: 0.45, ease: 'power1.out' }, 2.78);
    tl.to('.s5-washall', { opacity: 0.035, duration: 0.6, ease: 'power1.out' }, 2.82);
    tl.fromTo('.s5-kill', { opacity: 0.85 }, { opacity: 1, duration: 0.7, ease: 'sine.inOut', repeat: -1, yoyo: true }, 3.5);

    /* 底部费用条 */
    tl.fromTo('.s5-bar--ds', { scaleX: 0 }, { scaleX: 1, duration: 0.4, ease: 'power3.out', transformOrigin: '0% 50%' }, 3.42);
    tl.fromTo('.s5-bar--op', { scaleX: 0 }, { scaleX: 1, duration: 0.55, ease: 'power3.out', transformOrigin: '0% 50%' }, 3.55);

    /* ---------- 深色胶囊 ---------- */
    tl.to(pills[0], { opacity: 1, x: 0, scale: 1, duration: 0.42, ease: 'back.out(1.5)' }, 3.4);
    tl.to(pills[1], { opacity: 1, x: 0, scale: 1, duration: 0.42, ease: 'back.out(1.5)' }, 3.6);
    tl.to(pills[2], { opacity: 1, x: 0, scale: 1, duration: 0.42, ease: 'back.out(1.5)' }, 5.12);

    /* ---------- 1017 印章 ---------- */
    tl.set(stampWrap, { scale: 1.62, rotate: -46, opacity: 0 }, 0);
    tl.to(stampWrap, { opacity: 1, scale: 1, duration: 0.34, ease: 'power2.in' }, 4.12);
    tl.to(stampWrap, { rotate: -17, duration: 0.5, ease: 'back.out(2.4)' }, 4.12);
    tl.fromTo('.s5-stamp .stamp', { scale: 1.08 }, { scale: 1, duration: 0.4, ease: 'power2.out' }, 4.3);

    return { timeline: tl };
  },
});
