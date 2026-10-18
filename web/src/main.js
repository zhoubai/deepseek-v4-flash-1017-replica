/* ============================================================
   MAIN — 舞台缩放 / HUD / 启动层 / 原片对照 / 键盘
   ============================================================ */
(function () {
  'use strict';

  const R = window.Replica;
  const params = new URLSearchParams(location.search);
  const RENDER = params.get('render') === '1';

  // 场景 → 原片起始秒（按原片实际内容边界核对过：search 48.0 / tested 60.0 / compare 68.5 / finale 87.6）
  const sceneSourceStart = {
    weekend: 0, today: 6, release: 9, naming: 16.5, bench: 24.0, chart: 30.0,
    news: 35.5, search: 48.0, tested: 60.0, compare: 68.5, finale: 87.6,
  };

  /* ---------------- 舞台缩放 ---------------- */
  const stage = document.getElementById('stage');
  function fit() {
    if (RENDER) {
      document.documentElement.style.setProperty('--stage-scale', 1);
      stage.style.left = '0px';
      stage.style.top = '0px';
      stage.style.margin = '0';
      stage.style.transform = 'none';
      stage.style.boxShadow = 'none';
      return;
    }
    const s = Math.min(window.innerWidth / 1280, window.innerHeight / 720);
    stage.style.transform = 'scale(' + s + ')';
  }
  window.addEventListener('resize', fit);

  /* ---------------- 渲染模式 ---------------- */
  if (RENDER) {
    document.body.classList.add('is-render');
    document.getElementById('hud').style.display = 'none';
    document.getElementById('topbar').style.display = 'none';
    document.getElementById('boot').style.display = 'none';
    document.getElementById('end').style.display = 'none';
  }

  /* ---------------- 启动 ---------------- */
  function boot() {
    fit();
    R.init();
    buildHud();
    bindKeyboard();
    buildPip();
    if (RENDER) {
      const t = parseFloat(params.get('t') || '0');
      R.seek(isFinite(t) ? t : 0);
      window.__replica = R;
      return;
    }
    const startAt = params.get('t');
    if (startAt) {
      R.seek(parseFloat(startAt) || 0);
      document.getElementById('boot').classList.add('is-gone');
    }
    requestAnimationFrame(() => document.body.classList.add('is-ready'));
  }

  const fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  fontsReady.then(() => setTimeout(boot, 60));

  /* ---------------- HUD ---------------- */
  function buildHud() {
    const hud = document.getElementById('hud');
    const track = hud.querySelector('.track');
    const playBtn = hud.querySelector('[data-act="play"]');
    const speedBtn = hud.querySelector('[data-act="speed"]');
    const pipBtn = hud.querySelector('[data-act="pip"]');
    const replayBtn = hud.querySelector('[data-act="replay"]');
    const fsBtn = hud.querySelector('[data-act="fs"]');
    const chapterLabel = hud.querySelector('.track-label');

    /* 分段 */
    const segs = hud.querySelector('.track-segs');
    R.scenes.forEach((s) => {
      const i = document.createElement('i');
      i.className = 'track-seg';
      i.style.left = (s.start / R.duration) * 100 + '%';
      i.title = s.title;
      segs.appendChild(i);
    });

    /* 播放 */
    playBtn.addEventListener('click', () => { R.toggle(); });
    R.on('play', (playing) => {
      playBtn.innerHTML = playing
        ? '<svg width="13" height="13" viewBox="0 0 16 16"><rect x="3" y="2" width="3.6" height="12" rx="1.2" fill="currentColor"/><rect x="9.4" y="2" width="3.6" height="12" rx="1.2" fill="currentColor"/></svg>'
        : '<svg width="13" height="13" viewBox="0 0 16 16"><path d="M4 2.6c0-.9 1-1.4 1.7-.9l8 5.4c.7.5.7 1.4 0 1.8l-8 5.4c-.7.5-1.7 0-1.7-.9V2.6z" fill="currentColor"/></svg>';
    });

    /* 进度条 seek */
    let dragging = false;
    function seekFromEvent(e) {
      const r = track.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
      R.seek(x * R.duration);
    }
    track.addEventListener('pointerdown', (e) => { dragging = true; track.setPointerCapture(e.pointerId); seekFromEvent(e); });
    track.addEventListener('pointermove', (e) => { if (dragging) seekFromEvent(e); if (e.buttons === 0) dragging = false; });
    track.addEventListener('pointerup', () => { dragging = false; });
    track.addEventListener('pointermove', (e) => {
      const r = track.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
      const t = x * R.duration;
      const sc = R.sceneAt(t);
      chapterLabel.textContent = sc ? sc.title + ' · ' + window.fmtTime(sc.start) : '';
    });
    track.addEventListener('pointerleave', () => { chapterLabel.textContent = ''; });

    /* 速度 */
    const speeds = [1, 1.25, 1.5, 2];
    let si = 0;
    speedBtn.addEventListener('click', () => {
      si = (si + 1) % speeds.length;
      R.speed = speeds[si];
      speedBtn.textContent = R.speed + '×';
    });

    /* 原片对照 */
    pipBtn.addEventListener('click', () => togglePip());

    /* 重播 */
    replayBtn.addEventListener('click', () => {
      hideEnd();
      R.seek(0); R.play();
    });

    /* 全屏 */
    fsBtn.addEventListener('click', () => {
      if (document.fullscreenElement) document.exitFullscreen();
      else document.documentElement.requestFullscreen().catch(() => {});
    });

    /* 结束 */
    R.on('end', showEnd);

    /* 场景切换时同步 PIP */
    R.on('scene', (sc) => syncPip(sc.id));
  }

  /* ---------------- 启动层 ---------------- */
  const bootEl = document.getElementById('boot');
  if (bootEl) {
    bootEl.querySelector('.boot-play').addEventListener('click', () => {
      bootEl.classList.add('is-gone');
      R.play();
    });
  }

  /* ---------------- 结尾 ---------------- */
  const endEl = document.getElementById('end');
  function showEnd() {
    if (RENDER || !endEl) return;
    endEl.classList.add('is-on');
  }
  function hideEnd() { if (endEl) endEl.classList.remove('is-on'); }
  if (endEl) {
    endEl.querySelector('[data-act="replay"]').addEventListener('click', () => { hideEnd(); R.seek(0); R.play(); });
    endEl.querySelector('[data-act="close"]').addEventListener('click', hideEnd);
    const wrap = endEl.querySelector('.chapters');
    R.scenes.forEach((s) => {
      const b = document.createElement('button');
      b.textContent = window.fmtTime(s.start) + ' ' + s.title;
      b.addEventListener('click', () => { hideEnd(); R.seek(s.start + 0.01); R.play(); });
      wrap.appendChild(b);
    });
  }

  /* ---------------- 原片对照 PIP ---------------- */
  const pipEl = document.getElementById('pip');
  const pipVideo = pipEl ? pipEl.querySelector('video') : null;
  let pipOn = false;
  let pipMuted = true;

  function buildPip() {
    if (!pipEl) return;
    pipEl.querySelector('[data-act="mute"]').addEventListener('click', (e) => {
      pipMuted = !pipMuted;
      pipVideo.muted = pipMuted;
      e.currentTarget.classList.toggle('is-on', !pipMuted);
      e.currentTarget.textContent = pipMuted ? '原声 关' : '原声 开';
    });
    pipEl.querySelector('[data-act="close"]').addEventListener('click', () => togglePip(false));
  }
  function togglePip(force) {
    pipOn = typeof force === 'boolean' ? force : !pipOn;
    pipEl.classList.toggle('is-on', pipOn);
    const btn = document.querySelector('#hud [data-act="pip"]');
    if (btn) btn.classList.toggle('is-on', pipOn);
    if (pipOn) {
      syncPip(R._scene ? R._scene.id : 'weekend');
      pipVideo.play().catch(() => {});
    } else {
      pipVideo.pause();
    }
  }
  function syncPip(id) {
    if (!pipOn || !pipVideo) return;
    const st = sceneSourceStart[id];
    if (st == null) return;
    try { pipVideo.currentTime = st + 0.05; } catch (e) {}
    pipVideo.play().catch(() => {});
  }

  /* ---------------- 键盘 ---------------- */
  function bindKeyboard() {
    if (RENDER) return;
    window.addEventListener('keydown', (e) => {
      if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName)) return;
      switch (e.code) {
        case 'Space': e.preventDefault(); R.toggle(); break;
        case 'ArrowRight': R.seek(R.time + (e.shiftKey ? 5 : 2)); break;
        case 'ArrowLeft': R.seek(R.time - (e.shiftKey ? 5 : 2)); break;
        case 'Home': R.seek(0); break;
        case 'End': R.seek(R.duration - 0.05); break;
        case 'KeyF':
          if (document.fullscreenElement) document.exitFullscreen();
          else document.documentElement.requestFullscreen().catch(() => {});
          break;
        case 'KeyP': togglePip(); break;
        case 'KeyH':
          document.getElementById('hud').classList.toggle('is-hidden');
          document.getElementById('topbar').classList.toggle('is-hidden');
          break;
      }
    });
    /* 点击舞台：播放/暂停 */
    document.getElementById('stage').addEventListener('click', (e) => {
      if (e.target.closest('.avatar')) return;
      R.toggle();
    });
  }

  /* ---------------- 画中画同步定时器（原片跑飞后兜底） ---------------- */
  setInterval(() => {
    if (!pipOn || !pipVideo) return;
    if (R.playing && pipVideo.paused) pipVideo.play().catch(() => {});
    if (!R.playing && !pipVideo.paused) pipVideo.pause();
  }, 800);
})();
