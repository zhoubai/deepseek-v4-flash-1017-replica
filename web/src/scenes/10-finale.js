/* ============================================================
   SCENE 10-finale — 关注卡终章（86.0 → 90.35s）
   黑绿体积光 + 白色圆角关注卡 + 三个绿色圆形按钮 / 油漆飞溅
   ============================================================ */
Replica.registerScene({
  id: 'finale',
  title: '终章 · 关注',
  start: 86.0,
  end: 90.35,
  build(root) {
    const ICON = {
      like: '<svg viewBox="0 0 24 24" width="30" height="30" fill="currentColor"><path d="M2.6 10.4h3.5V21H2.6zM7.6 21V10.1l4.2-7.5c.38-.68 1.3-.92 2-.53.62.35 1 .99 1 1.7V7.4h4.9c1.35 0 2.34 1.24 2.05 2.55l-1.3 9.05c-.17 1.2-1.2 2.1-2.4 2.1H7.6z"/></svg>',
      star: '<svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor"><path d="M12 2.1l2.94 6.2 6.78.88-4.98 4.72 1.28 6.72L12 17.36l-6.02 3.26 1.28-6.72L2.28 9.18l6.78-.88z"/></svg>',
      plus: '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round"><path d="M12 4.2v15.6M4.2 12h15.6"/></svg>',
    };

    /* 飞溅点：确定性角度 / 半径 / 尺寸 */
    const SPLATS = [
      [8, 66, 5], [40, 76, 3], [72, 60, 6], [104, 74, 3.4], [136, 64, 4.6],
      [172, 78, 3], [204, 62, 5.4], [238, 72, 3.6], [276, 66, 4.2], [312, 76, 3.2],
      [346, 58, 4.8],
    ];
    const BURSTS = [
      [24, 96, 4], [70, 112, 3], [110, 92, 5], [150, 118, 3], [196, 100, 4], [240, 110, 3], [286, 96, 4], [330, 116, 3],
    ];
    const burstHTML = (k) => BURSTS.map((s, i) => {
      const a = (s[0] + k * 17) * Math.PI / 180;
      const r = s[1] * (1 + k * 0.06);
      const x = Math.cos(a) * r, y = Math.sin(a) * r * 0.8;
      const size = s[2] * (1 + (i % 2) * 0.3);
      return `<i class="fin-burst" data-bx="${x.toFixed(1)}" data-by="${y.toFixed(1)}" style="left:${x.toFixed(1)}px;top:${y.toFixed(1)}px;width:${size.toFixed(1)}px;height:${size.toFixed(1)}px;margin-left:${(-size / 2).toFixed(1)}px;margin-top:${(-size / 2).toFixed(1)}px"></i>`;
    }).join('');

    const splatHTML = (k) => SPLATS.map((s, i) => {
      const a = (s[0] + k * 11) * Math.PI / 180;
      const r = s[1] * (1 + k * 0.05);
      const x = Math.cos(a) * r, y = Math.sin(a) * r * 0.86;
      const size = s[2] * (1 + (i % 3) * 0.16);
      return `<i class="fin-splat" style="left:${x.toFixed(1)}px;top:${y.toFixed(1)}px;width:${size.toFixed(1)}px;height:${size.toFixed(1)}px;margin-left:${(-size / 2).toFixed(1)}px;margin-top:${(-size / 2).toFixed(1)}px"></i>`;
    }).join('');

    root.innerHTML = `
      <div class="bg bg-finale"></div>
      <div class="fin-beams"></div>
      <div class="fin-ray"></div>
      <div class="fin-glow"></div>

      <div class="fin-cam">
        <div class="fin-card">
          <div class="fin-portrait"><img src="assets/img/final-portrait.png" alt=""></div>
          <div class="fin-name">马安强AI普及</div>
          <div class="fin-sub">你觉得谁做得更好</div>
          <div class="fin-bars"><i></i><i></i><i></i><i></i></div>

          <div class="fin-actions">
            <div class="fin-act fin-act--1">
              <div class="fin-splats">${splatHTML(0)}${burstHTML(0)}</div>
              <div class="fin-btn">${ICON.like}</div>
              <div class="fin-label">点赞</div>
            </div>
            <div class="fin-act fin-act--2">
              <div class="fin-splats">${splatHTML(1)}${burstHTML(1)}</div>
              <div class="fin-btn">${ICON.star}</div>
              <div class="fin-label">收藏</div>
            </div>
            <div class="fin-act fin-act--3">
              <div class="fin-splats">${splatHTML(2)}${burstHTML(2)}</div>
              <div class="fin-btn">${ICON.plus}</div>
              <div class="fin-label">关注</div>
            </div>
          </div>

          <div class="fin-drops">
            <i class="fin-drop" style="left:64px;top:299px;width:9px;height:9px"></i>
            <i class="fin-drop" style="left:104px;top:309px;width:5px;height:5px"></i>
            <i class="fin-drop" style="left:300px;top:307px;width:6px;height:6px"></i>
            <i class="fin-drop" style="left:508px;top:302px;width:8px;height:8px"></i>
            <i class="fin-drop" style="left:530px;top:311px;width:4px;height:4px"></i>
          </div>
        </div>
      </div>

      <img class="fin-chibi" src="assets/scenes/dark/chibi.png" alt="">

      <div class="fin-scan"></div>
      <div class="vignette"></div>
    `;

    const tl = gsap.timeline({ paused: true });

    /* ---------- 0. 绿色体积光升起 ---------- */
    tl.fromTo('.fin-glow', { opacity: 0, y: 70, scale: .9 }, { opacity: 1, y: 0, scale: 1, duration: .9, ease: 'power2.out' }, 0);
    tl.fromTo('.fin-beams', { opacity: 0 }, { opacity: 1, duration: 1.15, ease: 'power1.out' }, .1);
    tl.fromTo('.fin-ray', { opacity: 0, scaleY: .55 }, { opacity: 1, scaleY: 1, duration: 1.2, ease: 'power2.out' }, .08);
    tl.fromTo('.fin-scan', { y: -180 }, { y: 720, duration: 4.0, ease: 'none', repeat: -1 }, .3);

    /* 常驻：体积光呼吸 / 光柱缓摆 / 相机轻推 */
    tl.fromTo('.fin-glow', { opacity: 1, scale: 1 }, { opacity: .8, scale: 1.06, duration: 1.75, ease: 'sine.inOut', yoyo: true, repeat: -1 }, 1.15);
    tl.fromTo('.fin-beams', { rotate: -2.2 }, { rotate: 2.2, duration: 3.6, ease: 'sine.inOut', yoyo: true, repeat: -1 }, 1.0);
    tl.fromTo('.fin-cam', { scale: 1.0, y: 0 }, { scale: 1.004, y: 0, duration: 4.35, ease: 'none' }, 0);

    /* ---------- 1. 关注卡弹入 ---------- */
    tl.fromTo('.fin-card', { opacity: 0, scale: .92, y: 46 },
      { opacity: 1, scale: 1, y: 0, duration: .84, ease: 'back.out(1.28)' }, .3);
    tl.fromTo('.fin-portrait', { opacity: 0, y: 16, scale: .9 },
      { opacity: 1, y: 0, scale: 1, duration: .52, ease: 'power3.out' }, .62);
    tl.fromTo('.fin-name', { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: .56, ease: 'power3.out' }, .72);
    tl.fromTo('.fin-sub', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: .52, ease: 'power3.out' }, .84);
    tl.fromTo('.fin-bars i', { scaleY: 0 }, { scaleY: 1, duration: .42, ease: 'back.out(2.2)', stagger: .055 }, .9);

    /* 3D 油漆工小人：上浮入场 + 轻微呼吸摆动 */
    tl.fromTo('.fin-chibi', { opacity: 0, y: 26, scale: .97 },
      { opacity: 1, y: 0, scale: 1, duration: .8, ease: 'back.out(1.3)' }, .58);
    tl.fromTo('.fin-chibi', { rotate: -1.6 }, { rotate: 1.6, duration: 2.1, ease: 'sine.inOut', yoyo: true, repeat: -1 }, 2.1);
    tl.fromTo('.fin-chibi', { y: 0 }, { y: -5, duration: 1.7, ease: 'sine.inOut', yoyo: true, repeat: -1 }, 2.3);

    /* ---------- 2. 三个按钮 stagger + 油漆飞溅 ---------- */
    const BTN = [
      { at: 1.2, act: '.fin-act--1' },
      { at: 1.36, act: '.fin-act--2' },
      { at: 1.52, act: '.fin-act--3' },
    ];
    tl.set('.fin-btn', { opacity: 0, scale: .3 }, 0);
    tl.set('.fin-label', { opacity: 0, y: 8 }, 0);
    tl.set('.fin-splat', { opacity: 0, scale: 0 }, 0);
    BTN.forEach(({ at, act }) => {
      tl.to(act + ' .fin-btn', { opacity: 1, scale: 1, duration: .46, ease: 'back.out(2.6)' }, at);
      tl.fromTo(act + ' .fin-label', { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: .34, ease: 'power2.out' }, at + .18);
      tl.to(act + ' .fin-splat', { opacity: .9, scale: 1, duration: .34, ease: 'back.out(2.4)', stagger: .022 }, at + .05);
      tl.fromTo(act + ' .fin-burst',
        { opacity: 0, scale: .3, x: (i, el) => -parseFloat(el.dataset.bx), y: (i, el) => -parseFloat(el.dataset.by) },
        { opacity: 1, scale: 1, x: 0, y: 0, duration: .44, ease: 'power2.out', stagger: .02 }, at + .04);
      tl.to(act + ' .fin-burst', { opacity: 0, scale: .5, duration: .42, ease: 'power2.in', stagger: .02 }, at + .46);
    });

    /* 卡片外沿的油漆点 */
    tl.fromTo('.fin-drop', { opacity: 0, scale: .4 }, { opacity: .85, scale: 1, duration: .34, ease: 'back.out(2)', stagger: .06 }, 1.62);
    tl.to('.fin-drop', { opacity: .55, duration: .9, ease: 'sine.inOut', yoyo: true, repeat: -1, stagger: .12 }, 2.2);

    /* ---------- 3. 保持：悬浮 / 呼吸 / 信号条律动 / 按钮辉光 ---------- */
    tl.to('.fin-card', { y: -4, duration: 2.3, ease: 'sine.inOut', yoyo: true, repeat: -1 }, 1.98);
    tl.fromTo('.fin-btn', { filter: 'brightness(1)' }, { filter: 'brightness(1.12)', duration: 1.25, ease: 'sine.inOut', yoyo: true, repeat: -1, stagger: .18 }, 2.0);
    tl.fromTo('.fin-bars i', { scaleY: 1 }, { scaleY: .68, duration: .52, ease: 'sine.inOut', yoyo: true, repeat: -1, stagger: .07 }, 2.25);
    tl.fromTo('.fin-glow', { filter: 'blur(8px)' }, { filter: 'blur(12px)', duration: 1.9, ease: 'sine.inOut', yoyo: true, repeat: -1 }, 2.4);

    /* ---------- 逐帧纯函数：hold 阶段标记 ---------- */
    function update(local) {
      const live = local >= 2.0;
      if (live !== root.classList.contains('fin-live')) root.classList.toggle('fin-live', live);
    }

    return { timeline: tl, update };
  },
});
