#!/usr/bin/env python3
"""Pre-push checks for giveglimpse.com. Run: python3 check.py [--live https://giveglimpse.com]
Fails (exit 1) on anything that would ship broken or un-indexable."""
import re, sys, pathlib, urllib.request
ROOT = pathlib.Path(__file__).parent
PAGES = ['index.html','event-01.html','record.html','funding.html','privacy/index.html','terms/index.html','404.html']
STUBS = ['about.html','vision.html','needs.html','receipts.html','chapter-one.html','partners.html','how-it-works.html','the-generosity-compact.html','founding-five/index.html']
CA = 'EoZVprU5NM1pBWqJszVQmSt7rQ7fLGPAsHUq75mjxb3z'
errs = []
def err(f, m): errs.append(f'{f}: {m}')
disclosures = {}
for f in PAGES:
    p = ROOT/f; s = p.read_text(); d = p.parent
    if 'noindex' in s: err(f, 'noindex present')
    if 'PRIVATE DESIGN STUDY' in s or 'preview-label' in s: err(f, 'prototype label present')
    if 'Content-Security-Policy' not in s: err(f, 'missing CSP meta')
    if 'rel="canonical"' not in s: err(f, 'missing canonical')
    if 'og:image' not in s and f != '404.html': err(f, 'missing og:image')
    if s.count('<h1') != 1: err(f, f'h1 count {s.count("<h1")}')
    if re.search(r'\sstyle="', s): err(f, 'inline style attribute (blocked by CSP)')
    if re.search(r'\son[a-z]+="', s): err(f, 'inline event handler (blocked by CSP)')
    for src in re.findall(r'<script[^>]+src="([^"]+)"', s):
        if src.startswith('http'): err(f, f'external script {src} (blocked by CSP)')
    m = re.search(r'<p class="disclosure">(.*?)</p>', s, re.S)
    if m: disclosures[f] = m.group(1)
    else: err(f, 'missing footer disclosure')
    refs = re.findall(r'(?:href|src)="([^"]+)"', s)
    for ss in re.findall(r'srcset="([^"]+)"', s): refs += [x.strip().split(' ')[0] for x in ss.split(',')]
    for h in refs:
        if re.match(r'^(https?:|mailto:|data:|#)', h): continue
        t = h.split('#')[0]
        if not t: continue
        q = (ROOT/t.lstrip('/')) if t.startswith('/') else (d/t)
        if not (q.is_file() or (q/'index.html').is_file()): err(f, f'broken link {h}')
    for a in re.findall(r'href="#([^"]+)"', s):
        if f'id="{a}"' not in s: err(f, f'missing anchor #{a}')
    if 'funding' in f and CA not in s: err(f, 'contract address missing')
if len(set(disclosures.values())) > 1: err('footer', 'disclosure text differs between pages: ' + ', '.join(disclosures))
for f in STUBS:
    p = ROOT/f
    if not p.is_file(): err(f, 'redirect stub missing'); continue
    if 'http-equiv="refresh"' not in p.read_text(): err(f, 'stub has no refresh')
if (ROOT/'CNAME').read_text().strip() != 'giveglimpse.com': err('CNAME', 'wrong domain')
if '--live' in sys.argv:
    base = sys.argv[sys.argv.index('--live')+1].rstrip('/')
    for path in ['/', '/event-01.html', '/record.html', '/funding.html', '/privacy/', '/terms/', '/about.html', '/og.png', '/style.css', '/script.js']:
        try:
            r = urllib.request.urlopen(urllib.request.Request(base+path, headers={'User-Agent':'glimpse-check'}), timeout=15)
            if r.status != 200: err('live', f'{path} -> {r.status}')
        except Exception as e: err('live', f'{path} -> {e}')
if errs:
    print('\n'.join('FAIL ' + e for e in errs)); sys.exit(1)
print(f'OK: {len(PAGES)} pages, {len(STUBS)} redirects, disclosure identical' + (', live smoke passed' if '--live' in sys.argv else ''))
