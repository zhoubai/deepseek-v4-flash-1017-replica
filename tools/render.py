#!/usr/bin/env python3
"""把复刻页面逐帧渲染为 MP4（确定性 seek，支持任意区间）。

用法:
  python3 tools/render.py                          # 全片 30fps -> web/preview.mp4
  python3 tools/render.py --fps 24 --out web/preview.mp4
  python3 tools/render.py --start 0 --end 16 --fps 30 --out project/render/part1.mp4
"""
import argparse, pathlib, subprocess, sys, tempfile, shutil
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
INDEX = (ROOT / 'web' / 'index.html').as_uri()

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--fps', type=int, default=30)
    ap.add_argument('--start', type=float, default=0.0)
    ap.add_argument('--end', type=float, default=None)
    ap.add_argument('--out', default='web/preview.mp4')
    ap.add_argument('--frames', default=None, help='帧缓存目录，默认临时目录')
    ap.add_argument('--keep', action='store_true')
    ap.add_argument('--crf', type=int, default=18)
    args = ap.parse_args()

    frames_dir = pathlib.Path(args.frames) if args.frames else pathlib.Path(tempfile.mkdtemp(prefix='replica_frames_'))
    frames_dir.mkdir(parents=True, exist_ok=True)
    out = ROOT / args.out
    out.parent.mkdir(parents=True, exist_ok=True)

    with sync_playwright() as p:
        b = p.chromium.launch(args=['--force-color-profile=srgb'])
        page = b.new_page(viewport={'width': 1280, 'height': 720}, device_scale_factor=1)
        page.goto(INDEX + '?render=1', wait_until='load')
        page.wait_for_function("() => window.Replica && window.Replica.ready === true", timeout=40000)
        page.evaluate("() => document.fonts.ready")
        page.wait_for_timeout(400)
        duration = page.evaluate("() => window.Replica.duration")
        end = duration if args.end is None else min(args.end, duration)
        start = max(0.0, args.start)
        n = max(1, int(round((end - start) * args.fps)))
        print(f'duration={duration:.2f}s render {start:.2f}→{end:.2f} @{args.fps}fps, {n} frames')
        stage = page.locator('#stage')
        for i in range(n):
            t = start + i / args.fps
            page.evaluate("(t) => { window.Replica.seek(t); }", t)
            page.evaluate("() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))")
            stage.screenshot(path=str(frames_dir / f'f_{i:05d}.jpg'), type='jpeg', quality=93)
            if i % 150 == 0:
                print(f'  frame {i}/{n}  t={t:.2f}s', flush=True)
        b.close()

    cmd = [
        'ffmpeg', '-y', '-v', 'error',
        '-framerate', str(args.fps),
        '-i', str(frames_dir / 'f_%05d.jpg'),
        '-c:v', 'libx264', '-preset', 'medium', '-crf', str(args.crf),
        '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
        str(out),
    ]
    print('ffmpeg', ' '.join(cmd))
    subprocess.run(cmd, check=True)
    print('saved', out)
    if not args.keep and not args.frames:
        shutil.rmtree(frames_dir, ignore_errors=True)

if __name__ == '__main__':
    main()
