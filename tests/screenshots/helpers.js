const fs = require('fs');
const path = require('path');

const SCREENSHOTS_DIR = path.join(__dirname, '..', '..', 'docs', 'screenshots');
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

const VIEWPORTS = {
  desktop: { width: 1280, height: 720 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 375, height: 667 },
};

async function ensureDir(dir = SCREENSHOTS_DIR) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function screenshot(page, name, viewportName) {
  const filename = `${name}-${viewportName}.png`;
  const filepath = path.join(SCREENSHOTS_DIR, filename);
  await page.screenshot({ path: filepath, fullPage: true });
  console.log(`  ✓ ${filename}`);
}

async function waitForAppReady(page) {
  await page.waitForSelector('#welcome-screen.active', { timeout: 15000 });
  await page.waitForTimeout(500);
}

async function openNavMenu(page, viewportName) {
  if (viewportName !== 'desktop') {
    await page.click('#nav-toggle');
    await page.waitForSelector('#nav-menu:not(.is-collapsed)', { timeout: 5000 });
    await page.waitForTimeout(300);
  }
}

async function navigateToAdmin(page, viewportName = 'desktop') {
  await page.goto(`${BASE_URL}/admin.html`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#login-view:not(.hidden)', { timeout: 15000 });
  await page.waitForTimeout(300);
}

module.exports = {
  SCREENSHOTS_DIR,
  BASE_URL,
  VIEWPORTS,
  ensureDir,
  screenshot,
  waitForAppReady,
  openNavMenu,
  navigateToAdmin,
};