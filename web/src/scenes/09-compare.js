/* ============================================================
   SCENE 09 — compare 实测对比（74.0 → 86.0s）
   同一份提示词 × 两版模型 · Opus / DeepSeek 双窗口并排
   播放两段 AI 生成的 10s 科技新闻数据可视化视频（canvas 纯函数绘制）
   ============================================================ */
(function () {
  'use strict';

  const TAU = Math.PI * 2;
  const MONO = '"SF Mono", Menlo, Consolas, monospace';
  const SANS = 'NotoSC, "PingFang SC", "Hiragino Sans GB", sans-serif';
  const VW = 620;   // canvas 逻辑宽度
  const VH = 344;   // canvas 逻辑高度

  /* ============================================================
     基础工具（全部确定性，无随机状态残留）
     ============================================================ */
  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function smooth(a, b, x) { const t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); }
  function easeOutCubic(x) { const t = 1 - clamp01(x); return 1 - t * t * t; }
  function easeOutExpo(x) { const t = clamp01(x); return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t); }
  function easeOutQuad(x) { const t = 1 - clamp01(x); return 1 - t * t; }
  function rgba(rgb, a) { return 'rgba(' + rgb + ',' + a + ')'; }

  function rr(ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  function label(ctx, str, x, y, o) {
    o = o || {};
    ctx.save();
    ctx.font = (o.weight || 500) + ' ' + (o.size || 7) + 'px ' + (o.mono ? MONO : SANS);
    ctx.fillStyle = o.color || 'rgba(255,255,255,.5)';
    ctx.textAlign = o.align || 'left';
    ctx.textBaseline = o.base || 'alphabetic';
    if (o.ls) { try { ctx.letterSpacing = o.ls + 'px'; } catch (e) {} }
    if (o.glow) { ctx.shadowColor = o.glow; ctx.shadowBlur = o.blur == null ? 10 : o.blur; }
    ctx.fillText(str, x, y);
    ctx.restore();
  }

  /* 居中多段着色文字 */
  /* 从指定左边界起笔的多段着色文字 */
  function segsLeft(ctx, x, y, parts) {
    ctx.save();
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    parts.forEach(function (p) {
      ctx.font = p.f;
      if (p.ls) { try { ctx.letterSpacing = p.ls + 'px'; } catch (e) {} }
      ctx.fillStyle = p.c || '#fff';
      if (p.glow) { ctx.shadowColor = p.glow; ctx.shadowBlur = p.blur == null ? 16 : p.blur; }
      ctx.fillText(p.s, x, y);
      x += ctx.measureText(p.s).width;
      ctx.shadowBlur = 0;
      ctx.shadowColor = 'rgba(0,0,0,0)';
    });
    ctx.restore();
  }

  /* 居中多段着色文字 */
  function segs(ctx, cx, y, parts) {
    let total = 0;
    ctx.save();
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    parts.forEach(function (p) {
      ctx.font = p.f;
      if (p.ls) { try { ctx.letterSpacing = p.ls + 'px'; } catch (e) {} }
      total += ctx.measureText(p.s).width;
    });
    let x = cx - total / 2;
    parts.forEach(function (p) {
      ctx.font = p.f;
      if (p.ls) { try { ctx.letterSpacing = p.ls + 'px'; } catch (e) {} }
      ctx.fillStyle = p.c || '#fff';
      if (p.glow) { ctx.shadowColor = p.glow; ctx.shadowBlur = p.blur == null ? 16 : p.blur; }
      ctx.fillText(p.s, x, y);
      x += ctx.measureText(p.s).width;
      ctx.shadowBlur = 0;
      ctx.shadowColor = 'rgba(0,0,0,0)';
    });
    ctx.restore();
  }

  /* ============================================================
     固定 seed 素材
     ============================================================ */
  function buildStars(rand, n) {
    const out = [];
    for (let i = 0; i < n; i++) {
      out.push({
        x: rand() * VW, y: rand() * VH,
        r: 0.35 + rand() * 1.05,
        ph: rand() * TAU, sp: 0.5 + rand() * 1.6,
        a: 0.14 + rand() * 0.7,
      });
    }
    return out;
  }
  function buildSphere(rand, n) {
    const out = [];
    const ga = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < n; i++) {
      const y = 1 - 2 * (i + 0.5) / n;
      const r = Math.sqrt(Math.max(0, 1 - y * y));
      const th = ga * i;
      out.push({ x: Math.cos(th) * r, y: y, z: Math.sin(th) * r, s: 0.55 + rand() * 0.9, ph: rand() * TAU });
    }
    return out;
  }
  function buildDust(rand, n) {
    const out = [];
    for (let i = 0; i < n; i++) {
      out.push({
        x: rand() * VW, y: rand() * VH,
        r: 0.4 + rand() * 1.5,
        ph: rand() * TAU, sp: 0.25 + rand() * 0.9,
        rise: 10 + rand() * 44, a: 0.18 + rand() * 0.6,
      });
    }
    return out;
  }
  function buildBars(rand, n) {
    const out = [];
    for (let i = 0; i < n; i++) {
      const u = i / (n - 1);
      const trend = 0.12 + 0.8 * Math.pow(u, 1.55);
      const noise = (rand() - 0.5) * 0.24;
      out.push(clamp01(trend + noise));
    }
    return out;
  }
  function buildSparks(rand, n) {
    const out = [];
    for (let i = 0; i < n; i++) {
      out.push({
        ang: rand() * TAU,
        r0: 3 + rand() * 34,
        spd: 8 + rand() * 30,
        ph: rand() * 0.85,
        sz: 0.5 + rand() * 1.6,
        up: 8 + rand() * 56,
        idx: i,
      });
    }
    return out;
  }

  /* ============================================================
     单个窗口里的 mini 视频渲染器
     cfg: { key, seed, accent(rgb), accent2, barTop, barBot, tint,
            token, card1W, card2W, card2Big, beamW, glitch, label }
     ============================================================ */
  function makeRenderer(canvas, cfg) {
    const ctx = canvas.getContext('2d');
    const rand = mulberry32(cfg.seed);

    const stars = buildStars(rand, 150);
    const sphere = buildSphere(rand, 420);
    const dust = buildDust(rand, 110);
    const bars = buildBars(rand, 26);
    const sparks = buildSparks(rand, 84);

    let bw = 0, bh = 0;

    function fit() {
      const cw = canvas.clientWidth || 618;
      const ch = canvas.clientHeight || 342;
      const ss = Math.max(2, Math.min(3, window.devicePixelRatio || 1));
      const nw = Math.max(2, Math.round(cw * ss));
      const nh = Math.max(2, Math.round(ch * ss));
      if (canvas.width !== nw) canvas.width = nw;
      if (canvas.height !== nh) canvas.height = nh;
      if (nw !== bw || nh !== bh) { bw = nw; bh = nh; }
      ctx.setTransform(bw / VW, 0, 0, bh / VH, 0, 0);
    }

    /* ---------- 背景 ---------- */
    function backdrop(t) {
      ctx.fillStyle = '#03050c';
      ctx.fillRect(0, 0, VW, VH);

      let g = ctx.createRadialGradient(312, 170, 14, 312, 170, 420);
      g.addColorStop(0, rgba(cfg.tint, 0.13));
      g.addColorStop(0.45, rgba(cfg.tint, 0.045));
      g.addColorStop(1, rgba(cfg.tint, 0));
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, VW, VH);

      g = ctx.createLinearGradient(0, 0, 0, VH);
      g.addColorStop(0, 'rgba(0,0,0,.30)');
      g.addColorStop(0.22, 'rgba(0,0,0,0)');
      g.addColorStop(0.78, 'rgba(0,0,0,0)');
      g.addColorStop(1, 'rgba(0,0,0,.42)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, VW, VH);

      /* 细网格 */
      ctx.lineWidth = 0.5;
      ctx.strokeStyle = rgba(cfg.accent, 0.05);
      ctx.beginPath();
      for (let x = 0; x <= VW; x += 31) { ctx.moveTo(x + 0.25, 0); ctx.lineTo(x + 0.25, VH); }
      for (let y = 0; y <= VH; y += 28.6) { ctx.moveTo(0, y + 0.25); ctx.lineTo(VW, y + 0.25); }
      ctx.stroke();

      /* 极细横纹（AI 视频压缩质感） */
      ctx.strokeStyle = 'rgba(255,255,255,.014)';
      ctx.beginPath();
      for (let y = 1; y < VH; y += 3) { ctx.moveTo(0, y + 0.5); ctx.lineTo(VW, y + 0.5); }
      ctx.stroke();

      /* 扫描带 */
      const sy = ((t * 0.115) % 1) * (VH + 120) - 60;
      const sg = ctx.createLinearGradient(0, sy - 30, 0, sy + 30);
      sg.addColorStop(0, rgba(cfg.accent, 0));
      sg.addColorStop(0.5, rgba(cfg.accent, 0.035));
      sg.addColorStop(1, rgba(cfg.accent, 0));
      ctx.fillStyle = sg;
      ctx.fillRect(0, sy - 30, VW, 60);
    }

    /* ---------- 暗角 / 顶部压暗 ---------- */
    function vignette() {
      let g = ctx.createRadialGradient(310, 172, 130, 310, 172, 410);
      g.addColorStop(0, 'rgba(0,0,0,0)');
      g.addColorStop(0.62, 'rgba(0,0,0,.16)');
      g.addColorStop(1, 'rgba(0,0,0,.60)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, VW, VH);

      g = ctx.createLinearGradient(0, 0, 0, 26);
      g.addColorStop(0, 'rgba(0,0,0,.50)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, VW, 26);

      g = ctx.createLinearGradient(0, VH - 30, 0, VH);
      g.addColorStop(0, 'rgba(0,0,0,0)');
      g.addColorStop(1, 'rgba(0,0,0,.55)');
      ctx.fillStyle = g;
      ctx.fillRect(0, VH - 30, VW, 30);
    }

    /* ---------- 顶部 / 底部 UI 装饰（AI 视频自带贴片） ---------- */
    function drawChrome(t, mode) {
      const ac = cfg.accent;
      /* 角标 */
      ctx.strokeStyle = 'rgba(255,255,255,.14)';
      ctx.lineWidth = 1;
      [[8, 8, 1, 1], [VW - 8, 8, -1, 1], [8, VH - 8, 1, -1], [VW - 8, VH - 8, -1, -1]].forEach(function (c) {
        ctx.beginPath();
        ctx.moveTo(c[0], c[1] + 13 * c[3]);
        ctx.lineTo(c[0], c[1]);
        ctx.lineTo(c[0] + 13 * c[2], c[1]);
        ctx.stroke();
      });

      const topLabel = mode === 'b' ? 'AI COMPUTE INDEX · LIVE'
        : mode === 'idle' ? 'AI DAILY NEWS · 2026'
          : 'AI DAILY NEWS · 2026';
      ctx.fillStyle = rgba(ac, 0.9);
      ctx.beginPath(); ctx.arc(16, 12, 1.8, 0, TAU); ctx.fill();
      label(ctx, topLabel, 22, 14.5, { mono: true, size: 6, ls: 1.5, color: 'rgba(255,255,255,.50)' });

      /* 右：REC + 时间码 */
      const blink = (Math.floor(t * 2) % 2) === 0;
      ctx.fillStyle = 'rgba(255,95,86,' + (blink ? .9 : .22) + ')';
      ctx.beginPath(); ctx.arc(VW - 94, 10, 2.1, 0, TAU); ctx.fill();
      label(ctx, 'REC', VW - 88, 12.6, { mono: true, size: 5.2, ls: 1.1, color: 'rgba(255,255,255,.42)' });
      const tc = '00:00:' + String(Math.min(59, Math.floor(t))).padStart(2, '0') + ':' +
        String(Math.floor((t % 1) * 25)).padStart(2, '0');
      label(ctx, tc, VW - 16, 12.6, { mono: true, size: 5.4, align: 'right', color: 'rgba(255,255,255,.36)' });

      ctx.strokeStyle = 'rgba(255,255,255,.06)';
      ctx.beginPath(); ctx.moveTo(14, 22.5); ctx.lineTo(VW - 14, 22.5); ctx.stroke();

      /* 底部标签 */
      label(ctx, cfg.label + ' · SAME PROMPT', 16, 326, { mono: true, size: 5.2, ls: 1.0, color: 'rgba(255,255,255,.26)' });
      label(ctx, 'AI DAILY NEWS · 2026', VW - 16, 326, { mono: true, size: 5.2, align: 'right', ls: 1.0, color: 'rgba(255,255,255,.26)' });

      /* 底部进度（AI 视频进度条） */
      const prog = clamp01(t / 7.5);
      ctx.fillStyle = 'rgba(255,255,255,.10)';
      ctx.fillRect(248, 335, 124, 1.5);
      ctx.fillStyle = rgba(cfg.accent, 0.55);
      ctx.fillRect(248, 335, 124 * prog, 1.5);
      ctx.fillStyle = 'rgba(255,255,255,.18)';
      [1 / 3, 2 / 3].forEach(function (u) { ctx.fillRect(248 + 124 * u, 334, 0.6, 3.5); });
    }

    /* ---------- 段 A：星空 + 粒子球 + Token 标题 ---------- */
    function drawSphere(t, app) {
      if (app <= 0.001) return;
      const cx = cfg.key === 'l' ? 310 : 315;
      const cy = cfg.key === 'l' ? 126 : 124;
      const R0 = (cfg.key === 'l' ? 90 : 93) * (0.5 + 0.5 * app);
      const rot = 0.35 + t * 0.5;
      const tilt = -0.30 + Math.sin(t * 0.25) * 0.05;

      /* 球体辉光 */
      let g = ctx.createRadialGradient(cx, cy, R0 * 0.15, cx, cy, R0 * 1.62);
      g.addColorStop(0, rgba(cfg.accent, 0.14 * app));
      g.addColorStop(0.45, rgba(cfg.accent, 0.045 * app));
      g.addColorStop(1, rgba(cfg.accent, 0));
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(cx, cy, R0 * 1.62, 0, TAU); ctx.fill();

      /* 轨道环 */
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(-0.24 + Math.sin(t * 0.18) * 0.03);
      ctx.scale(1, 0.34);
      ctx.strokeStyle = rgba(cfg.accent, 0.24 * app);
      ctx.lineWidth = 1.2;
      ctx.setLineDash([3, 9]);
      ctx.lineDashOffset = -t * 12;
      ctx.beginPath(); ctx.arc(0, 0, R0 * 1.32, 0, TAU); ctx.stroke();
      ctx.restore();

      /* 粒子球（fibonacci 分布 + 旋转投影；正交投影保持球体轮廓饱满） */
      const cosY = Math.cos(rot), sinY = Math.sin(rot);
      const cosX = Math.cos(tilt), sinX = Math.sin(tilt);
      for (let i = 0; i < sphere.length; i++) {
        const p = sphere[i];
        const x0 = p.x * cosY - p.z * sinY;
        const z0 = p.x * sinY + p.z * cosY;
        const y0 = p.y * cosX - z0 * sinX;
        const z = p.y * sinX + z0 * cosX;
        const depth = (z + 1) / 2;
        const spread = 1 + (depth - 0.5) * 0.10;
        const px = cx + x0 * R0 * spread;
        const py = cy + y0 * R0 * spread;
        const aa = (0.16 + depth * 0.68) * app;
        const size = (0.30 + depth * 0.58) * p.s;
        if (depth > 0.82) {
          ctx.shadowColor = rgba(cfg.accent, 0.85 * app);
          ctx.shadowBlur = 4;
        }
        ctx.fillStyle = depth > 0.68 ? rgba('240,246,255', aa) : rgba(cfg.accent, aa * 0.92);
        ctx.beginPath();
        ctx.arc(px, py, size, 0, TAU);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      /* 稀疏轨道亮星 */
      for (let i = 0; i < 5; i++) {
        const a = i * 2.399 + 0.4;
        const rr0 = R0 * (1.38 + (i % 3) * 0.2);
        const px = cx + Math.cos(a + t * 0.22) * rr0;
        const py = cy + Math.sin(a + t * 0.22) * rr0 * 0.6;
        ctx.fillStyle = rgba('255,255,255', 0.50 * app);
        ctx.beginPath(); ctx.arc(px, py, 1.15, 0, TAU); ctx.fill();
      }
    }

    function drawTokenTitle(t) {
      const p = smooth(0.72, 1.5, t);
      if (p <= 0.001) return;
      const rise = (1 - p) * 24;
      ctx.save();
      ctx.globalAlpha = p;

      if (cfg.key === 'l') {
        const y = 274 + rise;
        segs(ctx, 304, y, [
          { s: '2026：人类进入 ', f: '600 26px ' + SANS, c: 'rgba(238,242,248,.95)' },
          { s: 'Token', f: '800 29px ' + SANS, c: rgba(cfg.accent, 1), glow: rgba(cfg.accent, .9), blur: 18 },
          { s: ' 泛滥时代', f: '600 26px ' + SANS, c: 'rgba(238,242,248,.95)' },
        ]);
        label(ctx, 'GLOBAL TOKEN FLOOD · 2026', 304, y + 18, {
          mono: true, size: 5.8, align: 'center', ls: 2, color: rgba(cfg.accent, 0.42),
        });
      } else {
        segs(ctx, 330, 216 + rise, [
          { s: '2026：人类进入', f: '500 19px ' + SANS, c: 'rgba(224,236,246,.74)' },
        ]);
        segs(ctx, 312, 248 + rise, [
          { s: 'TOKEN', f: '800 33px ' + SANS, c: rgba(cfg.accent, 1), glow: rgba(cfg.accent, .9), blur: 22 },
          { s: ' 泛滥时代', f: '800 29px ' + SANS, c: 'rgba(242,249,255,.97)' },
        ]);
        label(ctx, 'TOKEN FLOOD · GLOBAL AI COMPUTE 2026', 320, 276 + rise, {
          mono: true, size: 5.8, align: 'center', ls: 1.8, color: rgba(cfg.accent, 0.42),
        });
      }

      /* 标题下方细线 */
      const lw = 150 * easeOutCubic(clamp01((t - 1.1) / 0.6));
      if (lw > 0.5) {
        const lg = ctx.createLinearGradient(310 - lw, 0, 310 + lw, 0);
        lg.addColorStop(0, rgba(cfg.accent, 0));
        lg.addColorStop(0.5, rgba(cfg.accent, 0.45));
        lg.addColorStop(1, rgba(cfg.accent, 0));
        ctx.fillStyle = lg;
        ctx.fillRect((cfg.key === 'l' ? 304 : 312) - lw, (cfg.key === 'l' ? 290 : 266), lw * 2, 1);
      }
      ctx.restore();
    }

    function drawA(t) {
      const aOut = 1 - smooth(2.02, 2.34, t);
      if (aOut <= 0.001) return;
      const app = easeOutCubic(clamp01(t / 0.9));
      ctx.save();
      ctx.globalAlpha = aOut;

      /* 星空 */
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        const yy = (s.y + t * 2.2) % VH;
        const tw = 0.45 + 0.55 * Math.sin(t * s.sp * 2.2 + s.ph);
        const al = s.a * (0.22 + 0.78 * Math.max(0, tw)) * app;
        ctx.fillStyle = rgba('214,228,255', al);
        ctx.beginPath();
        ctx.arc(s.x + Math.sin(t * 0.35 + s.ph) * 2, yy, s.r, 0, TAU);
        ctx.fill();
      }

      drawSphere(t, app);
      drawTokenTitle(t);
      ctx.restore();
    }

    /* ---------- 段 B：数据看板 ---------- */
    function cardShell(x, y, w, h, head) {
      let g = ctx.createLinearGradient(x, y, x + w * 0.7, y + h);
      g.addColorStop(0, 'rgba(26,34,58,.82)');
      g.addColorStop(0.55, 'rgba(12,17,34,.62)');
      g.addColorStop(1, 'rgba(6,9,20,.50)');
      ctx.fillStyle = g;
      rr(ctx, x, y, w, h, 4);
      ctx.fill();
      ctx.strokeStyle = rgba(cfg.accent, 0.18);
      ctx.lineWidth = 1;
      rr(ctx, x + 0.5, y + 0.5, w - 1, h - 1, 4);
      ctx.stroke();

      const hg = ctx.createLinearGradient(x + 10, 0, x + Math.min(w - 10, 190), 0);
      hg.addColorStop(0, rgba(cfg.accent, 0.60));
      hg.addColorStop(1, rgba(cfg.accent, 0));
      ctx.fillStyle = hg;
      ctx.fillRect(x + 10, y + 0.6, Math.min(w - 20, 180), 1);

      /* 卡内极细网格 */
      ctx.strokeStyle = 'rgba(255,255,255,.028)';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      for (let yy = y + 22; yy < y + h - 8; yy += 17) { ctx.moveTo(x + 8, yy + 0.5); ctx.lineTo(x + w - 8, yy + 0.5); }
      ctx.stroke();

      ctx.fillStyle = rgba(cfg.accent, 0.9);
      ctx.fillRect(x + 12, y + 9, 2.2, 5);
      label(ctx, head, x + 18, y + 14, { mono: true, size: 6, ls: 1.2, color: rgba(cfg.accent, 0.68) });
    }

    function drawDashboard(t) {
      const a = smooth(2.02, 2.44, t) * (1 - smooth(4.38, 4.62, t));
      if (a <= 0.002) return;
      ctx.save();
      ctx.globalAlpha = a;

      const y0 = 44, h = 246;
      const x1 = 26, w1 = cfg.card1W;
      const x2 = x1 + w1 + 14, w2 = cfg.card2W;
      const baseY = y0 + h - 18;
      const numY = y0 + 62;
      const labY = y0 + 84;
      const topY = y0 + 92;

      /* 扫描亮带 */
      const sy = 60 + ((t * 46) % 205);
      const sg = ctx.createLinearGradient(0, sy - 20, 0, sy + 20);
      sg.addColorStop(0, rgba(cfg.accent, 0));
      sg.addColorStop(0.5, rgba(cfg.accent, 0.05));
      sg.addColorStop(1, rgba(cfg.accent, 0));
      ctx.fillStyle = sg;
      ctx.fillRect(0, sy - 20, VW, 40);

      cardShell(x1, y0, w1, h, '01 / GLOBAL DAILY TOKENS');
      cardShell(x2, y0, w2, h, '02 / PER-CAPITA COMPUTE');

      /* ---- 卡片 1：大数字 + 条形图 ---- */
      const cp = easeOutQuad(clamp01((t - 2.45) / 1.5));
      const numStr = Math.round(cfg.token * (0.045 + 0.955 * cp)).toLocaleString('en-US');
      const nx = x1 + 14;
      if (cfg.glitch) {
        /* AI 生成视频的字符重影 / 毛刺 */
        const j1 = Math.sin(t * 23.7) * 1.8;
        const j2 = Math.cos(t * 31.3) * 1.5;
        const j3 = Math.sin(t * 13.1 + 2.2) * 1.1;
        ctx.save();
        ctx.font = '700 22px ' + MONO;
        ctx.textAlign = 'left';
        ctx.fillStyle = rgba('255,110,210', 0.34);
        ctx.fillText(numStr, nx + 3.0 + j1 * 0.8, numY + 0.9);
        ctx.fillStyle = rgba('110,235,255', 0.30);
        ctx.fillText(numStr, nx - 2.6 + j2 * 0.8, numY - 1.2);
        ctx.fillStyle = rgba(cfg.accent, 0.26);
        ctx.fillText(numStr, nx + j3 * 0.8, numY + 5.0);
        ctx.restore();
      }
      label(ctx, numStr, nx, numY, {
        mono: true, size: 22, weight: 700,
        color: 'rgba(242,247,255,.96)', glow: rgba(cfg.accent, 0.55), blur: 12,
      });
      label(ctx, '全球日均 Token 消耗量', nx, labY, { size: 10, color: 'rgba(255,255,255,.82)' });
      label(ctx, '▲ 1.02×10¹⁴ / DAY', x1 + w1 - 12, y0 + 14, {
        align: 'right', mono: true, size: 5.6, color: rgba(cfg.accent, 0.58), ls: 0.7,
      });

      /* 条形图 */
      const n = bars.length;
      const step = (w1 - 30) / n;
      const bwid = step * 0.64;
      for (let i = 0; i < n; i++) {
        const g = smooth(2.34 + i * 0.02, 3.3 + i * 0.02, t);
        if (g <= 0) continue;
        const bh2 = Math.max(1.2, bars[i] * (baseY - topY) * g);
        const bx = x1 + 15 + step * i + (step - bwid) / 2;
        const by = baseY - bh2;
        const gg = ctx.createLinearGradient(0, by, 0, baseY);
        gg.addColorStop(0, rgba(cfg.barTop, 0.98));
        gg.addColorStop(0.5, rgba(cfg.barBot, 0.88));
        gg.addColorStop(1, rgba(cfg.barBot, 0.34));
        ctx.fillStyle = gg;
        rr(ctx, bx, by, bwid, bh2, Math.min(2.6, bwid * 0.36));
        ctx.fill();
        /* 发光柱顶 */
        ctx.fillStyle = rgba(cfg.barTop, 0.95);
        ctx.shadowColor = rgba(cfg.barTop, 0.85);
        ctx.shadowBlur = 7;
        ctx.fillRect(bx, by, bwid, 1.4);
        ctx.shadowBlur = 0;
        /* 地面倒影 */
        ctx.fillStyle = rgba(cfg.barTop, 0.10 * g);
        ctx.fillRect(bx, baseY + 1, bwid, Math.min(7, bh2 * 0.09));
      }
      ctx.strokeStyle = 'rgba(255,255,255,.12)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x1 + 12, baseY + 0.5); ctx.lineTo(x1 + w1 - 12, baseY + 0.5); ctx.stroke();
      for (let k = 1; k <= 3; k++) {
        const yy = baseY - (baseY - topY) * k / 3.4;
        ctx.strokeStyle = 'rgba(255,255,255,.05)';
        ctx.setLineDash([2, 4]);
        ctx.beginPath(); ctx.moveTo(x1 + 12, yy); ctx.lineTo(x1 + w1 - 12, yy); ctx.stroke();
        ctx.setLineDash([]);
      }
      label(ctx, '2024', x1 + 18, baseY + 13, { mono: true, size: 5.4, color: 'rgba(255,255,255,.32)' });
      label(ctx, '2025', x1 + w1 / 2, baseY + 13, { mono: true, size: 5.4, align: 'center', color: 'rgba(255,255,255,.32)' });
      label(ctx, '2026', x1 + w1 - 18, baseY + 13, { mono: true, size: 5.4, align: 'right', color: 'rgba(255,255,255,.32)' });

      /* ---- 卡片 2：人均算力调用量（曲线） ---- */
      const c2x = x2 + 14;
      const cp2 = easeOutExpo(clamp01((t - 2.52) / 1.35));
      if (cfg.card2Big) {
        label(ctx, Math.round(5000 * cp2).toLocaleString('en-US') + '%', c2x, numY, {
          mono: true, size: cfg.card2Big, weight: 700,
          color: rgba(cfg.accent, 0.98), glow: rgba(cfg.accent, 0.75), blur: 14,
        });
        label(ctx, '人均算力调用量', c2x, labY, { size: 10, color: 'rgba(255,255,255,.82)' });
        label(ctx, '2024 — 2026', x2 + w2 - 14, labY, {
          mono: true, size: 5.4, align: 'right', color: 'rgba(255,255,255,.38)', ls: 0.6,
        });
      } else {
        label(ctx, '人均算力调用量', c2x, y0 + 34, { size: 10, color: 'rgba(255,255,255,.82)' });
        label(ctx, '2024 — 2026', x2 + w2 - 14, y0 + 34, {
          mono: true, size: 5.4, align: 'right', color: 'rgba(255,255,255,.38)', ls: 0.6,
        });
        label(ctx, '▲ ' + Math.round(4978 * cp2).toLocaleString('en-US') + '% / YOY', c2x, y0 + 52, {
          mono: true, size: 6, color: rgba(cfg.accent, 0.55), ls: 0.8,
        });
      }

      const px0 = c2x, px1 = x2 + w2 - 16;
      const py0 = y0 + 100, py1 = baseY;
      for (let k = 1; k <= 3; k++) {
        const yy = py1 - (py1 - py0) * k / 3.4;
        ctx.strokeStyle = 'rgba(255,255,255,.05)';
        ctx.setLineDash([2, 4]);
        ctx.beginPath(); ctx.moveTo(px0, yy); ctx.lineTo(px1, yy); ctx.stroke();
        ctx.setLineDash([]);
      }
      const prog = smooth(2.55, 4.0, t);
      if (prog > 0.001) {
        const N = 48;
        const pts = [];
        for (let i = 0; i <= N; i++) {
          const u = i / N;
          pts.push([px0 + (px1 - px0) * u, py1 - (py1 - py0) * (0.04 + 0.96 * Math.pow(u, 2.55))]);
        }
        ctx.save();
        ctx.beginPath();
        ctx.rect(px0 - 2, py0 - 10, (px1 - px0) * prog + 4, py1 - py0 + 20);
        ctx.clip();
        ctx.beginPath();
        ctx.moveTo(pts[0][0], py1);
        for (let i = 0; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
        ctx.lineTo(px1, py1);
        ctx.closePath();
        const ag = ctx.createLinearGradient(0, py0, 0, py1);
        ag.addColorStop(0, rgba(cfg.accent, 0.22));
        ag.addColorStop(1, rgba(cfg.accent, 0));
        ctx.fillStyle = ag;
        ctx.fill();

        ctx.beginPath();
        for (let i = 0; i < pts.length; i++) {
          if (i === 0) ctx.moveTo(pts[i][0], pts[i][1]);
          else ctx.lineTo(pts[i][0], pts[i][1]);
        }
        ctx.strokeStyle = rgba(cfg.accent, 0.95);
        ctx.lineWidth = 1.8;
        ctx.shadowColor = rgba(cfg.accent, 0.9);
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.restore();

        const u = clamp01(prog);
        const ex = px0 + (px1 - px0) * u;
        const ey = py1 - (py1 - py0) * (0.04 + 0.96 * Math.pow(u, 2.55));
        const pulse = 0.7 + 0.3 * Math.sin(t * 5);
        ctx.fillStyle = rgba(cfg.accent, 0.95);
        ctx.shadowColor = rgba(cfg.accent, 1);
        ctx.shadowBlur = 14 * pulse;
        ctx.beginPath(); ctx.arc(ex, ey, 2.4, 0, TAU); ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = rgba(cfg.accent, 0.35);
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(ex, ey, 4.6 + 2 * pulse, 0, TAU); ctx.stroke();
      }
      label(ctx, '2024', px0, py1 + 13, { mono: true, size: 5.4, color: 'rgba(255,255,255,.32)' });
      label(ctx, '2026', px1, py1 + 13, { mono: true, size: 5.4, align: 'right', color: 'rgba(255,255,255,.32)' });

      ctx.restore();
    }

    /* ---------- 段 C：垂直光柱 ---------- */
    function drawPillar(t) {
      const a = smooth(4.5, 5.05, t);
      if (a <= 0.002) return;
      ctx.save();
      ctx.globalAlpha = a;

      const cx = cfg.beamCx;
      const baseY = cfg.beamBase;
      const grow = easeOutCubic(clamp01((t - 4.55) / 1.25));
      const fullH = baseY - cfg.beamTop;
      const beamH = 18 + fullH * grow;
      const breathe = 0.9 + 0.1 * Math.sin((t - 4.6) * 2.4);
      const halfW = cfg.beamW / 2;

      /* 大范围氛围光 */
      let halo = ctx.createRadialGradient(cx, baseY - 34, 14, cx, baseY - 34, 280);
      halo.addColorStop(0, rgba(cfg.accent, 0.16 * breathe));
      halo.addColorStop(0.45, rgba(cfg.accent, 0.05 * breathe));
      halo.addColorStop(1, rgba(cfg.accent, 0));
      ctx.fillStyle = halo;
      ctx.fillRect(0, 0, VW, VH);

      /* 悬浮尘埃 */
      for (let i = 0; i < dust.length; i++) {
        const d = dust[i];
        const yy = ((d.y - t * d.rise) % VH + VH) % VH;
        const al = d.a * (0.32 + 0.32 * Math.sin(t * d.sp * 2 + d.ph));
        ctx.fillStyle = rgba('222,236,255', al);
        ctx.beginPath();
        ctx.arc(d.x + Math.sin(t * 0.3 + d.ph) * 3, yy, d.r, 0, TAU);
        ctx.fill();
      }

      /* 地面光晕 */
      ctx.save();
      ctx.translate(cx, baseY);
      ctx.scale(1, 0.26);
      const bg = ctx.createRadialGradient(0, 0, 2, 0, 0, 150);
      bg.addColorStop(0, rgba(cfg.accent, 0.60 * breathe));
      bg.addColorStop(0.35, rgba(cfg.accent, 0.18));
      bg.addColorStop(1, rgba(cfg.accent, 0));
      ctx.fillStyle = bg;
      ctx.beginPath(); ctx.arc(0, 0, 150, 0, TAU); ctx.fill();
      ctx.restore();

      /* 光柱：纵横分层渐变（近白核心 + 色调外晕 + 顶部淡出） */
      const BANDS = 12;
      const seg = beamH / BANDS;
      const layers = [
        { w: cfg.beamW * 4.6 + 30, a: 0.10, c: '236,246,255' },
        { w: cfg.beamW * 2.2 + 12, a: 0.24, c: '244,250,255' },
        { w: cfg.beamW, a: 1.0, c: '255,255,255' },
      ];
      for (let L = 0; L < layers.length; L++) {
        const hw = layers[L].w / 2;
        for (let k = 0; k < BANDS; k++) {
          const u = k / BANDS;
          const fa = Math.pow(Math.sin(Math.PI * clamp01(u * 0.94 + 0.03)), 0.65);
          const yy = baseY - beamH + seg * k;
          const hg = ctx.createLinearGradient(cx - hw, 0, cx + hw, 0);
          if (L === 2) {
            hg.addColorStop(0, rgba(cfg.accent, 0.10 * fa * breathe));
            hg.addColorStop(0.26, rgba(layers[L].c, 0.70 * fa * breathe));
            hg.addColorStop(0.5, rgba(layers[L].c, 0.98 * fa * breathe));
            hg.addColorStop(0.74, rgba(layers[L].c, 0.70 * fa * breathe));
            hg.addColorStop(1, rgba(cfg.accent, 0.10 * fa * breathe));
          } else {
            hg.addColorStop(0, rgba('255,255,255', 0));
            hg.addColorStop(0.5, rgba(layers[L].c, layers[L].a * fa * breathe));
            hg.addColorStop(1, rgba('255,255,255', 0));
          }
          ctx.fillStyle = hg;
          ctx.fillRect(cx - hw, yy, hw * 2, seg + 0.8);
        }
      }

      /* 核心亮线 */
      ctx.fillStyle = rgba('255,255,255', 0.92 * breathe);
      ctx.fillRect(cx - 0.7, baseY - beamH * 0.96, 1.4, beamH * 0.9);

      /* 光柱上的横纹 */
      for (let i = 0; i < 9; i++) {
        const u = (i + ((t * 2.4) % 1)) / 9;
        const yy = baseY - beamH * u;
        ctx.fillStyle = rgba('255,255,255', 0.13 * (1 - u) * breathe);
        ctx.fillRect(cx - halfW * 1.35, yy, cfg.beamW * 1.35, 0.8);
      }

      /* 地面光环 */
      const rings = cfg.key === 'l' ? 1 : 0.55;
      for (let i = 0; i < 3; i++) {
        const ph = ((t - 4.6) * 0.5 + i / 3) % 1;
        const rx = 22 + ph * 82;
        ctx.strokeStyle = rgba(cfg.accent, (1 - ph) * 0.5 * rings);
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.ellipse(cx, baseY + 2, rx, rx * 0.27, 0, 0, TAU);
        ctx.stroke();
      }
      ctx.strokeStyle = rgba('232,246,255', 0.34 * rings + 0.12);
      ctx.beginPath();
      ctx.ellipse(cx, baseY + 2, 30 + 3 * Math.sin(t * 3), 8.2 + 1.1 * Math.sin(t * 3), 0, 0, TAU);
      ctx.stroke();

      /* 飞散粒子 */
      for (let i = 0; i < sparks.length; i++) {
        const p = sparks[i];
        const life = clamp01((t - 4.68 - p.ph * 0.7) / 2.5);
        if (life <= 0 || life >= 1) continue;
        const r = p.r0 + life * (26 + p.spd);
        const ang = p.ang + life * 0.75;
        const x = cx + Math.cos(ang) * r;
        const y = baseY - 6 + Math.sin(ang) * r * 0.42 - life * p.up;
        ctx.fillStyle = rgba('235,248,255', (1 - life) * (1 - life) * 0.8);
        ctx.beginPath();
        ctx.arc(x, y, p.sz * (1 - life * 0.4), 0, TAU);
        ctx.fill();
      }

      /* 收尾文案（两版排版刻意不同，贴合原片两段 AI 视频的差异） */
      const tx = smooth(6.05, 6.65, t);
      if (tx > 0.001) {
        const rise = (1 - tx) * 14;
        ctx.save();
        ctx.globalAlpha = a * tx;
        if (cfg.key === 'l') {
          segs(ctx, 310, 272 + rise, [
            { s: '当算力像水电一样廉价，', f: '600 16.5px ' + SANS, c: 'rgba(236,242,250,.94)' },
          ]);
          segs(ctx, 310, 302 + rise, [
            { s: '你的 ', f: '700 20px ' + SANS, c: 'rgba(240,247,255,.96)' },
            { s: 'Agent', f: '800 21px ' + SANS, c: rgba(cfg.accent, 1), glow: rgba(cfg.accent, .9), blur: 15 },
            { s: ' 准备好了吗？', f: '700 20px ' + SANS, c: 'rgba(240,247,255,.96)' },
          ]);
        } else {
          segsLeft(ctx, 252, 122 + rise, [
            { s: '当算力像水电一样廉价，', f: '600 17px ' + SANS, c: 'rgba(238,245,252,.95)' },
          ]);
          segsLeft(ctx, 252, 158 + rise, [
            { s: '你的 ', f: '700 21px ' + SANS, c: 'rgba(242,248,255,.97)' },
            { s: 'Agent', f: '800 22px ' + SANS, c: rgba(cfg.accent, 1), glow: rgba(cfg.accent, .9), blur: 16 },
            { s: ' 准备好了吗？', f: '700 21px ' + SANS, c: 'rgba(242,248,255,.97)' },
          ]);
        }
        ctx.restore();
      }
      ctx.restore();
    }

    /* ---------- 段落切换的闪切 / 压缩损伤 ---------- */
    function drawCuts(t) {
      const wins = [[2.10, 2.30], [4.44, 4.64]];
      for (let w = 0; w < wins.length; w++) {
        const u = (t - wins[w][0]) / (wins[w][1] - wins[w][0]);
        if (u < 0 || u > 1) continue;
        const fade = Math.sin(Math.PI * u);
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        for (let i = 0; i < 6; i++) {
          const yy = 18 + ((i * 83 + 41) % 300);
          const h = 2 + ((i * 29 + 7) % 9);
          ctx.fillStyle = rgba(cfg.key === 'l' ? '205,170,255' : '150,232,255', 0.10 * fade);
          ctx.fillRect(0, yy, VW, h);
          ctx.fillStyle = 'rgba(255,255,255,' + (0.05 * fade).toFixed(3) + ')';
          ctx.fillRect(0, yy + h + 2, VW, 1);
        }
        ctx.fillStyle = 'rgba(255,255,255,' + (0.05 * fade).toFixed(3) + ')';
        ctx.fillRect(0, 0, VW, VH);
        ctx.restore();
      }
    }

    /* ---------- 待机画面（视频尚未开始/生成中） ---------- */
    function drawIdle(sceneLocal) {
      fit();
      ctx.clearRect(0, 0, VW, VH);
      backdrop(0.4);
      vignette();

      const dim = 0.82;
      ctx.save();
      ctx.globalAlpha = dim;

      /* 取景框 */
      ctx.strokeStyle = rgba(cfg.accent, 0.16);
      ctx.lineWidth = 1;
      ctx.strokeRect(224.5, 112.5, 172, 116);

      /* 旋转弧 */
      const rot = sceneLocal * 1.5;
      ctx.save();
      ctx.translate(310, 156);
      ctx.rotate(rot);
      ctx.strokeStyle = rgba(cfg.accent, 0.8);
      ctx.lineWidth = 1.8;
      ctx.lineCap = 'round';
      ctx.beginPath(); ctx.arc(0, 0, 21, 0, TAU * 0.32); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, 0, 21, TAU * 0.5, TAU * 0.72); ctx.stroke();
      ctx.restore();
      const pulse = 0.5 + 0.5 * Math.sin(sceneLocal * 3.4);
      ctx.fillStyle = rgba(cfg.accent, 0.25 + 0.5 * pulse);
      ctx.beginPath(); ctx.arc(310, 156, 2.4, 0, TAU); ctx.fill();

      label(ctx, 'GENERATING AI VIDEO', 310, 196, {
        mono: true, size: 6.2, align: 'center', ls: 2.2, color: rgba(cfg.accent, 0.6),
      });
      const dots = '.'.repeat(1 + Math.floor(sceneLocal * 2.2) % 3);
      label(ctx, 'STANDBY' + dots, 310, 210, {
        mono: true, size: 5.4, align: 'center', ls: 1.6, color: 'rgba(255,255,255,.30)',
      });

      /* 取景框四角 */
      ctx.strokeStyle = rgba(cfg.accent, 0.55);
      [[224, 112, 1, 1], [396, 112, -1, 1], [224, 228, 1, -1], [396, 228, -1, -1]].forEach(function (c) {
        ctx.beginPath();
        ctx.moveTo(c[0], c[1] + 9 * c[3]);
        ctx.lineTo(c[0], c[1]);
        ctx.lineTo(c[0] + 9 * c[2], c[1]);
        ctx.stroke();
      });
      ctx.restore();

      drawChrome(0, 'idle');
    }

    /* ---------- 总入口 ---------- */
    function draw(t) {
      fit();
      ctx.clearRect(0, 0, VW, VH);
      /* 轻微运镜（AI 视频的手持推拉感），纯由 t 决定 */
      const dr = cfg.key === 'l' ? 0 : 1.1;
      const z = 1.024 + 0.010 * Math.sin(t * 0.42 + dr);
      const panX = Math.sin(t * 0.31 + dr) * 2.6;
      const panY = Math.cos(t * 0.27 + dr) * 2.2;
      ctx.save();
      ctx.translate(VW / 2 + panX, VH * 0.52 + panY);
      ctx.scale(z, z);
      ctx.translate(-VW / 2, -VH * 0.52);
      backdrop(t);
      drawA(t);
      drawDashboard(t);
      drawPillar(t);
      drawCuts(t);
      ctx.restore();
      vignette();
      drawChrome(t, t < 2.2 ? 'a' : t < 4.6 ? 'b' : 'c');
    }

    return { draw: draw, drawIdle: drawIdle };
  }

  /* ============================================================
     SIDE 配置（左 Opus 5.5 紫 / 右 DeepSeek 青）
     ============================================================ */
  const SIDE_L = {
    key: 'l', seed: 1017,
    accent: '185,140,255', accent2: '122,134,246',
    barTop: '150,215,255', barBot: '120,80,225',
    tint: '122,84,255',
    token: 198880192031455,
    card1W: 306, card2W: 246, card2Big: 0,
    beamW: 7, beamCx: 310, beamBase: 236, beamTop: 58,
    glitch: true,
    label: 'OPUS 5.5',
  };
  const SIDE_R = {
    key: 'r', seed: 2026,
    accent: '79,228,255', accent2: '47,227,138',
    barTop: '150,245,255', barBot: '46,120,215',
    tint: '36,140,205',
    token: 100000000000000,
    card1W: 290, card2W: 266, card2Big: 25,
    beamW: 24, beamCx: 286, beamBase: 302, beamTop: 40,
    glitch: false,
    label: 'DEEPSEEK V4.1 FLASH 1017',
  };

  /* 提示词正文（打字机） */
  const PLINES = [
    { segs: [{ t: '请帮我写一段单文件 HTML 代码……' }] },
    { segs: [{ t: '制作一个 10 秒钟的科技新闻数据可视化演示视频……' }] },
    {
      segs: [
        { t: '【新闻主题】', hl: true },
        { t: '2026全球AI算力狂飙：人类日均 Token 消耗量突破100万亿大关……' },
      ],
    },
    { segs: [{ t: '【视觉与分镜要求（严格控制在 10 秒）】', hl: true }] },
  ];
  const LINE_TEXT = PLINES.map(function (L) { return L.segs.map(function (s) { return s.t; }).join(''); });
  const TYPE_TOTAL = LINE_TEXT.reduce(function (a, b) { return a + b.length; }, 0);
  const TYPE_START = 0.32;
  const TYPE_END = 1.94;

  function esc(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  /* ============================================================
     场景注册
     ============================================================ */
  Replica.registerScene({
    id: 'compare',
    title: '实测对比',
    start: 74.0,
    end: 86.0,
    build(root) {
      const MINI_START = 4.12;  // 场景内 mini 视频起点（窗口放大大致完成时）
      const MINI_DUR = 7.5;

      root.innerHTML = `
        <div class="bg bg-hex"></div>
        <div class="s9-bgglow"></div>
        <div class="s9-stage">
          <svg class="s9-wires" viewBox="0 0 1280 720" aria-hidden="true">
            <defs>
              <linearGradient id="s9Wl" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stop-color="#9CFFC8"/><stop offset="1" stop-color="#2FE38A"/>
              </linearGradient>
              <linearGradient id="s9Wr" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stop-color="#B98CFF"/><stop offset="1" stop-color="#7A86F4"/>
              </linearGradient>
              <filter id="s9Wglow" x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur stdDeviation="3.4"/>
              </filter>
            </defs>
            <path class="s9-wire s9-wire--l-glow" d="M 631 219 C 545 232 465 300 315 300" fill="none"
              stroke="#2FE38A" stroke-width="7" opacity=".55" filter="url(#s9Wglow)"/>
            <path class="s9-wire s9-wire--r-glow" d="M 631 219 C 720 232 800 300 882 300" fill="none"
              stroke="#7A86F4" stroke-width="7" opacity=".55" filter="url(#s9Wglow)"/>
            <path class="s9-wire s9-wire--l" d="M 631 219 C 545 232 465 300 315 300" fill="none"
              stroke="url(#s9Wl)" stroke-width="2.4" stroke-linecap="round"/>
            <path class="s9-wire s9-wire--r" d="M 631 219 C 720 232 800 300 882 300" fill="none"
              stroke="url(#s9Wr)" stroke-width="2.4" stroke-linecap="round"/>
            <circle class="s9-wdot s9-wdot--l" cx="315" cy="300" r="4.5" fill="#2FE38A"/>
            <circle class="s9-wdot s9-wdot--r" cx="882" cy="300" r="4.5" fill="#7A86F4"/>
          </svg>

          <div class="s9-prompt">
            <div class="s9-prompt-bar">
              <span class="win-dots"><i></i><i></i><i></i></span>
              <span class="s9-prompt-name">提示词 · prompt.md</span>
              <span class="s9-prompt-tag">PROMPT</span>
            </div>
            <div class="s9-prompt-body">
              ${PLINES.map(function (_, i) { return '<div class="s9-pline" data-line="' + i + '"></div>'; }).join('')}
            </div>
          </div>

          ${UI.win({ title: 'Opus 5.5', left: 84, top: 300, width: 462, height: 285, cls: 's9-win s9-win--l', body: '<canvas class="s9-canvas"></canvas>' })}
          ${UI.win({ title: 'DeepSeek V4.1 Flash 1017', left: 650, top: 300, width: 465, height: 285, cls: 's9-win s9-win--r', body: '<canvas class="s9-canvas"></canvas>' })}

          <div class="s9-vs"><span>VS</span></div>

          <div class="s9-title">同一份提示词<span class="s9-title-dot">·</span>两版同时播放</div>

          <div class="s9-pillwrap s9-pillwrap--l"><div class="s9-pill s9-pill--l"><i></i>Opus 5.5</div></div>
          <div class="s9-pillwrap s9-pillwrap--r"><div class="s9-pill s9-pill--r"><i></i>DeepSeek V4.1 Flash 1017</div></div>

          ${UI.stamp({ size: 74, rotate: -14, left: 982, top: 139, cls: 's9-stamp' })}
        </div>
        ${UI.avatar({ kind: 'host', size: 146, left: 1064, top: 118, cls: 's9-avatar' })}
      `;

      /* ---------------- 引用 ---------------- */
      const plineEls = Array.from(root.querySelectorAll('.s9-pline'));
      const canvasL = root.querySelector('.s9-win--l .s9-canvas');
      const canvasR = root.querySelector('.s9-win--r .s9-canvas');
      const rL = makeRenderer(canvasL, SIDE_L);
      const rR = makeRenderer(canvasR, SIDE_R);

      /* ---------------- 连接线 dash 长度 ---------------- */
      const wireL = root.querySelector('.s9-wire--l');
      const wireR = root.querySelector('.s9-wire--r');
      const wireLg = root.querySelector('.s9-wire--l-glow');
      const wireRg = root.querySelector('.s9-wire--r-glow');
      const dotL = root.querySelector('.s9-wdot--l');
      const dotR = root.querySelector('.s9-wdot--r');
      const lenL = wireL.getTotalLength();
      const lenR = wireR.getTotalLength();
      wireL.style.strokeDasharray = lenL + ' ' + (lenL + 4);
      wireLg.style.strokeDasharray = lenL + ' ' + (lenL + 4);
      wireR.style.strokeDasharray = lenR + ' ' + (lenR + 4);
      wireRg.style.strokeDasharray = lenR + ' ' + (lenR + 4);
      wireL.style.strokeDashoffset = (lenL + 3);
      wireLg.style.strokeDashoffset = (lenL + 3);
      wireR.style.strokeDashoffset = (lenR + 3);
      wireRg.style.strokeDashoffset = (lenR + 3);

      /* ============================================================
         GSAP 时间轴（paused，引擎 tl.time(local) 精确 seek）
         ============================================================ */
      const tl = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } });

      /* 0.0 提示词窗口滑入 */
      tl.fromTo('.s9-prompt', { opacity: 0, y: -66, scale: 0.975 },
        { opacity: 1, y: 0, scale: 1, duration: 0.58, ease: 'expo.out' }, 0.02);

      /* 1.0 两条连接线从卡片底部向左右分出 */
      tl.fromTo([wireL, wireLg], { strokeDashoffset: lenL + 3 },
        { strokeDashoffset: 0, duration: 0.85, ease: 'power2.inOut' }, 1.02);
      tl.fromTo([wireR, wireRg], { strokeDashoffset: lenR + 3 },
        { strokeDashoffset: 0, duration: 0.85, ease: 'power2.inOut' }, 1.16);
      tl.fromTo(dotL, { attr: { r: 0 }, opacity: 0 },
        { attr: { r: 4.5 }, opacity: 1, duration: 0.26, ease: 'back.out(3)' }, 1.7);
      tl.fromTo(dotR, { attr: { r: 0 }, opacity: 0 },
        { attr: { r: 4.5 }, opacity: 1, duration: 0.26, ease: 'back.out(3)' }, 1.84);

      /* 2.5 两个窗口从小尺寸滑入 */
      tl.fromTo('.s9-win--l', { opacity: 0, y: 150 }, { opacity: 1, y: 0, duration: 0.8, ease: 'expo.out' }, 2.46);
      tl.fromTo('.s9-win--r', { opacity: 0, y: 172 }, { opacity: 1, y: 0, duration: 0.8, ease: 'expo.out' }, 2.6);

      /* 3.1 VS 圆标弹入 */
      tl.fromTo('.s9-vs', { opacity: 0, scale: 0, rotate: -30 },
        { opacity: 1, scale: 1, rotate: 0, duration: 0.5, ease: 'back.out(2.4)' }, 3.1);
      tl.fromTo('.s9-vs', { boxShadow: '0 0 0 0 rgba(122,134,244,.5)' },
        { boxShadow: '0 0 0 24px rgba(122,134,244,0)', duration: 0.75, ease: 'power2.out' }, 3.26);

      /* 3.5 提示词卡与连接线退出 */
      tl.to('.s9-prompt', { opacity: 0, y: -54, scale: 0.98, duration: 0.4, ease: 'power2.in' }, 3.5);
      tl.to('.s9-wires', { opacity: 0, duration: 0.3, ease: 'power1.in' }, 3.52);

      /* 3.58 两个窗口放大到全屏宽度 */
      tl.to('.s9-win--l', { left: 13, top: 166, width: 621, height: 379, duration: 0.8, ease: 'power2.inOut' }, 3.58);
      tl.to('.s9-win--r', { left: 646, top: 166, width: 621, height: 379, duration: 0.8, ease: 'power2.inOut' }, 3.58);
      tl.to('.s9-vs', { opacity: 0, scale: 0.6, duration: 0.3, ease: 'power2.in' }, 3.6);

      /* 4.08 顶部标题 */
      tl.fromTo('.s9-title', { opacity: 0, y: 20, filter: 'blur(12px)' },
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.55, ease: 'power3.out' }, 4.08);

      /* 4.16 两个发光胶囊 */
      tl.fromTo('.s9-pill--l', { opacity: 0, y: 24, scale: 0.86 },
        { opacity: 1, y: 0, scale: 1, duration: 0.44, ease: 'back.out(2.2)' }, 4.16);
      tl.fromTo('.s9-pill--r', { opacity: 0, y: 24, scale: 0.86 },
        { opacity: 1, y: 0, scale: 1, duration: 0.44, ease: 'back.out(2.2)' }, 4.26);

      /* 4.34 右上 1017 印章砸入 */
      tl.fromTo('.s9-stamp', { opacity: 0, scale: 1.9, rotate: -46 },
        { opacity: 0.95, scale: 1, rotate: -14, duration: 0.34, ease: 'power4.in' }, 4.34);
      tl.to('.s9-stamp', { scale: 1.06, duration: 0.1, ease: 'power1.out' }, 4.68);
      tl.to('.s9-stamp', { scale: 1, duration: 0.3, ease: 'back.out(2)' }, 4.78);

      /* 头像：常驻（host 摄像头层，从场景第一帧就在） */
      tl.fromTo('.s9-avatar', { scale: 0.985 }, { scale: 1, duration: 0.9, ease: 'expo.out' }, 0);
      tl.to('.s9-avatar', { y: 8, duration: 2.8, ease: 'sine.inOut', yoyo: true, repeat: -1 }, 1.4);

      /* 背景呼吸 */
      tl.fromTo('.s9-bgglow', { opacity: 0.7 }, { opacity: 1, duration: 2.2, ease: 'sine.inOut', yoyo: true, repeat: -1 }, 3.6);

      /* ============================================================
         update：打字机 + 两个 canvas 纯函数重绘
         ============================================================ */
      let lastBlink = null;
      let lastLineState = [];

      function buildLineHtml(line, typed, active, blink) {
        let html = '';
        let left = typed;
        for (let i = 0; i < line.segs.length; i++) {
          if (left <= 0) break;
          const s = line.segs[i];
          const take = Math.min(left, s.t.length);
          const part = esc(s.t.slice(0, take));
          html += s.hl ? '<em class="s9-hl">' + part + '</em>' : part;
          left -= take;
        }
        if (active) html += '<span class="s9-caret" style="opacity:' + (blink ? 0.9 : 0.12) + '"></span>';
        return html;
      }

      function updatePrompt(local) {
        const prog = clamp01((local - TYPE_START) / (TYPE_END - TYPE_START));
        const n = Math.round(prog * TYPE_TOTAL);
        const blink = (Math.floor(local * 3.4) % 2) === 0;

        let acc = 0;
        let activeIdx = -1;
        for (let i = 0; i < LINE_TEXT.length; i++) {
          if (n < acc + LINE_TEXT[i].length) { activeIdx = i; break; }
          acc += LINE_TEXT[i].length;
        }

        let acc2 = 0;
        for (let i = 0; i < PLINES.length; i++) {
          const typed = Math.max(0, Math.min(LINE_TEXT[i].length, n - acc2));
          const active = i === activeIdx;
          acc2 += LINE_TEXT[i].length;
          const state = typed + '|' + (active ? 1 : 0);
          if (lastLineState[i] === state) {
            if (active && blink !== lastBlink) {
              const c = plineEls[i].querySelector('.s9-caret');
              if (c) c.style.opacity = blink ? 0.9 : 0.12;
            }
            continue;
          }
          lastLineState[i] = state;
          plineEls[i].innerHTML = buildLineHtml(PLINES[i], typed, active, blink);
        }
        lastBlink = blink;
      }

      function update(local) {
        updatePrompt(local);
        const mt = local - MINI_START;
        if (mt < 0) {
          rL.drawIdle(local);
          rR.drawIdle(local);
        } else {
          const tt = Math.min(MINI_DUR, mt);
          rL.draw(tt);
          rR.draw(tt);
        }
      }

      return { timeline: tl, update: update };
    },
  });
})();
