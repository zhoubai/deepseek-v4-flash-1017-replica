/* ============================================================
   SCENE 01-today — 就在今天（8.5 → 16.0s）
   纸拼贴：就在今天 × 17 日历 × 16:35 圆钟 × 1017 印章
            × 发布会 VIP 票券（没有！）× 预热海报（没有！）
   ============================================================ */
Replica.registerScene({
  id: 'today',
  title: '就在今天',
  start: 8.5,
  end: 16.0,
  build(root) {
    root.innerHTML = `
      <div class="bg bg-paper"></div>
      <div class="s2-tint"></div>

      <div class="s2-cam">
        <!-- 标题贴纸 -->
        <div class="s2-title">${UI.sticker('就在今天', { size: 66, sw: 7 })}

        </div>

        <!-- 日历卡 -->
        <div class="s2-calw">
          <div class="s2-cal">
            <span class="s2-ring s2-ring--l"></span>
            <span class="s2-ring s2-ring--r"></span>
            <div class="s2-cal-head">2026 · 十月</div>
            <div class="s2-cal-body">
              <div class="s2-date"><span class="s2-num">17</span></div>
              <div class="s2-week">星期六</div>
            </div>
          </div>
        </div>

        <!-- 小圆钟 16:35 -->
        <div class="s2-clock">
          <svg viewBox="0 0 100 100" class="s2-clock-svg">
            <circle cx="50" cy="50" r="45.5" fill="#FDFCF3" stroke="#233B2B" stroke-width="3.2"/>
            <g stroke-linecap="round">
              <line x1="50" y1="50" x2="65.5" y2="67" stroke="#233B2B" stroke-width="4.2"/>
              <line x1="50" y1="50" x2="35" y2="76" stroke="#B5322B" stroke-width="3.6"/>
            </g>
            <circle cx="50" cy="50" r="4.6" fill="#233B2B"/>
          </svg>
          <div class="s2-clock-label">16:35</div>
        </div>

        ${UI.stamp({ size: 166, ink: 'indigo', rotate: -16, left: 331, top: 405, cls: 's2-stamp' })}

        <!-- 发布会 VIP 票券 -->
        <div class="s2-tk">
          <span class="tape s2-tk-tape"></span>
          <div class="s2-tk-card">
            <div class="s2-tk-stub"><span>VIP</span><span>几场</span></div>
            <div class="s2-tk-perf"></div>
            <div class="s2-tk-main">
              <div class="s2-tk-title">发布会</div>
              <div class="s2-tk-sub">几场券 · 10月17日</div>
            </div>
          </div>
          <div class="s2-no"><div class="s2-no-in">${UI.sticker('没有', { size: 64, sw: 7, fill: '#E2504A', stroke: '#7A1D13', rotate: -13, cls: 's2-no-st' })}</div></div>
        </div>

        <!-- 预热海报 -->
        <div class="s2-po">
          <span class="tape s2-po-tape"></span>
          <div class="s2-po-card">
            <div class="s2-po-img"><span class="s2-po-q">?</span></div>
            <div class="s2-po-t1">预热海报</div>
            <div class="s2-po-t2">敬请期待</div>
          </div>
          <div class="s2-no2"><div class="s2-no2-in">${UI.sticker('没有', { size: 54, sw: 6, fill: '#E2504A', stroke: '#7A1D13', rotate: -14, cls: 's2-no2-st' })}</div></div>
        </div>

        <!-- 中右留白：胶带 + 手写时间批注 -->
        <div class="s2-note">
          <span class="tape s2-note-tape"></span>
          <span class="s2-note-txt">16:35</span>
          <i class="s2-note-line"></i>
        </div>

        <!-- 右上角 host 头像（纸拼贴固定元素） -->
        ${UI.avatar({ kind: 'host', size: 154, left: 1035, top: 104, cls: 's2-avatar' })}
      </div>
    `;

    const tl = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } });

    /* ---------- 镜头：全片缓慢 push-in ---------- */
    tl.fromTo('.s2-cam', { scale: 1 }, { scale: 1.018, duration: 7.5, ease: 'none' }, 0);

    /* ---------- 0.0 硬切入场：元素已在场，快速「贴稳」 ---------- */
    tl.fromTo('.s2-title',
      { scale: 1.1, y: -10, rotate: 2.2 },
      { scale: 1, y: 0, rotate: 0, duration: 0.52, ease: 'back.out(1.7)' }, 0);

    tl.fromTo('.s2-cal',
      { y: -18, scale: 1.02 },
      { y: 0, scale: 1, duration: 0.58, ease: 'back.out(1.5)' }, 0.02);
    tl.fromTo('.s2-ring', { scaleY: 0 }, { scaleY: 1, duration: 0.38, stagger: 0.06, ease: 'back.out(3)' }, 0.3);

    tl.fromTo('.s2-clock',
      { scale: 0.84, rotate: -9 },
      { scale: 1, rotate: 0, duration: 0.5, ease: 'back.out(2)' }, 0.06);

    tl.fromTo('.s2-stamp',
      { scale: 1.1 },
      { scale: 1, duration: 0.42, ease: 'back.out(2)' }, 0.12);

    tl.fromTo('.s2-avatar',
      { opacity: 0, x: 74, y: -18, scale: 0.72 },
      { opacity: 1, x: 0, y: 0, scale: 1, duration: 0.7, ease: 'expo.out' }, 0.3);
    tl.to('.s2-avatar', { y: 7, duration: 2.8, ease: 'sine.inOut', yoyo: true, repeat: -1 }, 1.1);

    /* ---------- 1.0 票券从右滑入 ---------- */
    tl.fromTo('.s2-tk',
      { opacity: 0, x: 320, y: -192, rotate: 7 },
      { opacity: 1, x: 0, y: -192, rotate: 0, duration: 0.9, ease: 'expo.out' }, 1.02);
    tl.to('.s2-tk', { y: 0, duration: 0.54, ease: 'back.out(1.15)' }, 1.94);
    tl.fromTo('.s2-tk-tape', { scaleX: 0, opacity: 0 }, { scaleX: 1, opacity: 1, duration: 0.38, ease: 'back.out(2)' }, 1.6);

    /* ---------- 2.2 红色「没有」砸在票券上 ---------- */
    tl.fromTo('.s2-no-in',
      { opacity: 0, scale: 1.8, rotate: -46, y: -30 },
      { opacity: 1, scale: 1, rotate: 0, y: 0, duration: 0.26, ease: 'power4.in' }, 2.18);
    tl.to('.s2-no-in', { scale: 1.08, duration: 0.1, ease: 'power2.out' }, 2.46);
    tl.to('.s2-no-in', { scale: 1, duration: 0.24, ease: 'back.out(2.4)' }, 2.56);
    tl.to('.s2-tk', { y: 8, duration: 0.11, ease: 'power2.out' }, 2.46);
    tl.to('.s2-tk', { y: 0, duration: 0.32, ease: 'back.out(2)' }, 2.57);
    tl.to('.s2-stamp', { scale: 1.07, duration: 0.1, ease: 'power2.out' }, 2.48);
    tl.to('.s2-stamp', { scale: 1, duration: 0.26, ease: 'back.out(2)' }, 2.58);

    /* 票券被「没有」否决 → 置灰 */
    tl.to('.s2-tk-card', { filter: 'grayscale(.94) brightness(1.05) contrast(.94)', duration: 0.5, ease: 'power2.out' }, 2.68);

    /* ---------- 3.3 预热海报从上方砸入 ---------- */
    tl.fromTo('.s2-po',
      { opacity: 0, y: -300, rotate: -11, scale: 0.95 },
      { opacity: 1, y: 0, rotate: 0, scale: 1, duration: 0.8, ease: 'expo.out' }, 3.3);
    tl.fromTo('.s2-po-tape', { scaleX: 0, opacity: 0 }, { scaleX: 1, opacity: 1, duration: 0.34, ease: 'back.out(2)' }, 3.78);
    tl.to('.s2-cal', { rotate: 0.7, duration: 0.07, yoyo: true, repeat: 1, ease: 'none' }, 3.86);
    tl.to('.s2-cal', { rotate: 0, duration: 0.2 }, 4.0);
    tl.to('.s2-tk', { y: 4, duration: 0.16, ease: 'power2.out' }, 3.86);
    tl.to('.s2-tk', { y: 0, duration: 0.3, ease: 'back.out(2)' }, 4.02);

    /* ---------- 4.3 小「没有」盖上海报 + 海报置灰 ---------- */
    tl.fromTo('.s2-no2-in',
      { opacity: 0, scale: 1.9, rotate: -52 },
      { opacity: 1, scale: 1, rotate: 0, duration: 0.26, ease: 'power4.in' }, 4.34);
    tl.to('.s2-no2-in', { scale: 1.06, duration: 0.1, ease: 'power2.out' }, 4.6);
    tl.to('.s2-no2-in', { scale: 1, duration: 0.22, ease: 'back.out(2.4)' }, 4.7);
    tl.to('.s2-po', { y: 6, duration: 0.11, ease: 'power2.out' }, 4.6);
    tl.to('.s2-po', { y: 0, duration: 0.32, ease: 'back.out(2)' }, 4.71);
    tl.to('.s2-po-card', { filter: 'grayscale(.9) brightness(1.02) contrast(.95)', duration: 0.46, ease: 'power2.out' }, 4.46);

    /* ---------- 4.5 印章再补一下 ---------- */
    tl.fromTo('.s2-stamp', { scale: 0.86 }, { scale: 1, duration: 0.2, ease: 'back.out(2.2)', immediateRender: false }, 4.56);

    /* ---------- 5.3 卡片群轻微上浮 / 再推近 ---------- */
    tl.to('.s2-title', { y: -5, duration: 0.8, ease: 'power2.out' }, 5.34);
    tl.to('.s2-calw', { y: -6, duration: 0.8, ease: 'power2.out' }, 5.34);
    tl.to('.s2-clock', { y: -4, duration: 0.8, ease: 'power2.out' }, 5.34);

    return { timeline: tl };
  },
});
