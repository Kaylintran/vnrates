import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const browser = await chromium.launch({ headless: true });

for (const locale of ['vi', 'ko', 'zh-CN']) {
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(`http://localhost:3000/${locale}/rates`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1200);

  // Scroll a bit to trigger animations
  await page.evaluate(() => window.scrollTo(0, 300));
  await page.waitForTimeout(400);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);

  const screenshotPath = path.join(__dirname, `verify_rates_${locale.replace('-', '_')}.png`);
  await page.screenshot({ path: screenshotPath });

  // Check the tab labels
  const tabText = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button')).filter(b =>
      b.textContent.includes('통화') || b.textContent.includes('Theo') ||
      b.textContent.includes('按') || b.textContent.includes('currency') ||
      b.textContent.includes('银行') || b.textContent.includes('은행')
    );
    return btns.map(b => b.textContent.trim()).join(' | ');
  });

  // Check language switcher text
  const switcherText = await page.evaluate(() => {
    const div = document.querySelector('[translate="no"]');
    return div ? div.textContent.trim() : 'NOT FOUND';
  });

  console.log(`[${locale}] tabs: "${tabText}" | switcher: "${switcherText}"`);
  console.log(`[${locale}] screenshot: ${screenshotPath}`);
  await page.close();
}

await browser.close();
