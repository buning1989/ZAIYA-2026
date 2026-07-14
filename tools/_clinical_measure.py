"""临时：测量「技术与临床框架」section 布局指标。用完即删。"""
from __future__ import annotations
from playwright.sync_api import sync_playwright

URL = "http://localhost:5204/"

def measure(w, h):
    with sync_playwright() as p:
        b = p.chromium.launch(headless=True)
        ctx = b.new_context(viewport={"width": w, "height": h}, device_scale_factor=1)
        page = ctx.new_page()
        page.goto(URL, wait_until="networkidle", timeout=30000)
        page.wait_for_timeout(1200)
        page.evaluate("() => { const el=document.getElementById('clinical'); if(el){window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY);} }")
        page.wait_for_timeout(1500)
        info = page.evaluate("""() => {
            const sec = document.getElementById('clinical');
            const cards = Array.from(sec.querySelectorAll('article'));
            const nav = document.querySelector('nav');
            const navH = nav ? Math.round(nav.getBoundingClientRect().height) : 0;
            const secTop = Math.round(sec.getBoundingClientRect().top);
            const secBottom = Math.round(sec.getBoundingClientRect().bottom);
            const cardRects = cards.map(c => { const r=c.getBoundingClientRect(); return {w:Math.round(r.width),h:Math.round(r.height),top:Math.round(r.top),bottom:Math.round(r.bottom)}; });
            // value title = the div child of article (code is h3, name is p, value is div, note is p)
            const valueTops = cards.map(c => { const d=c.querySelector('div'); return Math.round(d.getBoundingClientRect().top); });
            const codeTops = cards.map(c => { const d=c.querySelector('h3'); return Math.round(d.getBoundingClientRect().top); });
            const nameTops = cards.map(c => { const ps=c.querySelectorAll('p'); return Math.round(ps[0].getBoundingClientRect().top); });
            const noteTops = cards.map(c => { const ps=c.querySelectorAll('p'); return Math.round(ps[1].getBoundingClientRect().top); });
            const disclaimer = sec.querySelector('p.text-ink-faint');
            const discRect = disclaimer ? disclaimer.getBoundingClientRect() : null;
            const rows = new Set(cardRects.map(r=>r.top));
            return {
                viewportH: window.innerHeight, navH,
                secTop, secBottom, secHeight: secBottom-secTop,
                cardWidths: cardRects.map(r=>r.w),
                cardHeights: cardRects.map(r=>r.h),
                rows: rows.size,
                codeTops, nameTops, valueTops, noteTops,
                disclaimerTop: discRect?Math.round(discRect.top):null,
                disclaimerBottom: discRect?Math.round(discRect.bottom):null,
                disclaimerOneLine: discRect ? (Math.round(discRect.height) <= 22) : null,
            };
        }""")
        print(f"\n=== {w}x{h} ===")
        for k,v in info.items():
            print(f"  {k}: {v}")
        ctx.close(); b.close()

measure(1440, 900)
measure(1024, 768)
measure(390, 844)
