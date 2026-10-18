#!/usr/bin/env python3
"""生成「复刻静帧 vs 原片静帧」左右对比图。

用法:
  python3 tools/compare.py --items "weekend@2.0@3,release@2.5@11.5,bench@3.0@26"
  # sceneId@场景内秒数@原片秒数
输出: project/compare/<scene>_<local>.jpg（左=复刻 右=原片）
"""
import argparse, pathlib, subprocess, tempfile, os
from PIL import Image, ImageDraw, ImageFont
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
INDEX = (ROOT / 'web' / 'index.html').as_uri()
SRC = ROOT / 'video' / 'source.mp4'
OUT = ROOT / 'project' / 'compare'

def font(size):
    for p in ['/System/Library/Fonts/PingFang.ttc', '/System/Library/Fonts/STHeiti Medium.ttc']:
        if os.path.exists(p):
            try: return ImageFont.truetype(p, size)
            except Exception: pass
    return ImageFont.load_default()

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--items', required=True)
    ap.add_argument('--width', type=int, default=640)
    args = ap.parse_args()
    OUT.mkdir(parents=True, exist_ok=True)
    items = []
    for chunk in args.items.split(','):
        parts = chunk.strip().split('@')
        if len(parts) != 3: continue
        items.append((parts[0], float(parts[1]), float(parts[2])))
    if not items: raise SystemExit('no items')

    with sync_playwright() as p:
        b = p.chromium.launch()
        page = b.new_page(viewport={'width': 1280, 'height': 720})
        page.goto(INDEX + '?render=1', wait_until='load')
        page.wait_for_function("() => window.Replica && window.Replica.ready === true", timeout=40000)
        page.evaluate("() => document.fonts.ready")
        page.wait_for_timeout(300)
        starts = page.evaluate("() => Object.fromEntries(Replica.scenes.map(s=>[s.id,s.start]))")
        stage = page.locator('#stage')
        for scene, local, src_t in items:
            if scene not in starts:
                print('skip unknown scene', scene); continue
            page.evaluate("(t) => window.Replica.seek(t)", starts[scene] + local)
            page.evaluate("() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))")
            png = OUT / f'_tmp_{scene}.png'
            stage.screenshot(path=str(png))
            rep = Image.open(png).convert('RGB')
            tmp = tempfile.mktemp(suffix='.jpg')
            subprocess.run(['ffmpeg','-y','-v','error','-ss',str(src_t),'-i',str(SRC),
                            '-frames:v','1','-q:v','2',tmp], check=True)
            src = Image.open(tmp).convert('RGB')
            W = args.width; H = round(W*720/1280)
            rep = rep.resize((W,H), Image.LANCZOS); src = src.resize((W,H), Image.LANCZOS)
            PAD, TOP = 12, 34
            canvas = Image.new('RGB', (W*2+PAD*3, H+TOP+PAD), (18,18,18))
            d = ImageDraw.Draw(canvas)
            f = font(18)
            d.text((PAD, 8), f'REPLICA  {scene}  +{local:.2f}s', fill=(120,255,180), font=f)
            d.text((PAD*2+W, 8), f'SOURCE  t={src_t:.2f}s', fill=(255,255,255), font=f)
            canvas.paste(rep, (PAD, TOP)); canvas.paste(src, (PAD*2+W, TOP))
            outp = OUT / f'{scene}_{local:.2f}.jpg'.replace('.', '_', 1)
            canvas.save(outp, quality=90)
            print('saved', outp)
            png.unlink(missing_ok=True)
            os.unlink(tmp)
        b.close()

if __name__ == '__main__':
    main()
