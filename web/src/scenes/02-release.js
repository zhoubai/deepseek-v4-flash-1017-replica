/* ============================================================
   SCENE 02-release — 官方发推（16.0 → 24.5s）
   黑绿六边形暗场：Twitter 推文卡 × 绿胶囊 × 大标题 × 1017 印章 × 版本列表
   ============================================================ */
Replica.registerScene({
  id: 'release',
  title: '官方发推',
  start: 16.0,
  end: 24.5,
  build(root) {
    const TITLE = 'DeepSeek V4.1 Flash';

    root.innerHTML = `
      <div class="bg bg-hex"></div>
      <div class="rel-ambient"></div>
      <div class="rel-cam">

        <div class="rel-tweet">
          <div class="rel-tw-head">
            <div class="rel-tw-avatar"><img src="assets/scenes/dark/deepseek-whale.png" alt=""></div>
            <div class="rel-tw-id">
              <div class="rel-tw-name">DeepSeek<span class="rel-tw-badge"></span></div>
              <div class="rel-tw-handle">@deepseek_ai</div>
            </div>
          </div>
          <div class="rel-tw-body">DeepSeek&#8211;V4.1&#8211;Flash&#8211;1017 is here!</div>
          <div class="rel-tw-meta"><span>下午4:35</span><i>·</i><span>2026年10月17日</span><i>·</i><span><b class="rel-views">0</b>万 次查看</span></div>
        </div>

        <div class="rel-capsule"><i class="rel-capsule-dot"></i><span>没有发布会，直接发推</span></div>

        <div class="rel-title-wrap">
          <div class="rel-title">${Array.from(TITLE).map((c) => `<span class="rel-ch">${c === ' ' ? '&nbsp;' : c}</span>`).join('')}</div>
          <div class="rel-title-glow"></div>
        </div>

        <div class="rel-stage2">
          <div class="rel-vrow rel-vrow--1">DeepSeek-V3-0324</div>
          <div class="rel-vrow rel-vrow--2">DeepSeek-R1-0528</div>
          <div class="rel-vrow rel-vrow--3">DeepSeek V4.1 Flash</div>
        </div>

        <div class="rel-stampflash"></div>
        ${UI.stamp({ size: 172, rotate: -12, left: 885, top: 306, cls: 'rel-stamp-title', seed: 11 })}
        ${UI.stamp({ size: 127, rotate: -12, left: 675, top: 399, cls: 'rel-stamp-ver', seed: 7 })}

        ${UI.avatar({ kind: 'host', size: 146, left: 1064, top: 118, cls: 'rel-avatar' })}
      </div>
      <div class="rel-scan"></div>
      <div class="vignette"></div>
    `;

    /* 逐字 span（保留空间，先隐藏） */
    const chars = gsap.utils.toArray('.rel-title .rel-ch', root);
    const views = root.querySelector('.rel-views');

    const tl = gsap.timeline({ paused: true });

    /* ---------- 常驻：相机轻推 / 环境呼吸 / 扫描线 / 头像漂浮 ---------- */
    tl.fromTo('.rel-cam', { scale: 1.0, y: 0 }, { scale: 1.018, y: -8, duration: 8.5, ease: 'none' }, 0);
    tl.fromTo('.rel-ambient', { opacity: 0.55, scale: 1 }, { opacity: 1, scale: 1.12, duration: 4.2, ease: 'sine.inOut', yoyo: true, repeat: -1 }, 0);
    tl.fromTo('.rel-scan', { y: -180 }, { y: 720, duration: 5.6, ease: 'none', repeat: -1 }, 0.4);

    tl.fromTo('.rel-avatar', { opacity: 0, x: 90, y: -26, scale: 0.72 },
      { opacity: 1, x: 0, y: 0, scale: 1, duration: 0.75, ease: 'expo.out' }, 0.16);
    tl.to('.rel-avatar', { y: 8, duration: 2.8, ease: 'sine.inOut', yoyo: true, repeat: -1 }, 1.1);

    /* ---------- 1. 推文卡落入 ---------- */
    tl.fromTo('.rel-tweet', { opacity: 0, y: -78, scale: 0.985 },
      { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'expo.out' }, 0.05);
    tl.fromTo('.rel-tw-head', { opacity: 0, y: -8 }, { opacity: 1, y: 0, duration: 0.3 }, 0.1);
    tl.fromTo('.rel-tw-body', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.32 }, 0.16);
    tl.fromTo('.rel-tw-meta', { opacity: 0 }, { opacity: 1, duration: 0.3 }, 0.24);

    /* ---------- 2. 绿胶囊 ---------- */
    tl.fromTo('.rel-capsule', { opacity: 0, x: -54, scale: 0.94 },
      { opacity: 1, x: 0, scale: 1, duration: 0.55, ease: 'expo.out' }, 1.12);
    tl.fromTo('.rel-capsule-dot', { scale: 0 }, { scale: 1, duration: 0.3, ease: 'back.out(3)' }, 1.3);
    tl.fromTo('.rel-capsule-dot', { opacity: 1 }, { opacity: 0.45, duration: 0.9, ease: 'sine.inOut', yoyo: true, repeat: -1 }, 1.6);

    /* ---------- 3. 大标题：字母级入场 ---------- */
    tl.fromTo(chars, { opacity: 0, y: 34, rotate: 4 },
      { opacity: 1, y: 0, rotate: 0, duration: 0.42, ease: 'power3.out', stagger: 0.028 }, 1.58);
    tl.fromTo('.rel-title-glow', { opacity: 0, scaleX: 0.2 }, { opacity: 1, scaleX: 1, duration: 1.1, ease: 'expo.out' }, 1.7);
    tl.fromTo('.rel-title-glow', { opacity: 0.85 }, { opacity: 0.4, duration: 2.6, ease: 'sine.inOut', yoyo: true, repeat: -1 }, 2.9);

    /* ---------- 4. 1017 印章砸入 ---------- */
    tl.set('.rel-stamp-title', { opacity: 0, scale: 2.2, rotate: -48 }, 0);
    tl.to('.rel-stamp-title', { opacity: 0.94, scale: 1, rotate: -12, duration: 0.3, ease: 'power4.in' }, 2.86);
    tl.fromTo('.rel-stamp-title', { scale: 1.09 }, { scale: 1, duration: 0.26, ease: 'back.out(2.4)' }, 3.16);
    tl.fromTo('.rel-stampflash', { opacity: 0.55, scale: 0.5 }, { opacity: 0, scale: 1.5, duration: 0.55, ease: 'expo.out' }, 2.9);
    tl.to('.rel-cam', { x: 7, duration: 0.045, ease: 'none' }, 3.13);
    tl.to('.rel-cam', { x: -5, duration: 0.06, ease: 'none' }, 3.175);
    tl.to('.rel-cam', { x: 0, duration: 0.16, ease: 'power2.out' }, 3.235);
    tl.to('.rel-tweet', { rotate: -0.25, duration: 0.08, yoyo: true, repeat: 1, ease: 'none' }, 3.14);

    /* ---------- 5. 画面切换：推文/标题上移淡出，版本列表滑入 ---------- */
    tl.to('.rel-tweet', { opacity: 0, y: -70, duration: 0.5, ease: 'power2.in' }, 4.18);
    tl.to('.rel-capsule', { opacity: 0, y: -60, duration: 0.45, ease: 'power2.in' }, 4.18);
    tl.to('.rel-title-wrap', { opacity: 0, y: -64, duration: 0.45, ease: 'power2.in' }, 4.2);
    tl.to('.rel-stamp-title', { opacity: 0, scale: 0.72, duration: 0.35, ease: 'power2.in' }, 4.18);

    tl.fromTo('.rel-vrow--1', { opacity: 0, x: -90, y: 6 }, { opacity: 1, x: 0, y: 0, duration: 0.62, ease: 'expo.out' }, 4.4);
    tl.fromTo('.rel-vrow--2', { opacity: 0, x: -90, y: 6 }, { opacity: 1, x: 0, y: 0, duration: 0.62, ease: 'expo.out' }, 4.66);
    tl.fromTo('.rel-vrow--3', { opacity: 0, x: -90, y: 6 }, { opacity: 1, x: 0, y: 0, duration: 0.62, ease: 'expo.out' }, 4.92);

    /* 版本阶段印章再砸一次 */
    tl.set('.rel-stamp-ver', { opacity: 0, scale: 1.75, rotate: -42 }, 0);
    tl.to('.rel-stamp-ver', { opacity: 0.92, scale: 1, rotate: -12, duration: 0.28, ease: 'power4.in' }, 5.28);
    tl.fromTo('.rel-stamp-ver', { scale: 1.08 }, { scale: 1, duration: 0.24, ease: 'back.out(2.2)' }, 5.56);
    tl.fromTo('.rel-stampflash', { opacity: 0.32, scale: 0.5 }, { opacity: 0, scale: 1.3, duration: 0.5, ease: 'expo.out' }, 5.3);
    tl.to('.rel-cam', { x: 5, duration: 0.045, ease: 'none' }, 5.54);
    tl.to('.rel-cam', { x: 0, duration: 0.22, ease: 'power2.out' }, 5.59);

    /* ---------- 6. 保持阶段：高亮呼吸 ---------- */
    tl.fromTo('.rel-vrow--1', { color: '#a9a9a9' }, { color: '#c7c7c7', duration: 1.6, ease: 'sine.inOut', yoyo: true, repeat: -1 }, 5.9);
    tl.fromTo('.rel-vrow--3', { textShadow: '0 0 0 rgba(47,227,138,0)' },
      { textShadow: '0 0 26px rgba(47,227,138,.42)', duration: 1.5, ease: 'sine.inOut', yoyo: true, repeat: -1 }, 5.7);
    tl.fromTo('.rel-vrow--3', { x: 0 }, { x: 4, duration: 2.2, ease: 'sine.inOut', yoyo: true, repeat: -1 }, 6.0);
    tl.to('.rel-stamp-ver', { rotate: -9, duration: 2.4, ease: 'sine.inOut', yoyo: true, repeat: -1 }, 5.9);

    /* ---------- 逐帧纯函数：浏览量 count-up ---------- */
    let cur = -1;
    function update(local) {
      const t = Math.max(0, Math.min(1, (local - 0.15) / 1.05));
      const v = Math.round(235 * (1 - Math.pow(1 - t, 2)));
      if (v === cur) return;
      cur = v;
      views.textContent = String(v);
    }

    return { timeline: tl, update };
  },
});
