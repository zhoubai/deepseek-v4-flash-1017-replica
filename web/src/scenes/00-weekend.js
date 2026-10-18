/* ============================================================
   SCENE 01 — 周末（0.0 → 8.5s）
   纸拼贴场景：周末 × 日历翻页 × 1017 印章 × 头像
   ============================================================ */
Replica.registerScene({
  id: 'weekend',
  title: '周末',
  start: 0.0,
  end: 8.5,
  build(root) {
    root.innerHTML = `
      <div class="bg bg-paper"></div>
      <div class="s1-cam">
        <div class="s1-head">
          <div class="s1-h1">${UI.sticker('周末', { size: 98, sw: 11, fill: 'var(--cream)' })}</div>
          <div class="s1-h2">
            <span class="s1-ghost" aria-hidden="true">别掉以轻心</span>
            ${UI.sticker('别掉以轻心', { size: 78, sw: 9, rotate: -1.2, fill: 'var(--cream)' })}
          </div>
        </div>

        <div class="s1-cal">
          <span class="s1-ring s1-ring--l"></span>
          <span class="s1-ring s1-ring--r"></span>
          <div class="s1-cal-head">2026 · 十月</div>
          <div class="s1-cal-body">
            <div class="s1-date">
              <div class="s1-date-inner">
                <span class="s1-num">12</span>
                <span class="s1-flip-shadow"></span>
              </div>
            </div>
            <div class="s1-week">星期一</div>
          </div>
        </div>

        <div class="s1-clock">
          <svg viewBox="0 0 100 100" class="s1-clock-svg">
            <circle cx="50" cy="50" r="45" fill="#FDFCF3" stroke="#233B2B" stroke-width="3"/>
            <circle cx="50" cy="50" r="40.5" fill="none" stroke="#233B2B" stroke-width="1" opacity=".35"/>
            <g stroke="#233B2B" stroke-linecap="round">
              <line x1="50" y1="50" x2="66.4" y2="67.6" stroke-width="3.4" class="s1-clock-h"/>
              <line x1="50" y1="50" x2="35" y2="76" stroke-width="2.2" class="s1-clock-m"/>
            </g>
            <circle cx="50" cy="50" r="3.6" fill="#D23A31"/>
            <circle cx="50" cy="50" r="1.6" fill="#FDFCF3"/>
          </svg>
          <div class="s1-clock-label">16:35</div>
        </div>

        ${UI.avatar({ kind: 'host', size: 154, left: 1035, top: 104, cls: 's1-avatar' })}

        ${UI.stamp({ size: 194, rotate: -17, left: 799, top: 406, cls: 's1-stamp-el' })}
      </div>
    `;

    const numEl = root.querySelector('.s1-num');
    const weekEl = root.querySelector('.s1-week');
    const calBody = root.querySelector('.s1-cal-body');

    /* 日期状态表：t = 翻页时刻 */
    const DATES = [
      { t: -1,    d: '12', w: '星期一', red: false },
      { t: 1.85,  d: '14', w: '星期三', red: false },
      { t: 3.10,  d: '16', w: '星期五', red: false },
      { t: 4.35,  d: '17', w: '星期六', red: true },
    ];
    let cur = -1;

    const tl = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } });

    /* 镜头轻推 */
    tl.fromTo('.s1-cam', { scale: 1.0, x: 0, y: 0 }, { scale: 1.008, x: -4, y: -2, duration: 8.5, ease: 'none' }, 0);

    /* 标题砸入 */
    tl.fromTo('.s1-h1', { opacity: 0, x: -150, rotate: -9, scale: 0.82 },
      { opacity: 1, x: 0, rotate: 0, scale: 1, duration: 0.62, ease: 'expo.out' }, 0.12);
    tl.fromTo('.s1-h2', { opacity: 0, x: -120, rotate: -6, scale: 0.9 },
      { opacity: 1, x: 0, rotate: 0, scale: 1, duration: 0.6, ease: 'expo.out' }, 0.38);
    tl.to('.s1-ghost', { opacity: 0, x: 26, duration: 1.0 }, 0.9);

    /* 日历卡片升起 */
    tl.fromTo('.s1-cal', { opacity: 0, y: 110, rotate: 3.5, scale: 0.94 },
      { opacity: 1, y: 0, rotate: 0, scale: 1, duration: 0.85, ease: 'expo.out' }, 0.5);
    tl.fromTo('.s1-ring', { scaleY: 0 }, { scaleY: 1, duration: 0.4, stagger: 0.06, ease: 'back.out(3)' }, 1.05);

    /* 头像飘入 */
    tl.fromTo('.s1-avatar', { opacity: 0, x: 90, y: -26, scale: 0.72 },
      { opacity: 1, x: 0, y: 0, scale: 1, duration: 0.75, ease: 'expo.out' }, 0.28);
    tl.to('.s1-avatar', { y: 7, duration: 2.6, ease: 'sine.inOut', yoyo: true, repeat: -1 }, 1.2);

    /* 三次翻页 */
    [1.85, 3.10, 4.35].forEach((t) => {
      tl.to('.s1-date-inner', { scaleY: 0.04, duration: 0.15, ease: 'power2.in' }, t);
      tl.set('.s1-date-inner', { opacity: 0 }, t + 0.15);
      tl.set('.s1-date-inner', { scaleY: 1.08, opacity: 1 }, t + 0.16);
      tl.to('.s1-date-inner', { scaleY: 1, duration: 0.3, ease: 'back.out(2.2)' }, t + 0.16);
      tl.fromTo('.s1-flip-shadow', { opacity: 0.0 }, { opacity: 0.5, duration: 0.1, yoyo: true, repeat: 1 }, t);
      tl.fromTo(calBody, { boxShadow: 'inset 0 0 0 rgba(0,0,0,0)' }, { boxShadow: 'inset 0 14px 26px rgba(42,34,14,.16)', duration: 0.12, yoyo: true, repeat: 1 }, t);
    });

    /* 时钟 + 印章 */
    tl.fromTo('.s1-clock', { opacity: 0, scale: 0.4, rotate: -30 },
      { opacity: 1, scale: 1, rotate: 0, duration: 0.55, ease: 'back.out(2.4)' }, 5.25);
    tl.fromTo('.s1-stamp-el', { opacity: 0, scale: 2.1, rotate: -46 },
      { opacity: 0.94, scale: 1, rotate: -17, duration: 0.3, ease: 'power4.in' }, 5.78);
    tl.fromTo('.s1-stamp-el', { scale: 1.1 }, { scale: 1, duration: 0.22, ease: 'back.out(2)' }, 6.08);
    tl.to('.s1-cal', { rotate: -0.7, duration: 0.07, yoyo: true, repeat: 1, ease: 'none' }, 6.06);
    tl.to('.s1-cal', { rotate: 0, duration: 0.2 }, 6.2);

    /* 日期/星期状态（纯函数式，可 seek） */
    function update(local) {
      let idx = 0;
      for (let i = 0; i < DATES.length; i++) if (local >= DATES[i].t) idx = i;
      if (idx === cur) return;
      cur = idx;
      const D = DATES[idx];
      numEl.textContent = D.d;
      weekEl.textContent = D.w;
      root.querySelector('.s1-cal').classList.toggle('is-red', D.red);
      numEl.classList.toggle('is-red', D.red);
    }

    return { timeline: tl, update };
  },
});
