#!/usr/bin/env python3
"""合成「复刻 vs 原片」分章对照视频（两边都从各自场景起点开始，内容对齐）。

用法:
  python3 tools/compare_chapters.py --replica web/preview.mp4 --out web/compare.mp4

输出 1920x576：左右各 960x540 画面 + 36px 顶部角标条（章节名 / REPLICA / SOURCE）。
每章时长 = min(复刻场景时长, 原片对应片段时长)，避免一刀切的时间漂移。
注：本机 ffmpeg 无 drawtext，角标用 PIL 预渲染 PNG + overlay 合成。
"""
import argparse, pathlib, subprocess, sys
from PIL import Image, ImageDraw, ImageFont

ROOT = pathlib.Path(__file__).resolve().parent.parent
FF = 'ffmpeg'
FONT_CJK = ROOT / 'web' / 'assets' / 'fonts' / 'NotoSansSC-VF.ttf'
TMP = ROOT / 'project' / 'render' / 'chapters'

# (id, title, replica_start, replica_end, source_start, source_end)
CHAPTERS = [
    ('weekend',  '01 周末 · 别掉以轻心',      0.00,  8.50,  0.0,   6.0),
    ('today',    '02 就在今天',               8.50, 16.00,  6.0,   9.0),
    ('release',  '03 官方发推',              16.00, 24.50,  9.0,  16.5),
    ('naming',   '04 命名 · 跨代大版本',      24.50, 31.00, 16.5,  23.5),
    ('bench',    '05 官方跑分',              31.00, 37.50, 23.5,  30.0),
    ('chart',    '06 斩杀线',                37.50, 44.00, 30.0,  35.5),
    ('news',     '07 许愿式编程',            44.00, 57.50, 35.5,  44.5),
    ('search',   '08 搜索 API 开放',         57.50, 68.00, 48.0,  58.5),
    ('tested',   '09 实测 · 这次大提升',      68.00, 74.00, 60.0,  66.0),
    ('compare',  '10 同一提示词 · 两版同播',  74.00, 86.00, 68.5,  87.0),
    ('finale',   '11 终章',                  86.00, 90.35, 87.6,  90.35),
]


def label_png(index, title, out):
    img = Image.new('RGBA', (1920, 36), (11, 12, 11, 255))
    d = ImageDraw.Draw(img)
    f = ImageFont.truetype(str(FONT_CJK), 19)
    # 左：REPLICA
    d.ellipse((18, 15, 26, 23), fill=(47, 227, 138))
    d.text((34, 7), 'REPLICA · 复刻', font=f, fill=(47, 227, 138))
    # 中：章节
    tw = d.textlength(title, font=f)
    d.text(((1920 - tw) / 2, 7), title, font=f, fill=(235, 232, 220))
    # 右：SOURCE
    t = 'SOURCE · 原片 @马安强AI普及'
    tw2 = d.textlength(t, font=f)
    d.text((1920 - tw2 - 20, 7), t, font=f, fill=(255, 201, 60))
    img.save(out)
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--replica', default='web/preview.mp4')
    ap.add_argument('--source', default='web/assets/media/source.mp4')
    ap.add_argument('--out', default='web/compare.mp4')
    ap.add_argument('--crf', default='20')
    args = ap.parse_args()
    rep, src, out = ROOT / args.replica, ROOT / args.source, ROOT / args.out
    for p in (rep, src):
        if not p.exists():
            sys.exit('missing: ' + str(p))
    TMP.mkdir(parents=True, exist_ok=True)

    seg_files = []
    total = 0.0
    for i, (sid, title, rs, re_, ss, se) in enumerate(CHAPTERS):
        rep_dur = re_ - rs
        src_dur = max(0.05, se - ss)
        dur = min(rep_dur, src_dur)
        total += dur
        label = label_png(i, title, TMP / ('lbl_%02d.png' % i))
        seg = TMP / ('seg_%02d.mp4' % i)
        f = (
            "[0:v]scale=960:540:flags=lanczos,setsar=1,pad=960:576:0:36:black[p0];"
            "[p0][2:v]overlay=0:0:format=auto[a];"
            "[1:v]scale=960:540:flags=lanczos,setsar=1,pad=960:576:0:36:black[p1];"
            "[p1][2:v]overlay=0:0:format=auto[b];"
            "[a][b]hstack=inputs=2[v]"
        )
        cmd = [FF, '-y', '-v', 'error',
               '-ss', '%.3f' % rs, '-t', '%.3f' % dur, '-i', str(rep),
               '-ss', '%.3f' % ss, '-t', '%.3f' % dur, '-i', str(src),
               '-i', str(label),
               '-filter_complex', f,
               '-map', '[v]', '-map', '1:a',
               '-c:v', 'libx264', '-preset', 'medium', '-crf', args.crf,
               '-pix_fmt', 'yuv420p', '-r', '30',
               '-c:a', 'aac', '-b:a', '160k', '-ar', '48000',
               '-t', '%.3f' % dur, str(seg)]
        print('[%02d] %-28s rep %.2f-%.2f  src %.2f-%.2f  -> %.2fs' % (i, sid, rs, re_, ss, se, dur))
        subprocess.run(cmd, check=True)
        seg_files.append(seg)

    lst = TMP / 'concat.txt'
    with open(lst, 'w') as fh:
        for s in seg_files:
            fh.write("file '%s'\n" % s)
    cmd = [FF, '-y', '-v', 'error', '-f', 'concat', '-safe', '0', '-i', str(lst),
           '-c:v', 'libx264', '-preset', 'medium', '-crf', args.crf, '-pix_fmt', 'yuv420p',
           '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', str(out)]
    subprocess.run(cmd, check=True)
    print('saved', out, '(~%.1fs)' % total)


if __name__ == '__main__':
    main()
