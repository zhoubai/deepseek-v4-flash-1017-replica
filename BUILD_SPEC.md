# BUILD_SPEC — 复刻项目协作规范

> 目标：用 HTML / CSS / GSAP 复刻抖音视频《DeepSeek 新模型硬刚 Opus 5.5》里全部动效与前端画面。
> 原片已下载到 `video/source.mp4`（1280×720, 90.3s），逐帧参考图在 `project/keyframes_all/s_001.jpg … s_090.jpg`（1fps, 对应 t=1…90s），高清关键帧在 `project/keyframes/`。
> 复刻网页在 `web/`，打开方式：直接双击 `web/index.html`，或 Playwright 截图。

---

## 1. 文件所有权（务必只改自己的文件）

| 角色 | 只允许写 |
|---|---|
| Lead | `web/index.html`、`web/src/{tokens,base,engine,shared,captions,main}.{css,js}`、`web/src/scenes/00-weekend.*`、`tools/*` |
| paper-scenes | `web/src/scenes/01-today.{js,css}`、`03-naming.{js,css}`、`06-news.{js,css}`、`web/assets/scenes/paper/*` |
| dark-scenes | `web/src/scenes/02-release.{js,css}`、`07-search.{js,css}`、`10-finale.{js,css}`、`web/assets/scenes/dark/*` |
| data-scenes | `web/src/scenes/04-bench.{js,css}`、`05-chart.{js,css}`、`08-tested.{js,css}`、`web/assets/scenes/data/*` |
| compare-scene | `web/src/scenes/09-compare.{js,css}`、`web/assets/scenes/compare/*` |

不要修改共享文件（base.css / shared.js / engine.js / captions.js / index.html）。需要共享组件改动 → 发消息给 Lead。
每个场景 **文件名已固定并已在 index.html 中引入**，直接重写占位文件即可。

---

## 2. 引擎契约

```js
Replica.registerScene({
  id: 'today',              // 固定 id，不可改
  title: '就在今天',
  start: 8.5,               // 固定，不可改
  end: 16.0,                // 固定，不可改
  build(root) {
    root.innerHTML = `<div class="bg bg-paper"></div> …自己的 DOM…`;

    const tl = gsap.timeline({ paused: true });
    tl.fromTo('.s2-title', { opacity: 0, x: -120 }, { opacity: 1, x: 0, duration: .6 }, 0.2);

    // 可选：纯函数式状态（文字切换、颜色等）。local = 场景内秒数。
    function update(local) { /* ... */ }

    return { timeline: tl, update };
  },
});
```

- `root` 就是 `.scene.scene--<id>` 容器，尺寸 1280×720，绝对定位，默认 `visibility:hidden`；引擎自动切换 `is-active`。
- 时间轴 `tl` **必须 paused**；引擎用 `tl.time(local)` 精确 seek。**禁止**用 `requestAnimationFrame`、`setTimeout`、CSS `@keyframes`、CSS `transition` 做编排——它们无法逐帧回放。
- 需要循环动效（漂浮、呼吸、流光）用 GSAP `repeat:-1` 的 tween，可被 seek。
- 需要逐帧 canvas 用 `update(local)` 内按 local 纯函数绘制（使用固定 seed 的伪随机）。
- 所有动画开始前请把初始状态写好（`gsap.set` 或 CSS），保证 local=0 时画面正确；常见写法：`tl.set(...)` 放在 0 位置。
- 字幕由引擎统一渲染，场景内不要做字幕条。
- 背景用共享 class：`<div class="bg bg-paper"></div>` / `bg-hex` / `bg-studio` / `bg-finale`，可加 `<div class="vignette"></div>`。

### 共享组件（window.UI，shared.js）

