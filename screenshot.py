from playwright.sync_api import sync_playwright
import os

URL = "http://localhost:5175/"
OUT = "./screenshots"
os.makedirs(OUT, exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1440, "height": 900})
    page.goto(URL, wait_until="networkidle")
    page.wait_for_timeout(1500)

    # 点击"开始体验 Demo"进入 Demo
    demo_btn = page.locator("text=开始体验 Demo")
    if demo_btn.count() > 0:
        demo_btn.click()
        page.wait_for_timeout(2000)

    # 1. 首页
    page.screenshot(path=f"{OUT}/01-home.png")
    print("✅ 首页截图完成")

    # 2. 进入更多菜单 → 记一下
    menu_btn = page.locator("button[aria-label='更多']").first
    if menu_btn.count() > 0:
        menu_btn.click()
        page.wait_for_timeout(800)
    record_btn = page.locator("text=记一下").first
    if record_btn.count() > 0:
        record_btn.click()
        page.wait_for_timeout(1000)
    page.screenshot(path=f"{OUT}/02-record.png")
    print("✅ 记一下截图完成")

    # 3. 返回更多 → 回头看看
    back_btn = page.locator("button[aria-label='返回更多']").first
    if back_btn.count() > 0:
        back_btn.click()
        page.wait_for_timeout(800)
    menu_btn2 = page.locator("button[aria-label='更多']").first
    if menu_btn2.count() > 0:
        menu_btn2.click()
        page.wait_for_timeout(800)
    lookback_btn = page.locator("text=回头看看").first
    if lookback_btn.count() > 0:
        lookback_btn.click()
        page.wait_for_timeout(1000)
    page.screenshot(path=f"{OUT}/03-lookback.png")
    print("✅ 回头看看截图完成")

    # 4. 返回更多 → 帮我整理
    back_btn2 = page.locator("button[aria-label='返回更多']").first
    if back_btn2.count() > 0:
        back_btn2.click()
        page.wait_for_timeout(800)
    menu_btn3 = page.locator("button[aria-label='更多']").first
    if menu_btn3.count() > 0:
        menu_btn3.click()
        page.wait_for_timeout(800)
    organize_btn = page.locator("text=帮我整理").first
    if organize_btn.count() > 0:
        organize_btn.click()
        page.wait_for_timeout(1000)
    page.screenshot(path=f"{OUT}/04-organize.png")
    print("✅ 帮我整理截图完成")

    browser.close()
    print("🎉 全部截图完成")
