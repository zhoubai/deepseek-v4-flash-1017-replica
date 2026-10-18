#!/usr/bin/env python3
"""按时间点截取复刻页面的静帧（供逐帧校验）。

用法:
  python3 tools/shot.py --local 0.2,1.5,3.0 --scene weekend
  python3 tools/shot.py --times 12.5,18 --out project/shots
  python3 tools/shot.py --scene bench --local 1 --width 1280
输出文件名: <scene>_<local>.png 或 t<time>.png
"""
import argparse, json, pathlib, sys
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
INDEX = (ROOT / 'web' / 'index.html').as_uri()

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--scene', default=None)
    ap.add_argument('--local', default=None, help='逗号分隔的场景内秒数')
    ap.add_argument('--times', default=None, help='逗号分隔的全局秒数')
    ap.add_argument('--out', default='project/shots')
    ap.add_argument('--width', type=int, default=1280, help='截图宽度，默认 1280x720')
    args = ap.parse_args()

    out = ROOT / args.out
    out.mkdir(parents=True, exist_ok=True)

    times = []
    if args.times:
        times = [float(x) for x in args.times.split(',') if x.strip()]
    elif args.local:
        locs = [float(x) for x in args.local.split(',') if x.strip()]
        times = locs
    else:
        sys.exit('need --times or --local')

    with sync_playwright() as p:
        b = p.chromium.launch()
        page = b.new_page(viewport={'width': args.width, 'height': round(args.width*720/1280)})
        page.goto(INDEX + '?render=1', wait_until='load')
        page.wait_for_function("() => window.Replica && window.Replica.ready === true", timeout=30000)
        page.evaluate("() => document.fonts.ready")
        page.wait_for_timeout(200)
        scene_start = 0.0
        if args.scene:
            info = page.evaluate("(id) => { const s = Replica.scenes.find(s=>s.id===id); return s ? {start:s.start,end:s.end} : null }", args.scene)
            if not info:
                sys.exit('unknown scene: ' + args.scene)
            scene_start = info['start']
            print('scene', args.scene, info)
        for t in times:
            g = scene_start + t if (args.scene and args.local and not args.times) else t
            page.evaluate("(t) => window.Replica.seek(t)", g)
            page.wait_for_timeout(90)
            name = (f'{args.scene}_' if args.scene else '') + f'{t:07.2f}'.replace('.', '_') + '.png'
            path = out / name
            # 截取 stage 元素（1280x720 设计画布）
            el = page.locator('#stage')
            el.screenshot(path=str(path))
            print('saved', path)
        b.close()

if __name__ == '__main__':
    main()