```js
UI.stamp({ size: 168, ink: 'indigo'|'red', rotate: -17, left: 762, top: 322, cls: 'cls名' })
   → 1017 圆形印章（绝对定位；cls 用于 GSAP 选择器，注意其初始 transform 含 rotate，
     要 GSAP 动旋转请 fromTo rotate: -46 → -17，不要写 rotate:0）

UI.avatar({ kind: 'host'|'ds', size: 146, left: 1064, top: 118, cls: 's2-avatar' })
   → 圆形头像（host=up主照片，ds=DeepSeek logo）

UI.win({ title: 'DeepSeek', tone: 'dark'|'light', left, top, width, height, body: '<html>', cls })
   → macOS 窗口（含红黄绿点 + 标题栏）

UI.sticker('周末', { size: 118, sw: 22, fill:'var(--card)', stroke:'var(--paper-ink)', rotate:-1.2, cls })
   → 贴纸文字（白色填充+墨绿描边+纸片投影），size 为字号，sw 为描边总宽（可见约 sw/2）

UI.splitChars(el) → 把 el 内文字拆成逐字 span 数组（逐字入场用）
UI.h(html) → HTML 字符串转元素
```

### 常用 CSS 变量 / 颜色

`--paper --card --cream --paper-ink(#233B2B) --paper-ink-2 --dark --green(#2FE38A) --green-2 --indigo(#4E5BD6) --indigo-2 --red(#D23A31) --red-2 --gold(#FFC93C) --blue(#4D6BFE) --cyan(#4FE4FF) --purple(#B57BFF)`
字体：`--font`（Noto Sans SC 可变字重，100–900）、`--serif`（Playfair Display）、`--mono`、`--brush`。
共享 class：`.paper-card`、`.tape`、`.win`、`.win-bar`、`.win-dots`、`.win-title`、`.win-body`、`.pill`、`.pill-dot`、`.avatar`、`.stamp-wrap`、`.stamp`、`.sticker`、`.bg-*`、`.vignette`、`.caption`。

---

## 3. 画面规范

- 设计坐标系 **1280 × 720**，直接写 px。
- 参考构图、字号、颜色、位置时尽量以原片为准（截图对比）。常用量级：主标题 72–96px/900、副标题 34–46px、正文 14–18px、迷你标签 11–13px。
- 纸拼贴场景：元素轻微旋转（-4°~6°）、纸片投影（`--shadow-paper`）、胶带、印章；进入动效多用「砸入 / 弹入 / 旋转落定」`expo.out` / `back.out`。
- 暗场场景：黑绿底 + 六边形，卡片玻璃感/霓虹描边，动效多用「上浮 / 描边流光 / 数字滚动 / 打字机」。
- 数据场景：窗口 + 表格/图表，条形/数字要有生长与 count-up；红线/高亮要用 SVG 描边动画。
- 保持元素不超出 1280×720；字幕区域底部 ~58px 不要放大元素（重要信息避开 bottom 90px 与 caption 条区域）。
- 中文字体用 `var(--font)`；英文数字标题可用 `var(--serif)`；代码/日期用 `var(--mono)`。

---

## 4. 验证流程（每个场景必须自测）

```bash
cd "/Users/zzz/Documents/deepseek-harness/自动化视频"
python3 tools/shot.py --scene <id> --local 0.3,1.2,2.5,4,6   # 输出到 project/shots/
```
然后逐张 `read_image` 检查：构图/字号/层级/颜色/动效中间态。
对照原片：`project/keyframes_all/s_0NN.jpg`（t=NN 秒）。
需要更多帧：
```bash
ffmpeg -y -v error -ss <t> -i video/source.mp4 -frames:v 1 -q:v 2 project/keyframes_all/x.jpg
```
验收标准：静帧与原片同场景逐帧对照，构图与关键元素一致；动效过程有清晰的入场/强调节奏；seek 到任意时间画面都成立（不会空白/错位）。

---

## 5. 场景任务书

### 02-release（16.0–24.5s，8.5s）— dark-scenes
原片参考：`project/keyframes_all/s_009..s_016.jpg`（1fps），高清 `project/keyframes/k_011.jpg`、`k_013.jpg`、`k_015.jpg`。
背景：`bg-hex`。右上角 host 头像（size 146, left 1064, top 118）。
分段：
1. 0.0–1.2 仿 Twitter 卡片（x70,y68,w820,h180，黑底 #000 圆角14 细边框）从上方 -60px 落入：DS logo 圆头像 56px、昵称「DeepSeek」白色 17px + 金色圆角小徽章、@deepseek_ai 灰色 14px、正文「DeepSeek–V4.1–Flash–1017 is here!」20px、meta「下午4:35 · 2026年10月17日 · 235万 次查看」13px 灰。
2. 1.2–1.6 下方绿色小胶囊「● 没有发布会，直接发推」（x78,y270，深底圆角，绿点）。
3. 1.6–2.6 大标题「DeepSeek V4.1 Flash」白色 78px 900（x64,y330）从下方/字母级入场。
4. 2.8–4.0 1017 印章 size150 砸在标题右侧（left≈690,top≈320, rotate -12），轻微回弹。
5. 4.2–5.2 画面切换（卡片与大标题上移淡出）：版本列表阶段：三行版本名从左侧滑入：
   - 「DeepSeek-V3-0324」灰 62px (y150)
   - 「DeepSeek-R1-0528」灰 62px (y300)
   - 「DeepSeek V4.1 Flash」白 62px (y460) + 印章 size 130 在右侧 (left 700, top 420)
