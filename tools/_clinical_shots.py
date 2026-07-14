"""临时：截取「技术与临床框架」section 在不同视口下的可视区截图。用完即删。"""
from __future__ import annotations

import sys
from playwright.sync_api import sync_playwright

URL = "http://localhost:5204/"
OUT = "docs/clinical-review"
VIEWPORTS = [
    ("desktop-1440", 1440, 900),
    ("tablet-1024", 1024, 768),
    ("mobile-390", 390, 844),
]

import os
os.makedirs(OUT, exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    for name, w, h in VIEWPORTS:
        ctx = browser.new_context(viewport={"width": w, "height": h}, device_scale_factor=2)
        page = ctx.new_page()
        page.goto(URL, wait_until="networkidle", timeout=30000)
        page.wait_for_timeout(1200)
        # 滚动到 clinical section 顶部（留一点导航空间）
        page.evaluate("""() => {
            const el = document.getElementById('clinical');
            if (el) {
                const y = el.getBoundingClientRect().top + window.scrollY - 0;
                window.scrollTo(0, y);
            }
        }""")
        page.wait_for_timeout(1600)  # 等待 Reveal 入场
        # 视口截图（非整页），验证一屏可见性
        page.screenshot(path=os.path.join(OUT, f"{name}.png"), full_page=False)
        print(f"  ✓ {name}")
        ctx.close()
    browser.close()
print("done")
