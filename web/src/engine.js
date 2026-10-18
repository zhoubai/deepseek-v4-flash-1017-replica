/* ============================================================
   ENGINE — 时间轴 / 场景调度 / 字幕 / 渲染模式
   坐标系：1280 x 720；场景按 start/end（秒）顺序排列。
   场景 build(root) 返回 { timeline?: gsap.timeline, update?(local, info) }
   引擎每帧只做：切换 active、tl.time(local)、update(local)
   → 完全可 seek / 可逐帧渲染，无真实时钟依赖。
   ============================================================ */
(function () {
  'use strict';

  const R = (window.Replica = {
    scenes: [],
    captions: {},       // sceneId -> [{ start, end, html }]
    events: {},
    time: 0,
    playing: false,
    speed: 1,
    duration: 0,
    ready: false,
    PREROLL: 0.50,      // 场景切入时把动画提前 0.35s，避免硬切先看到空背景
    _scene: null,       // 当前场景
    _cap: null,         // 当前字幕 node
    _capKey: '',
  });

  /* ---------------- 事件 ---------------- */
  R.on = function (name, fn) {
    (R.events[name] || (R.events[name] = [])).push(fn);
  };
  R.emit = function (name, payload) {
    (R.events[name] || []).forEach(function (fn) { try { fn(payload); } catch (e) { console.error(e); } });
  };

  /* ---------------- 注册 ---------------- */
  R.registerScene = function (def) {
    if (!def || !def.id) throw new Error('scene needs id');
    if (typeof def.start !== 'number' || typeof def.end !== 'number') throw new Error('scene ' + def.id + ' needs start/end');
    if (R.scenes.some(function (s) { return s.id === def.id; })) {
      console.warn('duplicate scene id', def.id);
    }
    def.build = def.build || function () { return {}; };
    R.scenes.push(def);
  };
  R.setCaptions = function (map) {
    Object.assign(R.captions, map || {});
  };

  /* ---------------- 初始化 ---------------- */
  R.init = function () {
    R.scenes.sort(function (a, b) { return a.start - b.start; });
    R.duration = R.scenes.reduce(function (m, s) { return Math.max(m, s.end); }, 0);
    R.stage = document.getElementById('scene-layer');
    R.capLayer = document.getElementById('caption-layer');
    R.capEl = document.getElementById('caption');

    R.scenes.forEach(function (def, i) {
      const root = document.createElement('div');
      root.className = 'scene scene--' + def.id;
      root.dataset.scene = def.id;
      if (def.className) root.className += ' ' + def.className;
      R.stage.appendChild(root);
      def._root = root;
      def._index = i;
      try {
        // gsap.context 把场景内的选择器作用域限定在 root 内，避免跨场景类名冲突
        def._ctx = gsap.context(function () {
          def._ctl = def.build(root) || {};
        }, root);
      } catch (e) {
        console.error('scene build failed:', def.id, e);
        def._ctl = {};
      }
      if (def._ctl.timeline) {
        def._ctl.timeline.pause();
        // 先走到末尾再回到 0：强制所有 from/fromTo 的起始状态真正渲染出来，
        // 否则场景切进来的第一帧会闪一下「终点态」（GSAP 惰性初始化导致）。
        def._ctl.timeline.progress(1);
        def._ctl.timeline.progress(0);
      }
      def._active = false;
    });

    R.seek(0);
    R.ready = true;
    R.emit('ready', R);
  };

  /* ---------------- 定位 ---------------- */
  R.sceneAt = function (t) {
    for (let i = R.scenes.length - 1; i >= 0; i--) {
      if (t >= R.scenes[i].start) return R.scenes[i];
    }
    return R.scenes[0];
  };

  R.seek = function (t) {
    t = Math.max(0, Math.min(R.duration, t));
    R.time = t;
    const cur = R.sceneAt(t);
    if (cur !== R._scene) {
      R._scene = cur;
      R.emit('scene', cur);
    }
    R.scenes.forEach(function (def) {
      const active = t >= def.start && t < def.end;
      const last = R.scenes[R.scenes.length - 1] === def;
      const isActive = active || (last && t >= def.end);
      if (isActive !== def._active) {
        def._active = isActive;
        def._root.classList.toggle('is-active', isActive);
      }
      if (isActive) {
        const len = def.end - def.start;
        const localRaw = Math.max(0, Math.min(len, t - def.start));
        // 视觉提前量：让硬切后第一帧就已经是「入场中」状态，而不是空背景
        const local = Math.min(len, localRaw + R.PREROLL);
        const ctl = def._ctl || {};
        try {
          if (ctl.timeline) ctl.timeline.time(local);
          if (ctl.update) ctl.update(local, { active: active });
        } catch (e) {
          console.error('scene update failed:', def.id, e);
        }
        R._renderCaption(def.id, active ? localRaw : len, active);
      }
    });
    R._updateHud(t);
    R.emit('time', t);
  };

  /* ---------------- 字幕 ---------------- */
  R._renderCaption = function (sceneId, local, active) {
    const list = R.captions[sceneId] || [];
    let hit = null;
    if (active) {
      for (let i = 0; i < list.length; i++) {
        if (local >= list[i].start && local < list[i].end) { hit = list[i]; break; }
      }
    }
    const key = hit ? sceneId + '@' + hit.start + ':' + hit.html : '';
    if (key === R._capKey) return;
    R._capKey = key;
    if (!hit) {
      R.capEl.classList.remove('is-on');
      return;
    }
    R.capEl.innerHTML = hit.html;
    R.capEl.classList.add('is-on');
  };

  /* ---------------- 播放 ---------------- */
  R._last = 0;
  R.play = function () {
    if (R.playing) return;
    if (R.time >= R.duration - 0.02) R.seek(0);
    R.playing = true;
    R._last = performance.now();
    R.emit('play', true);
    requestAnimationFrame(R._tick);
  };
  R.pause = function () {
    if (!R.playing) return;
    R.playing = false;
    R.emit('play', false);
  };
  R.toggle = function () { R.playing ? R.pause() : R.play(); };
  R._tick = function (now) {
    if (!R.playing) return;
    const dt = Math.min(0.1, (now - R._last) / 1000) * R.speed;
    R._last = now;
    let t = R.time + dt;
    if (t >= R.duration) {
      R.seek(R.duration);
      R.playing = false;
      R.emit('play', false);
      R.emit('end', R);
      return;
    }
    R.seek(t);
    if (R.playing) requestAnimationFrame(R._tick);
  };

  /* ---------------- HUD ---------------- */
  R._updateHud = function (t) {
    const hud = document.getElementById('hud');
    if (!hud) return;
    const fill = hud.querySelector('.track-fill');
    const head = hud.querySelector('.track-head');
    const timeEl = hud.querySelector('.time');
    const pct = R.duration ? (t / R.duration) * 100 : 0;
    if (fill) fill.style.width = pct + '%';
    if (head) head.style.left = pct + '%';
    if (timeEl) timeEl.textContent = fmt(t) + ' / ' + fmt(R.duration);
  };
  function fmt(s) {
    s = Math.max(0, s);
    const m = Math.floor(s / 60);
    const ss = Math.floor(s % 60);
    return (m < 10 ? '0' : '') + m + ':' + (ss < 10 ? '0' : '') + ss;
  }

  R.chapterAt = function (t) { return R.sceneAt(t); };
  window.fmtTime = fmt;
})();