6. 5.2–8.5 保持，轻微呼吸/扫描线；印章可再轻砸一次。
字幕（场景本地秒，引擎已配好，动效对齐即可）：0.25–1.8 / 1.8–3.6 / 3.6–5.2 / 5.2–6.6 / 6.6–8.5。

### 07-search（57.5–68.0s，10.5s）— dark-scenes
原片参考：`s_048..s_058.jpg`、`k_048.jpg`、`k_054.jpg`、`k_063`/`s_063` 附近（pipeline 分镜在 `s_053..s_057` 区域）。
背景：`bg-hex`，右上 host 头像。
分段：
1. 0.0–1.2 推文卡（同 release 样式，x70,y68,w820,h180）：头像/昵称/徽章/@deepseek_ai，正文「Search & Fetch APIs are now open to everyone!」20px，meta「下午4:35 · 2026年10月17日 · 官方推文 3/4」。
2. 1.2–2.6 左上 API 文档浮层（light 窗口 x30,y45,w400,h170）：标题「网页搜索与抓取」，正文小字（照原片抄写），其中「Search 接口」「Fetch 接口」用黄色荧光笔高亮条。
3. 2.8–4.4 底部左侧「我的 Agent」卡片（x100,y300,w220,h140，深绿玻璃+绿色霓虹描边+绿色机器人图标+「我的 Agent / your agent」）。
4. 4.4–6.2 中间「DeepSeek API」卡片（x540,y300,w220,h140，DS 蓝色 logo +「DeepSeek API / official」），虚线连接线从 Agent 流向 API，流动虚线。
5. 6.2–8.0 右侧「官方联网搜索」卡片（x980,y300,w240,h140，绿色地球/搜索图标 +「官方联网搜索 / DeepSeek Search」），第二条虚线连接；卡片周围 sparkle。
6. 8.0–10.5 三卡光效增强/描边流光，保持。
字幕：0.25–1.8「那同时他们还有一个很关键的动作」；1.8–3.9「就是他们把自己的搜索引擎API」；3.9–6.0「也正式对外开放了」；6.0–8.0「你现在在做你自己的Agent」；8.0–10.4「你也能接入它的官方搜索功能了」。

### 10-finale（86.0–90.35s，4.35s）— dark-scenes
原片参考：`k_089.jpg`、`project/keyframes_all/s_086.jpg` 之后。
背景：`bg-finale`（黑绿六边形+地面体积绿光）。
- 0.0–0.5 绿色光晕从底部升起（可用 CSS radial 或 tl 控制伪元素透明度）。
- 0.3–1.2 白色圆角大卡（x340,y160,w600,h320,radius 26）从 scale .92/低处弹入；卡内：
  - 左上：圆角方图（90×90，用 `assets/img/final-portrait.png`，圆角 16）
  - 标题「马安强AI普及」36px 900 深色；副标题「你觉得谁做得更好」22px 灰
  - 右上绿色小信号图标（三根竖条）
  - 下方三个绿色圆形按钮（Ø 78，绿色渐变+光晕）：点赞、收藏、关注，图标可用 SVG 手绘（拇指/星/加号），按钮周围绿色油漆飞溅小圆点（8–14 个，从按钮中心爆开、变小消失）
- 1.2–2.0 三个按钮 stagger 弹入 + 飞溅粒子；卡片边缘出现绿色涂鸦飞溅效果（可用多个小圆/不规则 blob 的绝对定位 + 绿色）。
- 2.0–3.2 轻微上下浮动/呼吸；绿光增强。
- 3.2–4.35 保持。
无字幕。

