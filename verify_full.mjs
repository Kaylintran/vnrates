import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.setViewportSize({ width: 1280, height: 900 });

await page.goto('http://localhost:3000/vi', { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(1000);

// Scroll slowly to trigger all IntersectionObserver animations
const scrollHeight = await page.evaluate(() => document.body.scrollHeight);
for (let y = 0; y <= scrollHeight; y += 300) {
  await page.evaluate(pos => window.scrollTo(0, pos), y);
  await page.waitForTimeout(200);
}
// Scroll back to top
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(500);

const screenshotPath = path.join(__dirname, 'verify_homepage_full.png');
await page.screenshot({ path: screenshotPath, fullPage: true });
console.log('Full homepage screenshot saved:', screenshotPath);

// Also do 375px mobile view
await page.setViewportSize({ width: 375, height: 812 });
await page.goto('http://localhost:3000/vi', { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(1000);
const scrollHeight2 = await page.evaluate(() => document.body.scrollHeight);
for (let y = 0; y <= scrollHeight2; y += 200) {
  await page.evaluate(pos => window.scrollTo(0, pos), y);
  await page.waitForTimeout(150);
}
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(300);
const mobilePath = path.join(__dirname, 'verify_homepage_mobile.png');
await page.screenshot({ path: mobilePath, fullPage: true });
console.log('Mobile homepage screenshot saved:', mobilePath);

await browser.close();
