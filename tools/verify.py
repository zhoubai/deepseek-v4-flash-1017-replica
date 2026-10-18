#!/usr/bin/env python3
"""集成自检：检查 11 个场景是否注册、可 seek、非空白，并收集控制台错误。

用法:
  python3 tools/verify.py            # 全片检查
  python3 tools/verify.py --scene 03-naming
输出: project/verify/report.json + 缩略图 project/verify/*.jpg
"""
import argparse, json, pathlib, statistics, sys
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
INDEX = (ROOT / 'web' / 'index.html').as_uri()
OUT = ROOT / 'project' / 'verify'

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--scene', default=None)
    ap.add_argument('--samples', type=int, default=3)
    args = ap.parse_args()
    OUT.mkdir(parents=True, exist_ok=True)

    errors, report = [], {}
    with sync_playwright() as p:
        b = p.chromium.launch()
        page = b.new_page(viewport={'width': 1280, 'height': 720})
        page.on('console', lambda m: errors.append({'type': m.type, 'text': m.text}) if m.type in ('error', 'warning') else None)
        page.on('pageerror', lambda e: errors.append({'type': 'pageerror', 'text': str(e)}))
        page.goto(INDEX + '?render=1', wait_until='load')
        page.wait_for_function("() => window.Replica && window.Replica.ready === true", timeout=30000)
        page.evaluate("() => document.fonts.ready")
        page.wait_for_timeout(250)

        scenes = page.evaluate("() => Replica.scenes.map(s => ({id:s.id,title:s.title,start:s.start,end:s.end}))")
        info = page.evaluate("() => ({duration: Replica.duration, captions: (Replica._captions||[]).length})")
        print('scenes:', len(scenes), 'duration:', info['duration'])
        for sc in scenes:
            sid, s0, s1 = sc['id'], sc['start'], sc['end']
            if args.scene and args.scene not in (sid, ''):
                continue
            samples = [s0 + (s1 - s0) * (0.25 + 0.5 * i / max(1, args.samples - 1)) for i in range(args.samples)]
            stats = []
            for i, t in enumerate(samples):
                page.evaluate("(t) => Replica.seek(t)", t)
                page.wait_for_timeout(70)
                path = OUT / f'{sid}_{i}.jpg'
                page.locator('#stage').screenshot(path=str(path), type='jpeg', quality=70)
                st = page.evaluate("""() => {
                  const c = document.querySelector('#stage');
                  return {active: (document.querySelector('.scene.is-active')||{}).className || '',
                          n: document.querySelectorAll('.scene.is-active *').length};
                }""")
                stats.append({'t': round(t,2), 'active': st['active'], 'nodes': st['n'],
                              'shot': str(path.relative_to(ROOT))})
                print(f'  {sid} t={t:6.2f} nodes={st["n"]:4d} active={st["active"]}')
            report[sid] = {'title': sc['title'], 'start': s0, 'end': s1, 'samples': stats}
        b.close()

    report['_errors'] = errors
    (OUT / 'report.json').write_text(json.dumps(report, ensure_ascii=False, indent=1))
    print('\nconsole errors:', len(errors))
    for e in errors[:12]: print('  ', e['type'], e['text'][:200])
    bad = [s for s, r in report.items() if isinstance(r, dict) and r.get('samples') and min(x['nodes'] for x in r['samples']) < 5]
    if bad: print('WARN blank-ish scenes:', bad)
    print('report ->', OUT / 'report.json')

if __name__ == '__main__':
    main()