### 01-today（8.5–16.0s，7.5s）— paper-scenes
原片参考：`s_006.jpg`（≈t6 就在今天）、`s_007.jpg`、`s_008.jpg`（t7-8 卡片/没有 字样）、`k_007.jpg`、`k_008.jpg`。
背景：`bg-paper`。
- 0.0–1.0 纸拼贴标题「就在今天」贴纸（size 84，左上 x225,y75）砸入并轻微旋转。
- 0.2–1.4 日历卡（与 00-weekend 同款外观，尺寸 350×390，left 160 top 195，rotate -1°）从左侧滑入；日期「17」红色、星期「星期六」红色；卡上左侧小圆钟（16:35，Ø 104，left 120 top 400）弹入；1017 蓝印章（size 150，left 330 top 380，rotate -18）砸在日历右下。
- 1.0–2.2 右侧「发布会 / VIP 几场 / 第几场券 · 10月17日」票券卡（x515,y150,w330,h170,rotate 5°）从右滑入，顶部贴胶带（`.tape`）。
- 2.2–3.2 红色「没有」大字贴纸斜砸在票券上（rotate -14，size 92，红色填充+白描边）。
- 3.2–5.2 两张海报卡入场：「预热海报 / 敬请期待」（白卡 + 靛蓝海报 + 大白「?」+ 底部小字）与灰色「发布会」票根（可复用第一张卡置灰），并再盖一个红色「没有」小印章。
- 4.0–5.5 1017 印章再轻砸/轻微弹动，整体纸片有交互感。
- 5.3–6.2 卡片群轻微相机 push-in（scale 1→1.015）。
- 6.0–7.5 保持，最后 0.3s 准备切场（不要 fade 到黑，原片是硬切）。
字幕：0.2–1.9「又是没有任何发布会」、1.9–3.6「没有任何预热」、3.6–5.3「又是没有任何发布会」、5.3–7.5「DeepSeek直接上线了」。
> 提示：票券、海报卡尽量用 CSS 绘制（边框/胶带/大字），不要用原片截图充当卡片。

### 03-naming（24.5–31.0s，6.5s）— paper-scenes
原片参考：`k_017.jpg`（t17 换别的厂家+版本号卡）、`k_019.jpg`（t19 换别的厂家+升级标签）、`s_021..s_023.jpg`（版本日期列表）。
背景：`bg-studio`（虚拟 B-roll 暖色虚化房间）。
- 0.0–0.8 左上角栏目标签：`NAMING`（mono 12px 绿色 letterspacing）+ 左侧竖线 + 下方「版本号」12px 白 70%。
- 0.8–1.8 大标题「换别的厂家」白色 88px 900 逐字/整行滑入（x60,y150），下方绿色下划线从 0 展开；小标签「↗ 同样幅度的升级」（深色半透明胶囊，绿字）随后弹入。
- 1.0–2.2 右侧深绿卡片（x940,y70,w300,h230，绿色霓虹描边+左上角小字「DeepSeek 的叫法」灰 14px + 两行白字「V4.1」「Flash」46px）从右侧滑入；1017 印章（size 160，left 1030,top 250,rotate -18）砸在卡片右下角。
- 2.2–3.4 卡片切换为「版本时间线」：右侧三行（x900 起）：
  「DeepSeek-V3-0324  2025 · 03 · 24」灰白 26px mono，逐行从右滑入，行前小圆点；
  「DeepSeek-R1-0528  2025 · 05 · 28」；
  「DeepSeek V4.1 Flash  2026 · 10 · 17」高亮（白字+绿点+绿色描边胶囊/下划线）。
- 3.4–4.6 大字标签「跨代的大版本」金色 64px 从左侧滑入（y 400 附近），「V5」金色描边大字（outline sticker，size 120，右侧）弹入。
- 4.6–5.6 红色书法字「不讲武德」用 `--brush` 字体、红色、白描边、rotate -8 砸入画面右下（x 820,y 470，size 100，可用 UI.sticker 红色系）。
- 5.6–6.5 保持。
字幕：0.2–1.6「在后面加一个日期」、1.6–3.1「你但凡换一个别的厂家」、3.1–4.3「这种幅度的升级」、4.3–6.5「高低都得算一个跨代的大版本」。
> 原片此处是真人 B-roll + 叠加设计元素；复刻不出现真人，只用暖色虚化底 + 这些图形层，效果要成立。

