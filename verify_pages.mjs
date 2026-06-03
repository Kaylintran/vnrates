import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const pages = [
  { url: 'http://localhost:3000/vi', name: 'homepage' },
  { url: 'http://localhost:3000/vi/news', name: 'news' },
  { url: 'http://localhost:3000/vi/converter', name: 'converter' },
  { url: 'http://localhost:3000/vi/black-market', name: 'black_market' },
  { url: 'http://localhost:3000/vi/news/usd-tang-manh-truoc-inflation-data', name: 'news_slug' },
];

const browser = await chromium.launch({ headless: true });
const results = [];

for (const { url, name } of pages) {
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 900 });

  try {
    const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    const status = response.status();

    // Wait for animations to settle
    await page.waitForTimeout(1500);

    // Scroll to trigger IntersectionObserver animations
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 3));
    await page.waitForTimeout(600);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(300);

    const screenshotPath = path.join(__dirname, `verify_${name}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: false });

    // Check for error indicators
    const bodyText = await page.evaluate(() => document.body.innerText.substring(0, 200));
    const hasError = bodyText.includes('500') || bodyText.includes('Error') || bodyText.includes('error');

    results.push({ name, url, status, screenshot: screenshotPath, hasError, bodySnippet: bodyText.substring(0, 100) });
    console.log(`✅ ${name}: HTTP ${status} → ${screenshotPath}`);
  } catch (err) {
    results.push({ name, url, status: 'ERROR', error: err.message });
    console.log(`❌ ${name}: ${err.message}`);
  }

  await page.close();
}

await browser.close();

console.log('\n--- Summary ---');
results.forEach(r => {
  const icon = r.status === 200 ? '✅' : '❌';
  console.log(`${icon} ${r.name}: ${r.status}`);
  if (r.error) console.log(`   Error: ${r.error}`);
});
