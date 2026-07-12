import { chromium } from "playwright";

const URL = "http://localhost:5175/";
const OUT = "./screenshots";

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);

  // 点击"开始体验 Demo"进入 Demo
  const demoBtn = page.locator("text=开始体验 Demo");
  if (await demoBtn.count() > 0) {
    await demoBtn.click();
    await page.waitForTimeout(2000);
  }

  // 1. 首页
  await page.screenshot({ path: `${OUT}/01-home.png` });
  console.log("✅ 首页截图完成");

  // 2. 进入更多菜单 → 记一下
  const menuBtn = page.locator("button[aria-label='更多']").first();
  if (await menuBtn.count() > 0) {
    await menuBtn.click();
    await page.waitForTimeout(800);
  }
  const recordBtn = page.locator("text=记一下").first();
  if (await recordBtn.count() > 0) {
    await recordBtn.click();
    await page.waitForTimeout(1000);
  }
  await page.screenshot({ path: `${OUT}/02-record.png` });
  console.log("✅ 记一下截图完成");

  // 3. 返回更多 → 回头看看
  const backBtn = page.locator("button[aria-label='返回更多']").first();
  if (await backBtn.count() > 0) {
    await backBtn.click();
    await page.waitForTimeout(800);
  }
  // 重新打开更多
  const menuBtn2 = page.locator("button[aria-label='更多']").first();
  if (await menuBtn2.count() > 0) {
    await menuBtn2.click();
    await page.waitForTimeout(800);
  }
  const lookbackBtn = page.locator("text=回头看看").first();
  if (await lookbackBtn.count() > 0) {
    await lookbackBtn.click();
    await page.waitForTimeout(1000);
  }
  await page.screenshot({ path: `${OUT}/03-lookback.png` });
  console.log("✅ 回头看看截图完成");

  // 4. 返回更多 → 帮我整理
  const backBtn2 = page.locator("button[aria-label='返回更多']").first();
  if (await backBtn2.count() > 0) {
    await backBtn2.click();
    await page.waitForTimeout(800);
  }
  const menuBtn3 = page.locator("button[aria-label='更多']").first();
  if (await menuBtn3.count() > 0) {
    await menuBtn3.click();
    await page.waitForTimeout(800);
  }
  const organizeBtn = page.locator("text=帮我整理").first();
  if (await organizeBtn.count() > 0) {
    await organizeBtn.click();
    await page.waitForTimeout(1000);
  }
  await page.screenshot({ path: `${OUT}/04-organize.png` });
  console.log("✅ 帮我整理截图完成");

  await browser.close();
  console.log("🎉 全部截图完成");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