### 06-news（44.0–57.5s，13.5s）— paper-scenes
原片参考：`k_036.jpg`（t36 新闻条）、`k_042.jpg`（许愿式编程+聊天窗）、`s_040..s_045.jpg`。
背景：`bg-paper`。
- 0.0–0.8 顶部官方新闻条：白色圆角卡（x55,y30,w1085,h95,border 2.5px 墨绿,radius 12,投影）从上方落入；小字「DeepSeek 官方新闻 · 2026/10/17」15px 灰；标题「DeepSeek V4.1 Flash 新版本：许愿式编程 一键成真」33px 900 墨绿；1017 印章（size 150，left 940,top 45,rotate -14）砸在右缘。
- 0.8–1.8 新闻条标题中「许愿式编程」出现金色荧光笔高亮条（背景色块从左向右刷过，文字保持）。
- 1.0–2.0 巨型贴纸「许愿式编程」（size 118，白填充+墨绿描边，x45,y175）从下方砸入 + 轻微回弹；其表现方式参考 `project/crops/outline_zoom.png`。
- 2.2–3.2 聊天窗口卡（light 窗口 x575,y270,w400,h300，标题「DeepSeek」）：DS 鲸鱼 logo（可用 `assets/img/ds-avatar.png`）+「有什么可以帮你？」18px；输入框圆角灰底，「想要」逐字打出（打字机 3.5–4.4s），右侧蓝色圆形发送按钮带箭头（呼吸光晕）。
- 1.6–2.4 左下角大脑图标（白色圆 Ø 90 + SVG 大脑线稿）与两个对话气泡（圆点）从下弹入，气泡依次出现。
- 3.6–4.4「丢给它」贴纸（size 54，rotate -6，白填充+墨绿描边）在聊天窗右上方出现。
- 4.6–5.4 发送按钮脉冲点击（scale 0.9/1 + 光圈），聊天窗轻微上浮。
- 5.4–8.0 输入框内文字变为「想要一个 10 秒的科技新闻视频…」（可选：继续打字）；聊天窗出现一行灰色小字「DeepSeek 正在生成…」+ 进度条从 0→100%（8.0s 前完成），最后出现绿色「✓ 已完成」。
- 8.0–13.5 保持画面，轻微相机 push-in；纸片元素可轻微漂浮。
字幕见 captions.js（8 条）。动效要和字幕语义对齐：3.9 许愿式编程、7.6 你脑子里想什么、9.3 直接丢给它、10.8 它就能直接帮你做出来、12.4 那从这里也能看出来。

