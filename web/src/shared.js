/* ============================================================
   SHARED UI — 复刻片中反复出现的组件
   UI.stamp() / UI.avatar() / UI.win() / UI.sticker() / UI.splitChars()
   所有 HTML 字符串使用文档相对路径（index.html 所在目录为基准）
   ============================================================ */
(function () {
  'use strict';
  const UI = (window.UI = {});

  let _uid = 0;

  /* ---------------- 1017 印章 ---------------- */
  /**
   * UI.stamp({ size=150, ink='indigo'|'red', rotate=-15, left, top, cls })
   * 返回绝对定位的印章 HTML（配合自身尺寸控制位置）
   */
  UI.stamp = function (opt) {
    opt = opt || {};
    const size = opt.size || 150;
    const ink = opt.ink === 'red' ? 'stamp--red' : 'stamp--indigo';
    const rotate = opt.rotate == null ? -14 : opt.rotate;
    const left = opt.left || 0;
    const top = opt.top || 0;
    const id = 'st' + (++_uid);
    const ring = opt.ring || 'DEEPSEEK · V4.1 · OCT 17 · RELEASE · HASH · 2026 · ';
    return `
      <div class="stamp-wrap ${opt.cls || ''}" style="left:${left}px;top:${top}px;width:${size}px;height:${size}px;transform:rotate(${rotate}deg)">
        <svg class="stamp ${ink}" viewBox="0 0 200 200">
          <defs>
            <path id="${id}p" d="M100,100 m-83,0 a83,83 0 1,1 166,0 a83,83 0 1,1 -166,0"/>
            <filter id="${id}f" x="-10%" y="-10%" width="120%" height="120%">
              <feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="${(opt.seed || 4)}" result="n"/>
              <feDisplacementMap in="SourceGraphic" in2="n" scale="1.5" xChannelSelector="R" yChannelSelector="G"/>
            </filter>
          </defs>
          <g filter="url(#${id}f)" opacity=".9">
            <circle cx="100" cy="100" r="95" fill="none" stroke="currentColor" stroke-width="5"/>
            <circle cx="100" cy="100" r="90" fill="none" stroke="currentColor" stroke-width="1.1" opacity=".7"/>
            <circle cx="100" cy="100" r="71.5" fill="none" stroke="currentColor" stroke-width="2.6"/>
            <circle cx="100" cy="100" r="68" fill="none" stroke="currentColor" stroke-width=".9" opacity=".55" stroke-dasharray="2 3.4"/>
            <text class="ring-text"><textPath href="#${id}p" startOffset="0">${ring}${ring}</textPath></text>
            <text class="center-small" x="100" y="70" text-anchor="middle">OCT · SAT</text>
            <line x1="47" y1="80" x2="153" y2="80" stroke="currentColor" stroke-width="1.5"/>
            <text class="center-big" x="100" y="113" text-anchor="middle">1017</text>
            <line x1="38" y1="123" x2="162" y2="123" stroke="currentColor" stroke-width="1.5"/>
            <text class="center-small" x="100" y="141" text-anchor="middle">RELEASE</text>
          </g>
        </svg>
      </div>`;
  };

  /* ---------------- 圆形头像 ---------------- */
  /**
   * UI.avatar({ kind:'host'|'ds', size, left, top, cls })
   */
  // host 头像在原片中每场都是同一个位置/大小：视觉环外径 205px，中心 (1140,192)
  UI.AVATAR_HOST = { size: 200, left: 1040, top: 92 };
  UI.avatar = function (opt) {
    opt = opt || {};
    const kind = opt.kind === 'ds' ? 'ds' : 'host';
    const free = opt.free === true;          // 需要自由定位时传 free:true
    const canon = UI.AVATAR_HOST;
    const size = free ? (opt.size || 140) : canon.size;
    const left = free ? (opt.left || 0) : canon.left;
    const top = free ? (opt.top || 0) : canon.top;
    const src = kind === 'ds' ? 'assets/img/ds-avatar.png' : 'assets/img/host-avatar.png';
    return `<div class="avatar avatar--${kind} ${opt.cls || ''}"
      style="left:${left}px;top:${top}px;width:${size}px;height:${size}px">
      <img src="${src}" alt=""></div>`;
  };

  /* ---------------- macOS 窗口 ---------------- */
  /**
   * UI.win({ title, tone:'dark'|'light', left, top, width, height, body, cls, bar })
   */
  UI.win = function (opt) {
    opt = opt || {};
    return `<div class="win ${opt.tone === 'light' ? 'win--light' : ''} ${opt.cls || ''}"
      style="left:${opt.left || 0}px;top:${opt.top || 0}px;width:${opt.width || 520}px;height:${opt.height || 300}px">
      <div class="win-bar"><span class="win-dots"><i></i><i></i><i></i></span><span class="win-title">${opt.title || 'DeepSeek'}</span></div>
      <div class="win-body" style="height:calc(100% - 34px)">${opt.body || ''}</div>
    </div>`;
  };

  /* ---------------- 贴纸文字 ---------------- */
  /**
   * UI.sticker('周末', { size:96, fill:'#FDFCF3', stroke:'#233B2B', sw:16, rotate, style, cls })
   * fill/stroke 支持 CSS 变量
   */
  UI.sticker = function (text, opt) {
    opt = opt || {};
    const size = opt.size || 96;
    const sw = opt.sw == null ? Math.round(size * 0.115) : opt.sw;
    const st = [];
    if (opt.rotate != null) st.push('transform:rotate(' + opt.rotate + 'deg)');
    if (opt.style) st.push(opt.style);
    return `<span class="sticker ${opt.cls || ''}" style="
        --sf:${opt.fill || 'var(--cream)'};--sk:${opt.stroke || 'var(--paper-ink)'};--sw:${sw}px;
        font-size:${size}px;${st.join(';')}"><span class="st-outline" aria-hidden="true">${text}</span><span class="st-fill">${text}</span></span>`;
  };

  /* ---------------- 文本拆分（逐字动画用） ---------------- */
  /**
   * UI.splitChars(el) → 返回字符 span 数组。
   * 会保留原有文本节点顺序，逐个包裹 <span class="ch">。
   */
  UI.splitChars = function (el) {
    const out = [];
    const walk = function (node) {
      Array.from(node.childNodes).forEach(function (child) {
        if (child.nodeType === 3) {
          const text = child.textContent;
          if (!text.trim() && !out.length) return;
          const frag = document.createDocumentFragment();
          for (const chr of Array.from(text)) {
            if (chr === ' ') {
              const sp = document.createElement('span');
              sp.className = 'ch';
              sp.style.display = 'inline-block';
              sp.innerHTML = '&nbsp;';
              frag.appendChild(sp);
            } else {
              const sp = document.createElement('span');
              sp.className = 'ch';
              sp.style.display = 'inline-block';
              sp.style.willChange = 'transform,opacity';
              sp.textContent = chr;
              out.push(sp);
              frag.appendChild(sp);
            }
          }
          node.replaceChild(frag, child);
        } else if (child.nodeType === 1) {
          walk(child);
        }
      });
    };
    walk(el);
    return out;
  };

  /* ---------------- 小工具 ---------------- */
  UI.h = function (html) {
    const t = document.createElement('template');
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  };
  UI.clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  UI.lerp = function (a, b, t) { return a + (b - a) * t; };

  /* ---------------- 常用文内高亮 ---------------- */
  UI.hl = function (text, cls) { return '<em class="' + (cls || 'hl-g') + '">' + text + '</em>'; };
})();
