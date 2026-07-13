"""官网外部端截图工具：按多个视口宽度截取整页 PNG。

用法：
    /Library/Frameworks/Python.framework/Versions/3.12/bin/python3 tools/website_screenshot.py \
        --url http://127.0.0.1:5199/ --out docs/website-content-refresh/before

文件命名：
    desktop-1440.png / desktop-1024.png / tablet-768.png / mobile-390.png
"""

from __future__ import annotations

import argparse
import os
import sys
from playwright.sync_api import sync_playwright


VIEWPORTS = [
    ("desktop-1440", 1440, 900),
    ("desktop-1024", 1024, 768),
    ("tablet-768", 768, 1024),
    ("mobile-390", 390, 844),
]


def main() -> int:
    parser = argparse.ArgumentParser(description="官网外部端多视口截图")
    parser.add_argument("--url", default="http://127.0.0.1:5199/")
    parser.add_argument(
        "--out",
        default="docs/website-content-refresh/before",
        help="输出目录",
    )
    parser.add_argument(
        "--only",
        default="",
        help="只截取指定名称（逗号分隔），留空则全部",
    )
    args = parser.parse_args()

    os.makedirs(args.out, exist_ok=True)
    only = {x.strip() for x in args.only.split(",") if x.strip()}

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        for name, width, height in VIEWPORTS:
            if only and name not in only:
                continue
            context = browser.new_context(
                viewport={"width": width, "height": height},
                device_scale_factor=2,
            )
            page = context.new_page()
            errors: list[str] = []
            page.on("pageerror", lambda err: errors.append(str(err)))
            page.on("console", lambda msg: errors.append(f"[{msg.type}] {msg.text}") if msg.type == "error" else None)
            try:
                page.goto(args.url, wait_until="networkidle", timeout=30000)
            except Exception as e:  # noqa: BLE001
                print(f"  ! goto 超时/失败 ({name}): {e}", file=sys.stderr)
            page.wait_for_timeout(2000)
            # 滚动到底部触发 Reveal 动效
            try:
                page.evaluate(
                    "() => { window.scrollTo(0, document.body.scrollHeight); }"
                )
                page.wait_for_timeout(1500)
                page.evaluate("() => window.scrollTo(0, 0)")
                page.wait_for_timeout(800)
            except Exception:
                pass
            out_path = os.path.join(args.out, f"{name}.png")
            page.screenshot(path=out_path, full_page=True)
            print(f"  ✓ {name} -> {out_path}")
            if errors:
                print(f"    console errors: {len(errors)}", file=sys.stderr)
                for e in errors[:5]:
                    print(f"      - {e}", file=sys.stderr)
            context.close()
        browser.close()
    print("done")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
