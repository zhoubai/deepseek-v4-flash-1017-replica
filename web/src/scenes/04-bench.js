/* ============================================================
   SCENE 04 — 官方跑分（31.0 → 37.5s）
   黑绿暗场 × 浅色 macOS 窗口 × 11 项跑分表
   行淡入 / 靛蓝高亮列扫描 / 黄色渐变行 / 超过·接近胶囊 /
   DeepSWE 条形对比浮层 / 1017 印章 / host 头像
   ============================================================ */
Replica.registerScene({
  id: 'bench',
  title: '官方跑分',
  start: 31.0,
  end: 37.5,
  build(root) {
    /* ---------------- 数据（严格照 BUILD_SPEC 附表） ---------------- */
    const HEAD = [
      'Benchmarks',
      'DeepSeek<br>V4.1-Flash-<br>1017',
      'DeepSeek<br>V4.1-Flash',
      'Kimi<br>K3',
      'GLM<br>5.3',
      'GPT<br>5.6-Sol',
      'Claude<br>Opus 5',
    ];
    const ROWS = [
      { n: 'HLE <i>(w/o tools)</i>', v: ['42.6/44.0<i>*</i>', '36.8/39.1<i>*</i>', '43.5', '42.0<i>*</i>', '44.5', '56.3'] },
      { n: 'Terminal-Bench 4.0', v: ['42.3', '31.2', '12.6', '37.9', '39.9', '51.8'] },
      { n: 'DeepSWE v1.1', v: ['77.0', '74.2', '67.5', '66.9', '73.0', '74.0'], hot: true },
      { n: 'ProgramBench', v: ['29.1', '20.3', '17.5', '19.0', '23.0', '37.0'] },
      { n: 'NL2Repo-Bench', v: ['68.2', '65.4', '58.0', '58.0', '56.8', '75.3'] },
      { n: 'Automation-Bench<br>V1.0.6', v: ['60.5', '54.8', '46.7', '48.8', '45.8', '50.3'], hot: true },
      { n: "Agents' Last Exam", v: ['35.4', '31.8', '27.6', '28.5', '26.7', '28.6'], hot: true },
      { n: 'Apex Bench v1.1', v: ['72.1', '64.6', '47.8', '56.6', '54.3', '65.8'], hot: true },
      { n: 'Chartography<br><i>(w/tools)</i>', v: ['83.0', '78.9', '68.1', '-', '79.9', '84.0'] },
      { n: 'BabyVision<br><i>(w/tools)</i>', v: ['92.5', '89.6', '85.7', '-', '88.9', '94.1'] },
      { n: 'ZeroBench-main<br><i>(w/tools)</i>', v: ['51.0', '49.0', '41.0', '-', '53.0', '52.0'] },
    ];

    const headHTML = HEAD.map(function (t, i) {
      const tag = i === 6 ? '<span class="s4-gtag s4-gtag--claude"></span>' : '';
      return '<div class="s4-c s4-c' + (i + 1) + ' s4-c--h">' + tag +
        '<span class="s4-ht">' + t + '</span></div>';
    }).join('');

    const rowsHTML = ROWS.map(function (r, i) {
      const cells = r.v.map(function (v, j) {
        return '<div class="s4-c s4-c' + (j + 2) + ' s4-v"><span>' + v + '</span></div>';
      }).join('');
      return '<div class="s4-r' + (r.hot ? ' s4-r--hot' : '') + '" data-i="' + i + '">' +
        (r.hot ? '<span class="s4-hotbg"></span>' : '') +
        '<div class="s4-c s4-c1 s4-lab"><span class="s4-lab-in">' + r.n + '</span></div>' +
        cells + '</div>';
    }).join('');

    const hlPath = 'M22,4 H85 A18,18 0 0 1 103,22 V473 A18,18 0 0 1 85,491 H22 A18,18 0 0 1 4,473 V22 A18,18 0 0 1 22,4 Z';
    const body = `
      <div class="s4-tbl">
        <div class="s4-hl s4-hl--fill">
          <svg viewBox="0 0 107 495" preserveAspectRatio="none">
            <path class="s4-hl-fill" d="${hlPath}"/>
          </svg>
        </div>
        <div class="s4-r s4-r--head">${headHTML}</div>
        ${rowsHTML}
        <div class="s4-hl s4-hl--stroke">
          <svg viewBox="0 0 107 495" preserveAspectRatio="none">
            <path class="s4-hl-rect" d="${hlPath}"/>
          </svg>
          <span class="s4-hl-scan"></span>
        </div>
      </div>`;

    root.innerHTML = `
      <div class="bg bg-hex"></div>
      <div class="vignette"></div>
      <div class="s4-stage">
        ${UI.win({
          title: 'DeepSeek V4.1 Flash 1017 · 官方跑分 11 项',
          tone: 'light', left: 48, top: 44, width: 662, height: 529,
          cls: 's4-win', body: body,
        })}

        <div class="s4-pill s4-pill--over"><i></i>超过</div>
        <div class="s4-pill s4-pill--near"><i></i>接近</div>

        <div class="s4-cmp">
          <div class="s4-cmp-h"><b>DeepSWE v1.1</b><span>真实代码修复 · 表中一行</span></div>
          <div class="s4-cmp-row">
            <div class="s4-cmp-l">DeepSeek V4.1 Flash 1017</div>
            <div class="s4-cmp-b">
              <i class="s4-cmp-tr"><i class="s4-cmp-fi s4-fi--blue"></i></i>
              <b class="s4-cmp-n" data-val="77.0">0.0</b>
            </div>
          </div>
          <div class="s4-cmp-row">
            <div class="s4-cmp-l">Claude Opus 5</div>
            <div class="s4-cmp-b">
              <i class="s4-cmp-tr"><i class="s4-cmp-fi s4-fi--gray"></i></i>
              <b class="s4-cmp-n" data-val="74.0">0.0</b>
            </div>
          </div>
        </div>

        ${UI.avatar({ kind: 'host', size: 150, left: 1040, top: 97, cls: 's4-avatar' })}
        ${UI.stamp({ size: 150, rotate: -14, left: 786, top: 116, cls: 's4-stamp' })}
      </div>
    `;

    /* ---------------- 元素引用 ---------------- */
    const win = root.querySelector('.s4-win');
    const hlFill = root.querySelector('.s4-hl-fill');
    const hlRect = root.querySelector('.s4-hl-rect');
    const scan = root.querySelector('.s4-hl-scan');
    const head = root.querySelector('.s4-r--head');
    const rows = Array.from(root.querySelectorAll('.s4-r:not(.s4-r--head)'));
    const hotBgs = Array.from(root.querySelectorAll('.s4-hotbg'));
    const gClaude = root.querySelector('.s4-gtag--claude');
    const pills = Array.from(root.querySelectorAll('.s4-pill'));
    const cmp = root.querySelector('.s4-cmp');
    const cmpRows = Array.from(root.querySelectorAll('.s4-cmp-row'));
    const av = root.querySelector('.s4-avatar');
    const stamp = root.querySelector('.s4-stamp');

    /* SVG 描边长度（描边动画可被 seek 驱动） */
    const hlLen = hlRect.getTotalLength();
    gsap.set(hlRect, { strokeDasharray: hlLen + ' ' + (hlLen + 12), strokeDashoffset: hlLen });
    gsap.set(hlFill, { opacity: 0 });

    const tl = gsap.timeline({ paused: true });

    /* 初始状态 */
    tl.set(win, { opacity: 0, y: 74, scale: 0.965 }, 0);
    tl.set(scan, { opacity: 0, y: -70 }, 0);
    tl.set(gClaude, { opacity: 0, scale: 0.86 }, 0);
    tl.set(pills, { opacity: 0, scale: 0.6, x: -18 }, 0);
    tl.set(cmp, { opacity: 0, x: 96 }, 0);
    tl.set(cmpRows, { opacity: 0, y: 10 }, 0);
    tl.set(av, { opacity: 0, x: 60, y: -20, scale: 0.8 }, 0);
    tl.set(stamp, { opacity: 0, scale: 2.4, rotate: -52 }, 0);
    tl.set(head, { opacity: 0, y: -10 }, 0);
    tl.set(rows, { opacity: 0, x: -16 }, 0);
    tl.set(hotBgs, { opacity: 0 }, 0);

    const bar0 = cmpRows[0].querySelector('.s4-cmp-fi');
    const bar1 = cmpRows[1].querySelector('.s4-cmp-fi');
    const n0 = cmpRows[0].querySelector('.s4-cmp-n');
    const n1 = cmpRows[1].querySelector('.s4-cmp-n');
    gsap.set([bar0, bar1], { scaleX: 0, transformOrigin: '0% 50%' });

    /* ---------------- 窗口入场 ---------------- */
    tl.to(win, { opacity: 1, y: 0, scale: 1, duration: 0.78, ease: 'expo.out' }, 0.14);
    tl.to(av, { opacity: 1, x: 0, y: 0, scale: 1, duration: 0.72, ease: 'expo.out' }, 0.30);
    tl.to(av, { y: 8, duration: 2.8, ease: 'sine.inOut', yoyo: true, repeat: -1 }, 1.2);

    /* ---------------- 表头 + 行淡入 ---------------- */
    tl.to(head, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 0.58);
    tl.to(rows, { opacity: 1, x: 0, duration: 0.5, ease: 'power2.out', stagger: 0.115 }, 0.78);

    /* ---------------- 靛蓝高亮列：填充 + 描边扫描 ---------------- */
    tl.to(hlFill, { opacity: 1, duration: 0.45, ease: 'power1.out' }, 1.52);
    tl.to(hlRect, { strokeDashoffset: 0, duration: 0.82, ease: 'power2.inOut' }, 1.58);
    tl.fromTo(scan, { opacity: 0, y: -60 }, { opacity: 0.85, y: 430, duration: 0.75, ease: 'power1.inOut' }, 1.62);
    tl.to(scan, { opacity: 0, duration: 0.22 }, 2.34);

    /* ---------------- 黄色渐变行 ---------------- */
    tl.to(hotBgs, { opacity: 1, duration: 0.5, stagger: 0.1, ease: 'power1.out' }, 2.30);

    /* ---------------- 胶囊 ---------------- */
    tl.to(pills, { opacity: 1, scale: 1, x: 0, duration: 0.46, ease: 'back.out(2.6)', stagger: 0.13 }, 2.62);
    tl.to(pills, { y: -4, duration: 1.9, ease: 'sine.inOut', yoyo: true, repeat: -1 }, 3.3);

    /* ---------------- 绿色表头（Claude / GPT） ---------------- */
    tl.to(gClaude, { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(2.2)' }, 2.02);

    /* ---------------- 右侧条形对比浮层 ---------------- */
    tl.to(cmp, { opacity: 1, x: 0, duration: 0.55, ease: 'expo.out' }, 3.18);
    tl.to(cmpRows, { opacity: 1, y: 0, duration: 0.4, stagger: 0.1, ease: 'power2.out' }, 3.34);

    const b0 = { v: 0 }, b1 = { v: 0 };
    tl.to(bar0, { scaleX: 1, duration: 0.62, ease: 'power3.out' }, 3.40);
    tl.to(bar1, { scaleX: 1, duration: 0.62, ease: 'power3.out' }, 3.54);
    tl.to(b0, { v: 77.0, duration: 0.6, ease: 'power2.out', onUpdate: function () { n0.textContent = b0.v.toFixed(1); } }, 3.40);
    tl.to(b1, { v: 74.0, duration: 0.6, ease: 'power2.out', onUpdate: function () { n1.textContent = b1.v.toFixed(1); } }, 3.54);
    tl.to(bar0, { opacity: 0.72, duration: 0.8, yoyo: true, repeat: -1, ease: 'sine.inOut' }, 4.4);

    /* ---------------- 1017 印章 ---------------- */
    tl.to(stamp, { opacity: 0.94, scale: 1, rotate: -14, duration: 0.3, ease: 'power4.in' }, 4.22);
    tl.fromTo(stamp, { scale: 1.09 }, { scale: 1, duration: 0.24, ease: 'back.out(2.2)' }, 4.52);
    tl.to(win, { x: 2, duration: 0.07, yoyo: true, repeat: 1, ease: 'none' }, 4.52);
    tl.to(win, { x: 0, duration: 0.18 }, 4.66);

    /* ---------------- 保持：命中行脉冲 + 高亮列呼吸 + 镜头轻推 ---------------- */
    tl.to(hotBgs, { opacity: 0.82, duration: 1.0, stagger: 0.08, yoyo: true, repeat: -1, ease: 'sine.inOut' }, 4.9);
    tl.to(hlFill, { opacity: 0.58, duration: 1.3, yoyo: true, repeat: -1, ease: 'sine.inOut' }, 4.9);
    tl.to('.s4-stage', { scale: 1.006, duration: 2.2, ease: 'none' }, 4.7);

    return { timeline: tl };
  },
});
