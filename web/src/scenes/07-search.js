/* ============================================================
   SCENE 07-search — Search & Fetch API（57.5 → 68.0s）
   官方推文卡 × API 文档浮层（荧光笔）× 「我的 Agent → DeepSeek API
   → 官方联网搜索」三卡 pipeline（霓虹描边 / 流动连线 / sparkle）
   ============================================================ */
Replica.registerScene({
  id: 'search',
  title: '搜索与抓取 API',
  start: 57.5,
  end: 68.0,
  build(root) {
    const SPARK = '<svg viewBox="0 0 24 24"><path d="M12 0c.7 6 5.3 10.6 11.3 11.3C17.3 12 12.7 16.6 12 22.6 11.3 16.6 6.7 12 .7 11.3 6.7 10.6 11.3 6 12 0z" fill="currentColor"/></svg>';

    root.innerHTML = `
      <div class="bg bg-hex"></div>
      <div class="sch-ambient"></div>
      <div class="sch-cam">

        <div class="sch-tweet">
          <div class="sch-tw-head">
            <div class="sch-tw-avatar"><img src="assets/scenes/dark/deepseek-whale.png" alt=""></div>
            <div class="sch-tw-id">
              <div class="sch-tw-name">DeepSeek<span class="sch-tw-badge"></span></div>
              <div class="sch-tw-handle">@deepseek_ai</div>
            </div>
          </div>
          <div class="sch-tw-body">Search &amp; Fetch APIs are now open to everyone!</div>
          <div class="sch-tw-meta"><span>下午4:35</span><i>·</i><span>2026年10月17日</span><i>·</i><span>官方推文 3/4</span></div>
        </div>

        <div class="sch-note"><i></i><span>还有一个关键动作</span></div>

        ${UI.win({
          tone: 'light',
          title: 'API 文档 · 网页搜索与抓取',
          left: 62, top: 59, width: 365, height: 127,
          cls: 'sch-doc-win',
          body: `
            <h3 class="sch-doc-h">网页搜索与抓取</h3>
            <p class="sch-doc-p">Search 接口和 Fetch 接口为 Agent 与 RAG 应用提供实时网页内容：</p>
            <div class="sch-hlrow"><i class="sch-hl"></i><span>• <b>Search 接口</b>按 query 搜索网页，返回结构化结果。该接口由 DeepSeek 自研搜索引擎独家提供支持</span></div>
            <div class="sch-hlrow"><i class="sch-hl"></i><span>• <b>Fetch 接口</b>抓取单个网页，以 Markdown 文本返回页面内容。</span></div>
            <p class="sch-doc-p sch-doc-p--last">两者都是原始 JSON API，使用与 DeepSeek API 相同的 Bearer 鉴权。</p>
          `,
        })}

        <div class="sch-link sch-link--1"><i class="sch-link-line"></i><i class="sch-link-flow"></i><i class="sch-link-spark"></i></div>
        <div class="sch-link sch-link--2"><i class="sch-link-line"></i><i class="sch-link-flow"></i><i class="sch-link-spark"></i></div>

        <div class="sch-pill sch-pill--1"><i class="sch-pill-dot"></i><span>调用接口</span></div>
        <div class="sch-pill sch-pill--2"><i class="sch-pill-dot"></i><span>接入搜索</span></div>

        <div class="sch-card sch-card--agent">
          <div class="sch-card-glow"></div>
          <div class="sch-ico">
            <svg viewBox="0 0 48 42" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
              <rect x="7" y="11" width="34" height="25" rx="8"/>
              <path d="M24 11V5.6"/>
              <circle cx="24" cy="4.4" r="1.9" fill="currentColor" stroke="none"/>
              <circle cx="17.5" cy="23" r="2.3" fill="currentColor" stroke="none"/>
              <circle cx="30.5" cy="23" r="2.3" fill="currentColor" stroke="none"/>
              <path d="M17 31h14"/>
            </svg>
          </div>
          <div class="sch-card-title">我的 Agent</div>
          <div class="sch-card-sub">your agent</div>
        </div>

        <div class="sch-card sch-card--api">
          <div class="sch-card-glow"></div>
          <div class="sch-ico"><img src="assets/scenes/dark/deepseek-whale.png" alt=""></div>
          <div class="sch-card-title">DeepSeek API</div>
          <div class="sch-card-sub">deepseek-flash</div>
        </div>

        <div class="sch-card sch-card--search">
          <div class="sch-card-glow"></div>
          <div class="sch-ico">
            <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round">
              <circle cx="24" cy="24" r="18.2"/>
              <ellipse cx="24" cy="24" rx="8.2" ry="18.2"/>
              <path d="M6.8 17.4h34.4M6.8 30.6h34.4"/>
            </svg>
          </div>
          <div class="sch-card-title">官方联网搜索</div>
          <div class="sch-card-sub">Search · Fetch</div>
        </div>

        <div class="sch-sparkles">
          <div class="sch-spark" style="left:392px;top:352px;width:15px;height:15px">${SPARK}</div>
          <div class="sch-spark" style="left:642px;top:472px;width:12px;height:12px">${SPARK}</div>
          <div class="sch-spark" style="left:846px;top:300px;width:14px;height:14px">${SPARK}</div>
          <div class="sch-spark" style="left:1088px;top:452px;width:14px;height:14px">${SPARK}</div>
          <div class="sch-spark" style="left:1102px;top:300px;width:18px;height:18px">${SPARK}</div>
          <div class="sch-spark" style="left:806px;top:476px;width:11px;height:11px">${SPARK}</div>
        </div>

        ${UI.avatar({ kind: 'host', size: 146, left: 1064, top: 118, cls: 'sch-avatar' })}
      </div>
      <div class="sch-scan"></div>
      <div class="vignette"></div>
    `;

    const tl = gsap.timeline({ paused: true });

    /* ---------- 常驻：相机轻推 / 环境呼吸 / 扫描线 / 头像 ---------- */
    tl.fromTo('.sch-cam', { scale: 1.0, y: 0 }, { scale: 1.02, y: -8, duration: 10.5, ease: 'none' }, 0);
    tl.fromTo('.sch-ambient', { opacity: .55, scale: 1 }, { opacity: 1, scale: 1.13, duration: 4.6, ease: 'sine.inOut', yoyo: true, repeat: -1 }, 0);
    tl.fromTo('.sch-scan', { y: -180 }, { y: 720, duration: 6.2, ease: 'none', repeat: -1 }, .5);

    tl.fromTo('.sch-avatar', { opacity: 0, x: 90, y: -26, scale: .72 },
      { opacity: 1, x: 0, y: 0, scale: 1, duration: .75, ease: 'expo.out' }, .12);
    tl.to('.sch-avatar', { y: 8, duration: 2.8, ease: 'sine.inOut', yoyo: true, repeat: -1 }, 1.1);

    /* ---------- 1. 官方推文卡 ---------- */
    tl.fromTo('.sch-tweet', { opacity: 0, y: -78, scale: .985 },
      { opacity: 1, y: 0, scale: 1, duration: .8, ease: 'expo.out' }, .05);
    tl.fromTo('.sch-tw-head', { opacity: 0, y: -8 }, { opacity: 1, y: 0, duration: .3 }, .1);
    tl.fromTo('.sch-tw-body', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: .32 }, .16);
    tl.fromTo('.sch-tw-meta', { opacity: 0 }, { opacity: 1, duration: .3 }, .24);

    /* ---------- 2. API 文档浮层：大窗缩进左上角 + 荧光笔刷 ---------- */
    tl.set('.sch-doc-win', { opacity: 0, scale: 1.97, x: 190, y: 287 }, 0);
    tl.set('.sch-doc-win .win-body', { opacity: 0 }, 0);
    tl.set('.sch-hl', { scaleX: 0 }, 0);
    tl.to('.sch-doc-win', { opacity: 1, duration: .34, ease: 'power1.out' }, 1.2);
    tl.to('.sch-doc-win', { scale: 1, x: 0, y: 0, duration: 1.72, ease: 'power3.out' }, 1.2);
    tl.fromTo('.sch-doc-win .win-body', { opacity: 0 }, { opacity: 1, duration: .42, ease: 'power1.out' }, 1.36);
    tl.to('.sch-hl', { scaleX: 1, duration: .4, ease: 'power2.out', stagger: .24 }, 2.32);

    /* 推文卡让位 */
    tl.to('.sch-tweet', { opacity: 0, y: -56, duration: .54, ease: 'power2.in' }, 1.76);

    /* 标注胶囊 */
    tl.fromTo('.sch-note', { opacity: 0, y: 14, scale: .9 }, { opacity: 1, y: 0, scale: 1, duration: .42, ease: 'back.out(1.8)' }, .92);
    tl.to('.sch-note', { opacity: 0, y: -18, duration: .45, ease: 'power2.in' }, 2.5);

    /* ---------- 3. 「我的 Agent」卡 ---------- */
    tl.fromTo('.sch-card--agent', { opacity: 0, scale: .84, y: 28 },
      { opacity: 1, scale: 1, y: 0, duration: .72, ease: 'back.out(1.45)' }, 2.9);
    tl.fromTo('.sch-card--agent .sch-ico', { opacity: 0, scale: .55, rotate: -14 },
      { opacity: 1, scale: 1, rotate: 0, duration: .5, ease: 'back.out(2.2)' }, 3.16);
    tl.fromTo('.sch-card--agent .sch-card-title', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: .38 }, 3.24);
    tl.fromTo('.sch-card--agent .sch-card-sub', { opacity: 0 }, { opacity: 1, duration: .38 }, 3.34);

    /* ---------- 4. 连线 1 + DeepSeek API 卡 ---------- */
    tl.fromTo('.sch-link--1 .sch-link-line', { scaleX: 0 }, { scaleX: 1, duration: .52, ease: 'power3.out' }, 4.62);
    tl.fromTo('.sch-card--api', { opacity: 0, scale: .84, y: 28 },
      { opacity: 1, scale: 1, y: 0, duration: .72, ease: 'back.out(1.45)' }, 4.5);
    tl.fromTo('.sch-card--api .sch-ico', { opacity: 0, scale: .55, rotate: 12 },
      { opacity: 1, scale: 1, rotate: 0, duration: .5, ease: 'back.out(2.2)' }, 4.76);
    tl.fromTo('.sch-card--api .sch-card-title', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: .38 }, 4.84);
    tl.fromTo('.sch-card--api .sch-card-sub', { opacity: 0 }, { opacity: 1, duration: .38 }, 4.94);
    tl.fromTo('.sch-pill--1', { opacity: 0, y: 14, scale: .86 }, { opacity: 1, y: 0, scale: 1, duration: .46, ease: 'back.out(1.8)' }, 5.14);
    tl.fromTo('.sch-link--1 .sch-link-flow', { opacity: 0 }, { opacity: .55, duration: .4 }, 5.0);
    tl.fromTo('.sch-link--1 .sch-link-flow', { x: 0 }, { x: -26, duration: .7, ease: 'none', repeat: -1 }, 5.0);
    tl.fromTo('.sch-link--1 .sch-link-spark', { x: -8, opacity: 0 }, { x: 161, opacity: 1, duration: 1.5, ease: 'sine.inOut', repeat: -1 }, 5.1);

    /* ---------- 5. 连线 2 + 官方联网搜索卡 + sparkle ---------- */
    tl.fromTo('.sch-card--search', { opacity: 0, scale: .84, y: 28 },
      { opacity: 1, scale: 1, y: 0, duration: .72, ease: 'back.out(1.45)' }, 6.32);
    tl.fromTo('.sch-card--search .sch-ico', { opacity: 0, scale: .5, rotate: -18 },
      { opacity: 1, scale: 1, rotate: 0, duration: .55, ease: 'back.out(2.2)' }, 6.58);
    tl.fromTo('.sch-card--search .sch-card-title', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: .38 }, 6.68);
    tl.fromTo('.sch-card--search .sch-card-sub', { opacity: 0 }, { opacity: 1, duration: .38 }, 6.78);
    tl.fromTo('.sch-link--2 .sch-link-line', { scaleX: 0 }, { scaleX: 1, duration: .5, ease: 'power3.out' }, 6.6);
    tl.fromTo('.sch-pill--2', { opacity: 0, y: 14, scale: .86 }, { opacity: 1, y: 0, scale: 1, duration: .46, ease: 'back.out(1.8)' }, 7.02);
    tl.fromTo('.sch-link--2 .sch-link-flow', { opacity: 0 }, { opacity: .55, duration: .4 }, 6.9);
    tl.fromTo('.sch-link--2 .sch-link-flow', { x: 0 }, { x: -26, duration: .66, ease: 'none', repeat: -1 }, 6.9);
    tl.fromTo('.sch-link--2 .sch-link-spark', { x: -8, opacity: 0 }, { x: 130, opacity: 1, duration: 1.35, ease: 'sine.inOut', repeat: -1 }, 7.0);

    /* sparkle 爆点 */
    tl.set('.sch-spark', { opacity: 0, scale: 0, rotate: 0 }, 0);
    tl.to('.sch-spark', { opacity: 1, scale: 1, rotate: 40, duration: .26, ease: 'back.out(3)', stagger: .07 }, 7.1);
    tl.to('.sch-spark', { opacity: 0, scale: 1.9, rotate: 90, duration: .62, ease: 'power2.out', stagger: .07 }, 7.55);

    /* ---------- 6. 保持阶段：霓虹呼吸 / 文档漂浮 / sparkle 闪烁 ---------- */
    tl.fromTo('.sch-card--agent .sch-card-glow', { opacity: .38 }, { opacity: .95, duration: 1.5, ease: 'sine.inOut', yoyo: true, repeat: -1 }, 8.0);
    tl.fromTo('.sch-card--api .sch-card-glow', { opacity: .38 }, { opacity: .95, duration: 1.5, ease: 'sine.inOut', yoyo: true, repeat: -1 }, 8.2);
    tl.fromTo('.sch-card--search .sch-card-glow', { opacity: .4 }, { opacity: 1, duration: 1.4, ease: 'sine.inOut', yoyo: true, repeat: -1 }, 8.4);
    tl.fromTo('.sch-doc-win', { y: 0 }, { y: 3, duration: 2.4, ease: 'sine.inOut', yoyo: true, repeat: -1 }, 8.0);
    tl.fromTo('.sch-spark', { opacity: 0, scale: 1, rotate: 0 }, { opacity: .85, scale: 1.08, rotate: 35, duration: .9, ease: 'sine.inOut', yoyo: true, repeat: -1, stagger: .16 }, 8.1);

    /* 保持阶段：卡片描边流光（内阴影 sweep） */
    tl.fromTo('.sch-card--search', { filter: 'brightness(1)' }, { filter: 'brightness(1.12)', duration: 1.7, ease: 'sine.inOut', yoyo: true, repeat: -1 }, 8.6);

    /* ---------- 逐帧纯函数：hold 阶段整体加亮标记 ---------- */
    function update(local) {
      const hold = local >= 8.0;
      if (hold !== root.classList.contains('sch-hold')) root.classList.toggle('sch-hold', hold);
    }

    return { timeline: tl, update };
  },
});
