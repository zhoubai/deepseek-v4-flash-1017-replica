/* ============================================================
   SCENE 03-naming — 换别的厂家（24.5 → 31.0s）
   暖色虚化 B-roll 上叠加：NAMING 栏目 / 大标题 / 叫法卡片
   / 版本时间线 / 金色「跨代大版本 + V5」/ 红色书法「不讲武德」
   ============================================================ */
Replica.registerScene({
  id: 'naming',
  title: '换别的厂家',
  start: 24.5,
  end: 31.0,
  build(root) {
    root.innerHTML = `
      <div class="bg bg-studio"></div>
      <div class="s3-tint"></div>
      <div class="s3-bokeh" aria-hidden="true">
        <i class="s3-bk s3-bk--1"></i><i class="s3-bk s3-bk--2"></i><i class="s3-bk s3-bk--3"></i>
        <i class="s3-bk s3-bk--4"></i><i class="s3-bk s3-bk--5"></i><i class="s3-bk s3-bk--6"></i>
      </div>

      <div class="s3-cam">
        <!-- 左上角栏目标签 -->
        <div class="s3-kicker">
          <i class="s3-kicker-line"></i>
          <div class="s3-kicker-txt">
            <b>NAMING</b>
            <span>版本号</span>
          </div>
        </div>

        <!-- 大标题 -->
        <div class="s3-title-wrap">
          <div class="s3-title">换别的厂家</div>
          <div class="s3-underline"></div>
          <div class="s3-pill"><i class="s3-pill-arrow">↗</i><span>同样幅度的升级</span></div>
        </div>

        <!-- 金色「跨代大版本」（打字机） -->
        <div class="s3-gold"><span class="s3-gold-txt"></span><i class="s3-gold-caret"></i></div>

        <!-- 红色书法「不讲武德」 -->
        <div class="s3-brush"><span>不讲武德</span></div>

        <!-- 右侧：深绿「叫法」卡片 -->
        <div class="s3-card">
          <div class="s3-card-label">DeepSeek 的叫法</div>
          <div class="s3-card-name">V4.1</div>
          <div class="s3-card-name">Flash</div>
          <div class="s3-card-edge"></div>
          <div class="s3-spark">
            <i class="s3-sp s3-sp--1"></i><i class="s3-sp s3-sp--2"></i><i class="s3-sp s3-sp--3"></i>
            <i class="s3-sp s3-sp--4"></i><i class="s3-sp s3-sp--5"></i>
          </div>
        </div>
        ${UI.stamp({ size: 128, ink: 'indigo', rotate: -14, left: 1134, top: 191, cls: 's3-stamp' })}

        <!-- 右侧：版本时间线 -->
        <div class="s3-vlist">
          <div class="s3-vr"><i class="s3-vdot"></i><span class="s3-vname">DeepSeek-V3-0324</span><span class="s3-vdate">2025 · 03 · 24</span></div>
          <div class="s3-vr"><i class="s3-vdot"></i><span class="s3-vname">DeepSeek-R1-0528</span><span class="s3-vdate">2025 · 05 · 28</span></div>
          <div class="s3-vr s3-vr--hi"><i class="s3-vdot"></i><span class="s3-vname">DeepSeek V4.1 Flash</span><span class="s3-vdate">2026 · 10 · 17</span></div>
        </div>

        <!-- 右侧：金色 V5 卡片 -->
        <div class="s3-v5card">
          <div class="s3-card-label">换别家会叫</div>
          <div class="s3-v5">V5</div>
          <div class="s3-v5bar"></div>
        </div>
      </div>
    `;

    const goldTxt = root.querySelector('.s3-gold-txt');
    const titleEl = root.querySelector('.s3-title');
    const titleChars = UI.splitChars(titleEl);
    const GOLD = '跨代大版本';

    const tl = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } });

    /* ---------- 镜头：缓慢推近 ---------- */
    tl.fromTo('.s3-cam', { scale: 1 }, { scale: 1.022, duration: 6.5, ease: 'none' }, 0);
    tl.fromTo('.s3-bokeh', { x: 0 }, { x: -26, duration: 6.5, ease: 'none' }, 0);

    /* ---------- 0.0 栏目标签 ---------- */
    tl.fromTo('.s3-kicker-line', { scaleY: 0.55, opacity: 0.6 }, { scaleY: 1, opacity: 1, duration: 0.4, ease: 'expo.out' }, 0);
    tl.fromTo('.s3-kicker-txt', { opacity: 0.45, x: -14 }, { opacity: 1, x: 0, duration: 0.52 }, 0.04);

    /* ---------- 0.7 大标题 ---------- */
    tl.fromTo(titleChars, { opacity: 0, y: 44, x: -26, rotate: -4 },
      { opacity: 1, y: 0, x: 0, rotate: 0, duration: 0.62, stagger: 0.11, ease: 'expo.out' }, 0.62);
    tl.fromTo('.s3-underline', { scaleX: 0 }, { scaleX: 1, duration: 0.5, ease: 'expo.out' }, 1.24);
    tl.fromTo('.s3-pill', { opacity: 0, x: -46 }, { opacity: 1, x: 0, duration: 0.52, ease: 'back.out(1.6)' }, 1.46);

    /* ---------- 1.0 深绿「叫法」卡片 ---------- */
    tl.fromTo('.s3-card', { opacity: 0, x: 250 }, { opacity: 1, x: 0, duration: 0.82, ease: 'expo.out' }, 1.0);
    tl.fromTo('.s3-card > .s3-card-label, .s3-card > .s3-card-name', { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.4, stagger: 0.09 }, 1.36);
    tl.fromTo('.s3-stamp', { opacity: 0, scale: 2.0, rotate: -44 },
      { opacity: 0.94, scale: 1, rotate: -14, duration: 0.3, ease: 'power4.in' }, 1.56);
    tl.fromTo('.s3-stamp', { scale: 1.08 }, { scale: 1, duration: 0.24, ease: 'back.out(2)' }, 1.86);
    tl.fromTo('.s3-card', { borderColor: 'rgba(47,227,138,.35)' }, { borderColor: 'rgba(47,227,138,1)', duration: 0.5, immediateRender: false }, 1.2);
    tl.fromTo('.s3-sp', { scale: 0.2, opacity: 0.2 }, { scale: 1, opacity: 1, duration: 0.5, stagger: 0.08, ease: 'back.out(3)' }, 1.7);

    /* ---------- 2.2 卡片切换为「版本时间线」 ---------- */
    tl.to('.s3-card', { x: 190, opacity: 0, duration: 0.42, ease: 'power2.in' }, 2.18);
    tl.to('.s3-stamp', { x: 80, opacity: 0, duration: 0.36, ease: 'power2.in' }, 2.2);
    tl.to('.s3-sp', { opacity: 0, duration: 0.3 }, 2.2);

    tl.fromTo('.s3-vr', { opacity: 0, x: 70 },
      { opacity: 1, x: 0, duration: 0.5, stagger: 0.16, ease: 'expo.out' }, 2.34);
    tl.fromTo('.s3-vr--hi .s3-vname', { color: 'rgba(255,255,255,.72)' },
      { color: '#FFFFFF', duration: 0.4, immediateRender: false }, 2.96);

    /* ---------- 3.4 「跨代大版本」金色（update 内打字）+ V5 卡片 ---------- */
    tl.to('.s3-vlist', { x: 90, opacity: 0, duration: 0.4, ease: 'power2.in' }, 3.42);
    tl.fromTo('.s3-gold', { opacity: 0 }, { opacity: 1, duration: 0.3 }, 3.36);
    tl.fromTo('.s3-gold', { y: 18 }, { y: 0, duration: 0.6, ease: 'expo.out' }, 3.36);
    tl.fromTo('.s3-v5card', { opacity: 0, x: 120, scale: 0.94 },
      { opacity: 1, x: 0, scale: 1, duration: 0.66, ease: 'expo.out' }, 3.5);
    tl.fromTo('.s3-v5', { opacity: 0, scale: 1.5, y: 10 },
      { opacity: 1, scale: 1, y: 0, duration: 0.56, ease: 'back.out(2)' }, 3.7);
    tl.fromTo('.s3-v5bar', { scaleX: 0 }, { scaleX: 1, duration: 0.42, ease: 'expo.out' }, 4.0);
    tl.fromTo('.s3-v5card', { borderColor: 'rgba(239,193,78,.3)' }, { borderColor: 'rgba(239,193,78,1)', duration: 0.5, immediateRender: false }, 3.7);

    /* ---------- 4.6 红色书法「不讲武德」 ---------- */
    tl.fromTo('.s3-brush', { opacity: 0, scale: 1.5, rotate: -20, x: 70, y: 40 },
      { opacity: 1, scale: 1, rotate: -8, x: 0, y: 0, duration: 0.34, ease: 'power4.in' }, 4.62);
    tl.fromTo('.s3-brush', { scale: 1.06 }, { scale: 1, duration: 0.26, ease: 'back.out(2.6)', immediateRender: false }, 4.96);
    tl.to('.s3-gold-caret', { opacity: 0, duration: 0.2 }, 4.7);

    /* ---------- 5.0 收尾轻动 ---------- */
    tl.to('.s3-gold', { y: -4, duration: 0.9, ease: 'power2.out' }, 5.1);
    tl.to('.s3-v5card', { y: -5, duration: 0.9, ease: 'power2.out' }, 5.1);
    tl.to('.s3-title', { y: -3, duration: 0.9, ease: 'power2.out' }, 5.1);

    /* ---------- update：金色大字打字机 + 光标 ---------- */
    function update(local) {
      const t0 = 3.46, t1 = 4.12;
      let n = 0;
      if (local >= t1) n = GOLD.length;
      else if (local > t0) n = Math.min(GOLD.length, Math.floor(((local - t0) / (t1 - t0)) * GOLD.length) + 1);
      goldTxt.textContent = GOLD.slice(0, n);
      root.classList.toggle('is-typing', local < t1 && local > t0);
    }

    return { timeline: tl, update };
  },
});
