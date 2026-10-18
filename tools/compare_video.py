#!/usr/bin/env python3
"""合成「复刻 vs 原片」左右对照视频。

用法:
  python3 tools/compare_video.py --replica web/preview.mp4 --out web/compare.mp4

输出 1920x576：左右各 960x540 画面 + 36px 顶部角标条（REPLICA / SOURCE），音轨取原片。
注：本机 ffmpeg 无 drawtext，角标用 PIL 预渲染 PNG + overlay 合成。
"""
import argparse, pathlib, subprocess, sys
from PIL import Image, ImageDraw, ImageFont

ROOT = pathlib.Path(__file__).resolve().parent.parent
FF = 'ffmpeg'
FONT = ROOT / 'web' / 'assets' / 'fonts' / 'ZillaSlab-Bold.ttf'
TMP = ROOT / 'project' / 'render'

def label_png(text, color, out):
    img = Image.new('RGBA', (960, 36), (0, 0, 0, 255))
    d = ImageDraw.Draw(img)
    f = ImageFont.truetype(str(FONT), 25)
    d.text((18, 6), text, font=f, fill=color)
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
    lr = label_png('REPLICA', '#2FE38A', TMP / 'lbl_replica.png')
    ls = label_png('SOURCE', '#FFC93C', TMP / 'lbl_source.png')
    f = (
        "[0:v]scale=960:540:flags=lanczos,setsar=1,pad=960:576:0:36:black[p0];"
        "[p0][2:v]overlay=0:0:format=auto[a];"
        "[1:v]scale=960:540:flags=lanczos,setsar=1,pad=960:576:0:36:black[p1];"
        "[p1][3:v]overlay=0:0:format=auto[b];"
        "[a][b]hstack=inputs=2[v]"
    )
    cmd = [FF, '-y', '-v', 'error', '-i', str(rep), '-i', str(src),
           '-i', str(lr), '-i', str(ls), '-filter_complex', f,
           '-map', '[v]', '-map', '1:a', '-c:v', 'libx264', '-crf', args.crf,
           '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '160k', '-shortest', str(out)]
    print(' '.join(cmd))
    subprocess.run(cmd, check=True)
    print('saved', out)

if __name__ == '__main__':
    main()