### 04-bench（31.0–37.5s，6.5s）— data-scenes
原片参考：`k_024.jpg`（t24 表格）、`k_027.jpg`（t27 表格+浮层）。
背景：`bg-hex`，右上 host 头像。
- 0.2–1.0 浅色 macOS 窗口（x55,y65,w630,h470，标题「DeepSeek V4.1 Flash 1017 · 官方跑分 11 项」）从下弹入。
- 0.8–2.4 表格逐行淡入（11 行数据 + 表头），表头列：Benchmarks / DeepSeek V4.1-Flash-1017 / DeepSeek V4.1-Flash / Kimi K3 / GLM 5.3 / GPT 5.6-Sol / Claude Opus 5。数据照 `k_027.jpg` 抄录（见下方附表）。
- 1.6–2.6 第一列（DeepSeek V4.1-Flash-1017）出现靛蓝圆角高亮框（SVG rounded rect 描边动画 + 淡紫填充），从顶部扫到行尾。
- 2.2–3.0 黄色渐变行（DeepSWE v1.1 / Automation / Agents / Apex 等行，参考原片）与高亮列淡入。
- 2.6–3.2 左侧浮动小胶囊「● 超过」（绿色）「● 接近」（蓝色）弹出。
- 3.2–4.2 右侧对比浮层（x820,y340,w430,h230，深色圆角卡）：「DeepSWE v1.1 / 真实代码修复 · 表中一行」；两行条形图：DeepSeek 77.0（蓝色渐变条，从 0 生长）、Claude Opus 5 74.0（灰色条），数字 count-up。
- 4.2–4.8 1017 印章（size 150，left 720,top 130,rotate -16）砸入。
- 4.8–6.5 保持，命中行脉冲高亮。
字幕：0.25–1.9 / 1.9–4.3 / 4.3–6.5。
附表（必须一致）：
```
Benchmarks | DS V4.1-Flash-1017 | DS V4.1-Flash | Kimi K3 | GLM 5.3 | GPT 5.6-Sol | Claude Opus 5
HLE (w/o tools) | 42.6/44.0* | 36.8/39.1* | 43.5 | 42.0* | 44.5 | 56.3
Terminal-Bench 4.0 | 42.3 | 31.2 | 12.6 | 37.9 | 39.9 | 51.8
DeepSWE v1.1 | 77.0 | 74.2 | 67.5 | 66.9 | 73.0 | 74.0
ProgramBench | 29.1 | 20.3 | 17.5 | 19.0 | 23.0 | 37.0
NL2Repo-Bench | 68.2 | 65.4 | 58.0 | 58.0 | 56.8 | 75.3
Automation-Bench V1.0.6 | 60.5 | 54.8 | 46.7 | 48.8 | 45.8 | 50.3
Agents' Last Exam | 35.4 | 31.8 | 27.6 | 28.5 | 26.7 | 28.6
Apex Bench v1.1 | 72.1 | 64.6 | 47.8 | 56.6 | 54.3 | 65.8
Chartography (w/tools) | 83.0 | 78.9 | 68.1 | - | 79.9 | 84.0
BabyVision (w/tools) | 92.5 | 89.6 | 85.7 | - | 88.9 | 94.1
ZeroBench-main (w/tools) | 51.0 | 49.0 | 41.0 | - | 53.0 | 52.0
```

### 05-chart（37.5–44.0s，6.5s）— data-scenes
原片参考：`k_030.jpg`、`k_033.jpg`、`s_030..s_035.jpg`。
背景：`bg-hex`，右上 host 头像。
- 0.2–1.0 浅色窗口（x55,y55,w780,h540，标题「DeepSWE 通过率与每任务费用 · 官方图」）弹入。
- 0.6–1.4 内部标题「DeepSWE v1.1 通过率（Pass@1）与每任务费用」18px + 副标题「评测框架：mini_swe_v2」12px 灰；坐标轴 + 网格淡入。
- 1.0–2.6 多条折线依次绘制（SVG path stroke-dashoffset 动画，3–4 条主要曲线：绿/蓝/紫/红），每条带圆点散点与少量标签（DeepSeek V4.1 Flash、GPT-6 Sol、Claude Opus 5、Kimi K3 等）。
- 2.6–3.4 红色「斩杀线」绘制：竖线（x≈¥1.2 从底部 38% 拉到顶部 76%）+ 横线（y=76% 从左侧拉到 ¥2 附近），红色粗线（≈6px）+ 轻微手绘抖动；红圈圈住 DeepSeek 数据簇（SVG ellipse 描边）。
- 3.4–4.2 右侧两个深色胶囊标签：「● 1017：每个任务约 ¥1–2」「● 对手太多 ¥10–¥100」（白字/金、灰），从右侧滑入。
- 4.2–4.8 1017 印章（size 150，left 790,top 60? 原片在图表左上，可放 x300,y45）砸入。
- 4.8–6.5 保持，红线轻微呼吸。
字幕：0.25–2.0 / 2.0–3.3 / 3.3–6.4。

### 08-tested（68.0–74.0s，6.0s）— data-scenes
原片参考：`k_060.jpg`（TESTED 实测）、`k_063.jpg`（这次大提升 + 01/02 列表）。
背景：`bg-studio`。
- 0.2–0.8 左上栏目标签「TESTED」（mono 12px 绿色）+ 竖线 +「我的实测」12px。
- 0.8–1.6 大标题「这次大提升」88px 900 白色，其中「大提升」用绿色渐变文字（背景裁切）或绿色；整行从左侧滑入（x60,y150）。
- 1.6–2.4 两行能力条目：
  「01」绿色圆（Ø 54，编号 26px 900）+ 摄像机图标（绿色线稿）+ 文字条「视频制作」（深色半透明圆角条，白字 24px）；
  「02」+ `</>` 图标 +「前端能力」；两行从左侧滑入，错开 0.15s。
