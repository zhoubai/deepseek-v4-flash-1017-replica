/* ============================================================
   SCENE 06-news — 许愿式编程（44.0 → 57.5s）
   官方新闻条 / 巨型描边贴纸 / DeepSeek 聊天窗（打字 + 生成进度）
   ============================================================ */
Replica.registerScene({
  id: 'news',
  title: '许愿式编程',
  start: 44.0,
  end: 57.5,
  build(root) {
    /* ---------------- 大脑图标 ---------------- */
    const brainSvg = `
      <svg class="s6-brain-svg" viewBox="0 0 120 120" fill="none">
        <circle cx="60" cy="60" r="52" stroke="#233B2B" stroke-width="5"/>
        <g stroke="#233B2B" stroke-width="5.6" fill="#FBF8EC" stroke-linecap="round" stroke-linejoin="round">
          <path d="M60 31c-6-5-16-5-19 2-7-1-13 5-11 12-6 3-6 12-1 15-4 7 2 14 9 13 3 6 13 7 22 3z"/>
          <path d="M60 31c6-5 16-5 19 2 7-1 13 5 11 12 6 3 6 12 1 15 4 7-2 14-9 13-3 6-13 7-22 3z"/>
        </g>
        <g stroke="#233B2B" stroke-width="5.6" stroke-linecap="round" fill="none">
          <path d="M60 33v50"/>
          <path d="M60 62c-3-6-9-9-14-8"/>
          <path d="M60 62c3-6 9-9 14-8"/>
        </g>
      </svg>`;

    /* ---------------- 聊天窗 body ---------------- */
    const chatBody = `
      <div class="s6-greet">
        <i class="s6-whale"><img src="assets/scenes/paper/ds-whale.png" alt=""></i>
        <b>有什么可以帮你？</b>
      </div>
      <div class="s6-gen">
        <i class="s6-spin"></i><span>正在生成…</span>
      </div>
      <div class="s6-prog"><i></i></div>
      <div class="s6-pct">0%</div>
      <div class="s6-done">✓ 已完成</div>
      <div class="s6-input">
        <span class="s6-typed"></span><i class="s6-caret"></i>
        <span class="s6-send">
          <svg width="17" height="18" viewBox="0 0 17 18"><path d="M8.5 2.2 15.4 15.3c.3.6-.2 1.3-.9 1.2L8.5 15l-6 .9c-.7.1-1.2-.6-.9-1.2L8.5 2.2z" fill="#fff"/></svg>
        </span>
      </div>`;

    root.innerHTML = `
      <div class="bg bg-paper"></div>
      <div class="s6-tint"></div>
      <div class="s6-cam">
        <!-- 大脑 + 思考气泡 -->
        <div class="s6-brain">${brainSvg}</div>
        <i class="s6-bub s6-bub--1"></i>
        <i class="s6-bub s6-bub--2"></i>

        <!-- 官方新闻条 -->
        <div class="s6-bar-wrap">
          <div class="s6-bar">
            <div class="s6-bar-meta">DeepSeek 官方新闻 · 2026/10/17</div>
            <div class="s6-bar-title">DeepSeek V4.1 Flash 新版本：<span class="s6-mark"><i></i>许愿式编程</span>一键成真</div>
          </div>
          ${UI.stamp({ size: 124, ink: 'indigo', rotate: -14, left: 833, top: 46, cls: 's6-stamp' })}
        </div>

        <!-- 巨型贴纸：许愿式编程 -->
        <div class="s6-giant">${UI.sticker('许愿式编程', { size: 108, sw: 13, fill: 'var(--cream)', stroke: 'var(--paper-ink)', rotate: -2.2, cls: 's6-giant-st' })}</div>

        <!-- 聊天窗 -->
        ${UI.win({
          title: 'DeepSeek',
          tone: 'light',
          left: 588, top: 331, width: 398, height: 257,
          body: chatBody,
          cls: 's6-chat',
        })}

        <!-- 丢给它 -->
        <div class="s6-diu">${UI.sticker('丢给它', { size: 56, sw: 6.4, fill: 'var(--cream)', stroke: '#233B2B', rotate: -5, cls: 's6-diu-st' })}</div>

        <!-- 右上角 host 头像 -->
        ${UI.avatar({ kind: 'host', size: 154, left: 1035, top: 104, cls: 's6-avatar' })}
      </div>`;

    /* ---------------- 引用 ---------------- */
    const typedEl = root.querySelector('.s6-typed');
    const genEl = root.querySelector('.s6-gen');
    const doneEl = root.querySelector('.s6-done');
    const progEl = root.querySelector('.s6-prog');
    const progFill = root.querySelector('.s6-prog > i');
    const pctEl = root.querySelector('.s6-pct');
    const spinEl = root.querySelector('.s6-spin');
    const inputEl = root.querySelector('.s6-input');

    /* ---------------- 打字节拍 ----------------
       4.45 开始 → 5.32 打出「想要」→ 5.90 续打 → 7.60 打满 */
    const TYPED = '想要一个 10 秒的科技新闻视频';
    const TYPE_A = 4.45;
    const TYPE_B = 5.32;
    const TYPE_C = 5.90;
    const TYPE_D = 7.60;
    function typeCount(t) {
      const n = TYPED.length;
      if (t <= TYPE_A) return 0;
      if (t < TYPE_B) return Math.min(2, Math.round(((t - TYPE_A) / (TYPE_B - TYPE_A)) * 2));
      if (t < TYPE_C) return 2;
      if (t < TYPE_D) return Math.min(n, 2 + Math.round(((t - TYPE_C) / (TYPE_D - TYPE_C)) * (n - 2)));
      return n;
    }

    /* 生成进度：9.55 → 11.15 走满 */
    const PROG_A = 9.55;
    const PROG_B = 11.15;
    function progPct(t) {
      if (t <= PROG_A) return 0;
      if (t >= PROG_B) return 100;
      return Math.round(((t - PROG_A) / (PROG_B - PROG_A)) * 100);
    }

    const tl = gsap.timeline({ paused: true });

    /* ---------- 0.0 新闻条从上方带弹跳落下 ---------- */
    tl.fromTo('.s6-bar-wrap', { y: -66 }, { y: 0, duration: 0.66, ease: 'back.out(1.5)' }, 0);
    tl.fromTo('.s6-bar', { opacity: 0.25 }, { opacity: 1, duration: 0.3 }, 0);
    tl.fromTo('.s6-bar-meta, .s6-bar-title', { opacity: 0, y: 14 },
      { opacity: 1, y: 0, duration: 0.42, stagger: 0.08, ease: 'power2.out' }, 0.22);

    /* ---------- 0.7 印章砸下 ---------- */
    tl.fromTo('.s6-stamp',
      { opacity: 0, scale: 1.95, rotate: -42 },
      { opacity: 0.94, scale: 1, rotate: -14, duration: 0.34, ease: 'power4.in' }, 0.7);
    tl.to('.s6-stamp', { scale: 1.05, duration: 0.14, ease: 'power1.out' }, 1.04);
    tl.to('.s6-stamp', { scale: 1, duration: 0.34, ease: 'power2.out' }, 1.18);

    /* ---------- 0.3 头像 ---------- */
    tl.fromTo('.s6-avatar',
      { opacity: 0, scale: 0.84, y: -12 },
      { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: 'back.out(1.6)' }, 0.3);
    tl.fromTo('.s6-avatar', { y: 0 }, { y: 5, duration: 2.3, ease: 'sine.inOut', yoyo: true, repeat: -1 }, 1.1);

    /* ---------- 1.95 巨型贴纸砸下 ---------- */
    tl.fromTo('.s6-giant',
      { opacity: 0, scale: 1.7, rotate: 7, y: -54, x: -20 },
      { opacity: 1, scale: 1, rotate: 0, y: 0, x: 0, duration: 0.52, ease: 'back.out(1.8)' }, 1.95);
    tl.to('.s6-giant', { scale: 1.018, duration: 0.16, ease: 'power1.out' }, 2.42);
    tl.to('.s6-giant', { scale: 1, duration: 0.3, ease: 'power2.out' }, 2.58);
    tl.fromTo('.s6-giant-st', { rotate: 4.5 }, { rotate: -2.2, duration: 0.62, ease: 'power2.out' }, 2.0);

    /* ---------- 2.3 新闻条金色高亮 ---------- */
    tl.fromTo('.s6-mark > i',
      { scaleX: 0, opacity: 0 },
      { scaleX: 1, opacity: 1, duration: 0.5, ease: 'expo.out' }, 2.32);
    tl.fromTo('.s6-mark', { color: '#1A231C' }, { color: '#97261A', duration: 0.4 }, 2.42);

    /* ---------- 3.2 聊天窗弹出 ---------- */
    tl.fromTo('.s6-chat',
      { opacity: 0, scale: 0.84, y: 52, rotate: -1.6 },
      { opacity: 1, scale: 1, y: 0, rotate: 0, duration: 0.56, ease: 'back.out(1.5)' }, 3.2);
    tl.fromTo('.s6-greet', { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.4 }, 3.5);
    tl.fromTo('.s6-input', { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.4 }, 3.68);
    tl.fromTo('.s6-caret', { opacity: 1 }, { opacity: 0, duration: 0.46, ease: 'steps(1)', yoyo: true, repeat: -1 }, 4.2);

    /* ---------- 7.1 大脑 + 气泡 ---------- */
    tl.fromTo('.s6-brain',
      { opacity: 0, scale: 0.6, y: 20, rotate: -8 },
      { opacity: 1, scale: 1, y: 0, rotate: 0, duration: 0.5, ease: 'back.out(2)' }, 7.1);
    tl.fromTo('.s6-bub--1', { opacity: 0, scale: 0 }, { opacity: 1, scale: 1, duration: 0.34, ease: 'back.out(2.2)' }, 7.34);
    tl.fromTo('.s6-bub--2', { opacity: 0, scale: 0 }, { opacity: 1, scale: 1, duration: 0.3, ease: 'back.out(2.2)' }, 7.46);
    tl.fromTo('.s6-brain', { y: 0 }, { y: -5, duration: 2.1, ease: 'sine.inOut', yoyo: true, repeat: -1 }, 8.2);

    /* ---------- 8.9 丢给它 贴纸砸下 ---------- */
    tl.fromTo('.s6-diu',
      { opacity: 0, scale: 1.9, rotate: 12, y: -40 },
      { opacity: 1, scale: 1, rotate: 0, y: 0, duration: 0.34, ease: 'power4.in' }, 8.9);
    tl.to('.s6-diu', { scale: 1.06, duration: 0.14, ease: 'power1.out' }, 9.24);
    tl.to('.s6-diu', { scale: 1, duration: 0.32, ease: 'power2.out' }, 9.38);
    tl.fromTo('.s6-diu-st', { rotate: 9 }, { rotate: -5, duration: 0.5, ease: 'power2.out' }, 8.95);

    /* ---------- 9.5 开始生成 ---------- */
    tl.fromTo('.s6-gen', { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.36 }, 9.5);
    tl.fromTo('.s6-done', { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.34, ease: 'back.out(2)' }, 11.12);

    /* ---------- 相机：缓慢推进 ---------- */
    tl.fromTo('.s6-cam', { scale: 1 }, { scale: 1.026, duration: 13.5, ease: 'none' }, 0);
    tl.fromTo('.s6-cam', { y: 0 }, { y: -6, duration: 13.5, ease: 'none' }, 0);

    /* ---------------- update：纯函数状态 ---------------- */
    function update(t) {
      /* 打字 */
      typedEl.textContent = TYPED.slice(0, typeCount(t));

      /* 进度 */
      const pct = progPct(t);
      progFill.style.transform = 'scaleX(' + pct / 100 + ')';
      pctEl.textContent = pct + '%';
      progEl.style.opacity = t >= 9.62 ? '1' : '0';
      pctEl.style.opacity = t >= 9.72 ? '1' : '0';

      /* 生成中 / 已完成 */
      const generating = t >= 9.5 && t < 11.12;
      const done = t >= 11.12;
      genEl.style.opacity = generating ? '1' : '0';
      genEl.style.transform = generating ? 'translateY(0px)' : 'translateY(8px)';
      doneEl.style.opacity = done ? '1' : '0';
      doneEl.style.transform = done ? 'scale(1)' : 'scale(.8)';
      spinEl.style.transform = 'rotate(' + (generating ? ((t * 900) % 360) : 0) + 'deg)';
      inputEl.classList.toggle('is-done', done);
    }

    update(0);
    return { timeline: tl, update: update };
  },
});
