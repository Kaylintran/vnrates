import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.setViewportSize({ width: 375, height: 812 });

await page.goto('http://localhost:3000/vi', { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(800);

// Scroll to trigger all animations
const scrollHeight = await page.evaluate(() => document.body.scrollHeight);
for (let y = 0; y <= scrollHeight; y += 250) {
  await page.evaluate(pos => window.scrollTo(0, pos), y);
  await page.waitForTimeout(120);
}
await page.waitForTimeout(400);

// Find the dashboard section and scroll to it
const dashY = await page.evaluate(() => {
  const headings = Array.from(document.querySelectorAll('h2'));
  const dash = headings.find(h => h.textContent.includes('Dữ liệu phức tạp') || h.textContent.includes('phức tạp'));
  return dash ? dash.getBoundingClientRect().top + window.scrollY - 80 : 3000;
});

await page.evaluate(y => window.scrollTo(0, y), dashY);
await page.waitForTimeout(400);

const dashPath = path.join(__dirname, 'verify_mobile_dashboard.png');
await page.screenshot({ path: dashPath });
console.log('Dashboard mobile screenshot:', dashPath, '| scrolled to y=', dashY);

// Also hero section
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(300);
const heroPath = path.join(__dirname, 'verify_mobile_hero.png');
await page.screenshot({ path: heroPath });
console.log('Hero mobile screenshot:', heroPath);

await browser.close();
