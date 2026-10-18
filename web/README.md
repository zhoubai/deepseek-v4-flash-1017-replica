# DeepSeek V4.1 Flash 1017 · 动效复刻（Frontend Motion Replica）

对抖音 @马安强AI普及 的 90 秒动效设计长片《DeepSeek新模型硬刚Opus 5.5》做**纯前端复刻**：
纸拼贴、官方推文、跑分表、斩杀线、许愿式编程、实测对比 11 个分镜，全部用 HTML / CSS / GSAP 重建，
不是播放原视频，也不使用原片视频帧驱动动画（头像、logo 等静态素材除外）。

- 舞台：1280 × 720，16:9，整体时长 **90.35s**
- 技术：单页 + 11 个 `Replica.registerScene` 场景，每个场景一个 **paused GSAP timeline**，
  引擎按全局时间 `tl.time(local)` 精确 seek → 可暂停、可拖拽、可逐帧渲染 MP4
- 字幕：独立时间轴（`src/captions.js`），与原片同款深灰圆角条 + 金/红关键词高亮

## 快速开始

方式一（最简单）：直接双击 `web/index.html`，浏览器打开后点「播放复刻」。

方式二（推荐，本地服务器）：

```bash
cd web
./start.sh            # 起服务并自动打开浏览器（默认 8080 端口）
# 或手动：python3 -m http.server 8080 -d web
```

`?render=1` 为无 UI 渲染模式（1:1 舞台，供截图/渲染工具使用），可加 `&t=12.5` 直接定位。

## 播放器控制

| 操作 | 功能 |
| --- | --- |
| `Space` / 左下按钮 | 播放 / 暂停 |
| `←` / `→` | 后退 / 前进 5 秒 |
| `Home` / `End` | 回到开头 / 跳到结尾 |
| `F` | 全屏 |
| `P` | 原片对照画中画（PIP，可开原声） |
| 进度条 | 点击/拖拽任意 seek；分段条按 11 个分镜切分 |
| `1×` 按钮 | 1× / 1.25× / 1.5× / 2× 变速 |
| 结尾卡 | 重播 / 跳转任意章节 |

## 分镜（复刻时间轴 ↔ 原片时间轴）

| # | scene id | 复刻时间 | 原片时间 | 内容 |
| --- | --- | --- | --- | --- |
| 01 | `weekend` | 0.0–8.5s | 0–6s | 纸拼贴「周末·别掉以轻心」：日历翻页 12→14→16→17、16:35 圆钟、1017 印章 |
| 02 | `today` | 8.5–16.0s | 6–9s | 「就在今天」：17 号日历、发布会 VIP 票券、「没有」红贴纸、预热海报 |
| 03 | `release` | 16.0–24.5s | 9–16.5s | 暗场官方推文卡 →「DeepSeek V4.1 Flash」大标题 → 版本命名列表 |
| 04 | `naming` | 24.5–31.0s | 16.5–23.5s | B-roll 叠层「NAMING / 换别的厂家」、DeepSeek 的叫法、跨代大版本、不讲武德 |
| 05 | `bench` | 31.0–37.5s | 23.5–30s | 官方跑分 11 项 macOS 窗口 + DeepSWE 条形对比浮层 + 超过/接近 |
| 06 | `chart` | 37.5–44.0s | 30–35.5s | 通过率/每任务费用散点折线图 + 红色「斩杀线」描绘 |
| 07 | `news` | 44.0–57.5s | 35.5–44.5s | 官方新闻条 + 巨型描边贴纸「许愿式编程」+ DeepSeek 聊天窗打字 |
| 08 | `search` | 57.5–68.0s | 44.5–58.5s | Search & Fetch APIs 推文 + API 文档卡 + 三卡 pipeline（Agent → API → 联网搜索） |
| 09 | `tested` | 68.0–74.0s | 58.5–66s | 「TESTED / 这次大提升」+ 01 视频制作 / 02 前端能力 |
| 10 | `compare` | 74.0–86.0s | 66–86s | prompt 卡 → 双 macOS 窗口「Opus 5.5」vs「DeepSeek V4.1 Flash 1017」+ canvas 双 mini 动效 |
| 11 | `finale` | 86.0–90.35s | 86–90.3s | 黑绿体积光终章：关注卡 + 点赞/收藏/关注绿色圆钮 |