- 2.6–3.6 标题左侧轻推近景 + 01/02 条目绿色下划线/发光扫过。
- 3.8–4.8 右侧出现「Opus 5.5」金色奖杯卡片（x960,y70,w300,h260，深色玻璃+金色描边；顶部奖杯线稿金色；「Opus 5.5」白 40px；小字「以前的强项」灰 14px；两行金色胶囊按钮「视频制作」「前端能力」），从右滑入——为下一场对比铺垫。
- 4.8–6.0 保持，金色描边呼吸。
字幕：0.25–1.7 / 1.7–3.4 / 3.4–6.0。

### 09-compare（74.0–86.0s，12.0s）— compare-scene
原片参考：`k_069.jpg`（prompt 打字）、`k_072.jpg`（VS 双窗）、`k_078.jpg`（球体+Token 标题）、`k_081.jpg`/`k_082.jpg`（数字看板/条形图）、`k_084.jpg`（光柱）、`k_089.jpg` 前（标签）。
背景：`bg-hex`，右上 host 头像。
分段：
1. 0.0–1.0 深色 prompt 卡（x350,y28,w580,h175，圆角 14）滑入，标题栏红黄绿点 +「提示词 · prompt.md」；正文逐行打字（mono/14px 灰白）：
   「请帮我写一段 单文件 HTML 代码……」
   「制作一个 10 秒钟的科技新闻数据可视化演示视频……」
   「【新闻主题】2026全球AI算力狂飙：人类日均 Token 消耗量突破100万亿大关……」
   「【视觉与分镜要求（严格控制在 10 秒）】」
2. 1.0–2.4 两条曲线连接线从卡片底部向左右分出（左绿右紫，贝塞尔曲线，SVG dash 动画）。
3. 2.4–3.6 两个窗口从下方滑入：
   - 左 Opus 5.5：x12,y170,w615,h430，mac 窗口，绿色霓虹描边+外发光；
   - 右 DeepSeek V4.1 Flash 1017：x653,y170,w615,h430，蓝紫霓虹描边；
   中间 VS 白圆标（Ø 76，x602,y345）弹入。
4. 3.6–4.4 顶部标题「同一份提示词 · 两版同时播放」32px 800 白色淡入（居中 y100）；下方两个胶囊标签：「● Opus 5.5」绿色发光、「● DeepSeek V4.1 Flash 1017」紫蓝发光（y 620 左右）；右上 1017 印章（x990,y120,size 140）。
5. 4.4–12.0 两个窗口内各放一个 canvas（每窗约 615×396），播放 7.5 秒 mini 动效（用同一时间轴，local = 场景时间 - 4.4，循环一次即可）：
   时间线（0–7.5s）：
   - 0–2.2：深色星空/粒子球体旋转（左紫 / 右青），顶部 tiny mono 标签「AI DAILY NEWS · 2026」；中央标题「2026：人类进入 Token 泛滥时代」（左「Token」紫色 / 右「TOKEN」青色），带发光上浮入场；
   - 2.2–4.6：两张数据看板卡片（左：全球日均 Token 消耗量，大数字 count-up + 条形图生长；右：人均算力调用量 2024–2026，曲线上升 + 大数字），带细网格/扫描线；
   - 4.6–7.0：竖立光柱（从左细右粗，青白渐变+光晕）升起，粒子飞散；  
   - 7.0–7.5：结束帧（光柱+微光）。
   canvas 绘制必须由 local 纯函数驱动（固定 seed），不能依赖 requestAnimationFrame 内部状态累积（可以每帧用 local 重新计算粒子位置）。
6. 保持高光呼吸，不要淡出（原片硬切到终章）。
字幕：0.25–2.1 / 2.1–3.3 / 3.3–4.7 / 4.7–6.5 / 6.5–8.6 / 8.6–10.3 / 10.3–12.0。

---

## 6. 交付与回报

完成后向 Lead 报告：
- 改了哪些文件
- 每个场景自测截图路径（`project/shots/...`）
- 与原片的差距 / 未完成点 / 需要 Lead 配合的共享组件改动
- 不要修改共享文件；不要运行长时间渲染（MP4 渲染由 Lead 统一做）
