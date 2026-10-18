/* ============================================================
   SCENE 08 — 我的实测（68.0 → 74.0s）
   暖色虚化 B-roll × TESTED 栏目 × 大标题 × 两行能力 × 金色奖杯卡
   ============================================================ */
Replica.registerScene({
  id: 'tested',
  title: '我的实测',
  start: 68.0,
  end: 74.0,
  build(root) {
    const CAM = `
      <svg class="s8-ic" viewBox="0 0 50 36" fill="none" aria-hidden="true">
        <rect class="s8-draw" x="2.4" y="7.2" width="29" height="21.6" rx="4.4"
          stroke="#2FE38A" stroke-width="2.7"/>
        <path class="s8-draw" d="M34.6 14.6 L45.6 8.4 V27.6 L34.6 21.4 Z"
          stroke="#2FE38A" stroke-width="2.7" stroke-linejoin="round"/>
      </svg>`;
    const CODE = `
      <svg class="s8-ic" viewBox="0 0 50 36" fill="none" aria-hidden="true">
        <path class="s8-draw" d="M15 8 L4.4 18 L15 28" stroke="#2FE38A" stroke-width="2.8"
          stroke-linecap="round" stroke-linejoin="round"/>
        <path class="s8-draw" d="M35 8 L45.6 18 L35 28" stroke="#2FE38A" stroke-width="2.8"
          stroke-linecap="round" stroke-linejoin="round"/>
        <path class="s8-draw" d="M28.4 4.6 L21.6 31.4" stroke="#2FE38A" stroke-width="2.8"
          stroke-linecap="round"/>
      </svg>`;

    root.innerHTML = `
      <div class="bg bg-studio"></div>
      <div class="s8-warm"></div>
      <div class="vignette"></div>
      <div class="s8-stage">
        <div class="s8-label">
          <div class="s8-kicker">TESTED</div>
          <div class="s8-sub"><i></i><span>我的实测</span></div>
        </div>

        <h2 class="s8-title"><span>这</span><span>次</span><span class="g">大</span><span class="g">提</span><span class="g">升</span></h2>

        <div class="s8-row s8-row--1">
          <div class="s8-num">01</div>
          <div class="s8-ico">${CAM}</div>
          <div class="s8-tag">视频制作</div>
        </div>
        <div class="s8-row s8-row--2">
          <div class="s8-num">02</div>
          <div class="s8-ico">${CODE}</div>
          <div class="s8-tag">前端能力</div>
        </div>

        <div class="s8-sweep"></div>

        <div class="s8-card">
          <div class="s8-shine"></div>
          <svg class="s8-cup" viewBox="0 0 64 60" fill="none" aria-hidden="true">
            <path class="s8-cup-path" d="M20 6 H44 V22 A12 12 0 0 1 32 34 A12 12 0 0 1 20 22 Z"
              stroke="#E8BE55" stroke-width="2.6" stroke-linejoin="round"/>
            <path class="s8-cup-path" d="M20 10 H10 V17 A8 8 0 0 0 18 25" stroke="#E8BE55" stroke-width="2.4"
              stroke-linecap="round"/>
            <path class="s8-cup-path" d="M44 10 H54 V17 A8 8 0 0 1 46 25" stroke="#E8BE55" stroke-width="2.4"
              stroke-linecap="round"/>
            <path class="s8-cup-path" d="M32 34 V43" stroke="#E8BE55" stroke-width="2.6" stroke-linecap="round"/>
            <path class="s8-cup-path" d="M22 47 H42 L44 53 H20 Z" stroke="#E8BE55" stroke-width="2.4"
              stroke-linejoin="round"/>
            <path class="s8-cup-path" d="M27 11.5 H37" stroke="#E8BE55" stroke-width="2.2" stroke-linecap="round" opacity=".7"/>
          </svg>
          <div class="s8-card-t">Opus 5.5</div>
          <div class="s8-card-s">以前的强项</div>
          <div class="s8-pills">
            <div class="s8-pill">视频制作</div>
            <div class="s8-pill">前端能力</div>
          </div>
        </div>
      </div>`;

    const q = (s) => root.querySelector(s);
    const qa = (s) => Array.prototype.slice.call(root.querySelectorAll(s));
    const stage = q('.s8-stage');
    const label = q('.s8-label');
    const title = qa('.s8-title span');
    const rows = qa('.s8-row');
    const card = q('.s8-card');
    const cupPaths = qa('.s8-cup-path');
    const cardPills = qa('.s8-pill');
    const nums = qa('.s8-num');
    const tags = qa('.s8-tag');

    /* 描边长度（奖杯线稿） */
    cupPaths.forEach((p) => {
      const L = p.getTotalLength();
      gsap.set(p, { strokeDasharray: L, strokeDashoffset: L });
    });

    const tl = gsap.timeline({ paused: true });

    /* ---------------- 初始态 ---------------- */
    tl.set(label, { opacity: 0, x: -22 }, 0);
    tl.set(title, { opacity: 0, y: 46, rotate: 2.2, transformOrigin: '50% 100%' }, 0);
    tl.set(rows, { opacity: 0 }, 0);
    tl.set(nums, { scale: 0.3, opacity: 0 }, 0);
    tl.set(qa('.s8-ico'), { opacity: 0, scale: 0.6 }, 0);
    tl.set(tags, { opacity: 0, x: -26 }, 0);
    tl.set(card, { opacity: 0, x: 360, rotate: 2.6 }, 0);
    tl.set(qa('.s8-card-t, .s8-card-s'), { opacity: 0, y: 12 }, 0);
    tl.set(cardPills, { opacity: 0, y: 10, scale: 0.94 }, 0);
    tl.set(q('.s8-cup'), { opacity: 0, scale: 0.72, transformOrigin: '50% 40%' }, 0);
    tl.set('.s8-shine', { opacity: 0 }, 0);

    /* ---------------- 栏目小标 ---------------- */
    tl.to(label, { opacity: 1, x: 0, duration: 0.55, ease: 'power3.out' }, 0.18);
    tl.fromTo('.s8-sub i', { scaleY: 0 }, { scaleY: 1, duration: 0.4, ease: 'power2.out', transformOrigin: '50% 0%' }, 0.42);

    /* ---------------- 大标题逐字 ---------------- */
    tl.to(title, {
      opacity: 1, y: 0, rotate: 0, duration: 0.62,
      ease: 'power4.out', stagger: 0.075,
    }, 0.92);

    /* ---------------- 两行能力 ---------------- */
    function rowIn(row, i, t0) {
      const num = row.querySelector('.s8-num');
      const ico = row.querySelector('.s8-ico');
      const tag = row.querySelector('.s8-tag');
      tl.to(row, { opacity: 1, duration: 0.2 }, t0);
      tl.to(num, { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(2.6)' }, t0);
      tl.to(ico, { opacity: 1, scale: 1, duration: 0.42, ease: 'back.out(2.2)' }, t0 + 0.12);
      tl.to(tag, { opacity: 1, x: 0, duration: 0.45, ease: 'power3.out' }, t0 + 0.18);
      tl.fromTo(tag, { letterSpacing: '0.12em' }, { letterSpacing: '0.01em', duration: 0.5, ease: 'power2.out' }, t0 + 0.18);
    }
    rowIn(rows[0], 0, 1.62);
    rowIn(rows[1], 1, 1.98);

    /* 标题轻推近景 + 绿色发光扫过 */
    tl.to('.s8-title', { x: -9, duration: 0.85, ease: 'power2.out' }, 2.58);
    tl.set('.s8-sweep', { opacity: 0, x: -150 }, 0);
    tl.to('.s8-sweep', { opacity: 0.95, duration: 0.22 }, 2.72);
    tl.fromTo('.s8-sweep', { x: -150 }, { x: 330, duration: 0.85, ease: 'power2.inOut' }, 2.7);
    tl.to('.s8-sweep', { opacity: 0, duration: 0.3 }, 3.3);

    /* 绿色高亮呼吸 */
    tl.to(nums, { boxShadow: '0 0 34px rgba(47,227,138,.85)', duration: 1.1, yoyo: true, repeat: -1, ease: 'sine.inOut' }, 2.7);
    tl.to(tags, { x: 5, duration: 1.3, yoyo: true, repeat: -1, ease: 'sine.inOut', stagger: 0.12 }, 2.8);

    /* ---------------- 金色奖杯卡 ---------------- */
    tl.to(card, { opacity: 1, x: 0, rotate: 0, duration: 0.85, ease: 'power3.out' }, 3.82);
    tl.to(q('.s8-cup'), { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.9)' }, 4.02);
    tl.to(cupPaths, { strokeDashoffset: 0, duration: 0.5, stagger: 0.06, ease: 'power2.out' }, 4.06);
    tl.to('.s8-card-t', { opacity: 1, y: 0, duration: 0.42, ease: 'power2.out' }, 4.28);
    tl.to('.s8-card-s', { opacity: 1, y: 0, duration: 0.36, ease: 'power2.out' }, 4.4);
    tl.to(cardPills, { opacity: 1, y: 0, scale: 1, duration: 0.42, stagger: 0.11, ease: 'back.out(1.8)' }, 4.46);
    tl.fromTo(card, { boxShadow: '0 24px 60px rgba(0,0,0,.55), 0 0 0 rgba(232,190,85,0)' },
      { boxShadow: '0 24px 60px rgba(0,0,0,.55), 0 0 34px rgba(232,190,85,.35)', duration: 0.7, ease: 'power2.out' }, 4.05);
    tl.to('.s8-shine', { opacity: 1, duration: 0.4 }, 4.5);
    tl.fromTo('.s8-shine', { x: -160 }, { x: 300, duration: 1.5, ease: 'power2.inOut' }, 4.55);
    tl.to(card, { y: -5, duration: 1.4, yoyo: true, repeat: -1, ease: 'sine.inOut' }, 5.0);
    tl.to(card, {
      boxShadow: '0 24px 60px rgba(0,0,0,.55), 0 0 54px rgba(232,190,85,.5)',
      duration: 1.25, yoyo: true, repeat: -1, ease: 'sine.inOut',
    }, 4.9);

    return { timeline: tl };
  },
});