## 目录结构

```
web/
  index.html                 # 单页入口
  src/
    tokens.css               # 设计变量（配色 / 字体 / 阴影 / 缓动）
    base.css                 # 舞台、背景、共享组件、字幕、HUD 样式
    engine.js                # Replica 引擎：场景注册 / 全局时钟 / seek / 字幕 / 渲染模式
    shared.js                # UI.stamp / UI.avatar / UI.win / UI.sticker / UI.splitChars
    captions.js              # 逐场景字幕时间轴
    main.js                  # 启动层、播放器 HUD、PIP 原片对照、章节
    scenes/00-weekend … 10-finale  # 11 个场景（js + css 一对一）
  assets/
    fonts/                   # Noto Sans SC / Zilla Slab / Playfair Display / DM Serif / Bodoni Moda
    img/                     # 原片裁剪头像、DeepSeek logo、终章人像、纸纹、B-roll 底图
    media/source.mp4         # 原片（仅 PIP 对照用，不参与动画驱动）
    vendor/gsap.min.js
tools/
  shot.py                    # 按时间点截图（逐帧 QA）
  render.py                  # 逐帧渲染 MP4（Playwright + ffmpeg）
  compare.py                 # 生成「复刻 vs 原片」左右对比图
  compare_chapters.py        # 合成「复刻 vs 原片」分章对照视频（1920x576 + 原声音轨）
  verify.py                  # 集成自检（场景注册 / seek / 空白 / 控制台错误）
project/                     # 分析素材、截图、对比图、渲染产物（过程文件）
```

## 渲染与 QA

```bash
# 单帧截图
python3 tools/shot.py --scene bench --local 0.5,1.5,3,4.5

# 全片渲染（约 5–8 分钟）
python3 tools/render.py --fps 30 --out web/preview.mp4

# 复刻 vs 原片左右对比图
python3 tools/compare.py --items "weekend@6.4@5,bench@3.2@27"

# 分章对照视频（左侧复刻 / 右侧原片，每章各自从场景起点对齐 + 原声）
python3 tools/compare_chapters.py --replica web/preview.mp4 --out web/compare.mp4

# 集成自检（11 场景是否注册 / 可 seek / 非空白 / 控制台错误）
python3 tools/verify.py
```

## 最终产物

| 文件 | 内容 |
| --- | --- |
| `web/index.html` | 可交互复刻网页（11 场景 + 字幕 + 播放器 + 原片对照 PIP） |
| `web/preview.mp4` | 全片渲染成片：1280×720 / 30fps / 90.35s / 2710 帧 |
| `web/compare.mp4` | 分章左右对照视频：左复刻、右原片，1920×576，~75s，含原声音轨 |
| `web/compare/*.jpg` | 10 个分镜的「复刻 vs 原片」静止对照图 + 总览图 |

## 素材与版权说明

- 原视频：抖音 @马安强AI普及《DeepSeek新模型硬刚Opus 5.5 / DeepSeek V4.1 Flash 1017》（90.3s，1280×720）。
  本复刻仅用于**动效与前端技术学习**，视频、文案、人物形象版权归原作者所有。
- 头像 / DeepSeek logo / 终章形象：取自原片视频帧裁剪，仅作复刻演示用途。
- 字体：Noto Sans SC（SIL OFL）、Zilla Slab（SIL OFL）、Playfair Display（SIL OFL）、
  DM Serif Display（SIL OFL）、Bodoni Moda（SIL OFL）。
- 动效、布局、图表、表格数据均按原片画面重新绘制定位；字体为近似替代，尺寸按 1280×720 实测标定。

## 已知差距

- 原片真人出镜镜头无法复刻，本复刻保留其**图文叠层设计**（NAMING / TESTED / 命名卡 / 跑分/图表浮层等），
  背景用原片静帧或暖色虚化底图替代实拍画面。
- 原片有视频调色与压缩纹理，网页版为纯色/程序纹理，纸面质感与暗场噪点只能近似。
- 部分中文字体为 Noto Sans SC Black 近似替代，与原片字体的字面细节略有差异。
