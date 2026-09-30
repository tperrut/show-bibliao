const { test } = require('@playwright/test');
const {
  BASE_URL,
  VIEWPORTS,
  ensureDir,
  screenshot,
  waitForAppReady,
  openNavMenu,
} = require('./helpers');
const { ensureAdminAuth } = require('./auth-helper');

test.describe.configure({ retries: 0, timeout: 120000 });

test.describe('Error States - Estados de Erro/Validação', () => {
  test.beforeAll(async () => {
    await ensureDir();
  });

  test.describe('Desktop (1280x720)', () => {
    test.use({ viewport: VIEWPORTS.desktop });

    test('Questionário incompleto (< 15 perguntas)', async ({ page }) => {
      await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
      await waitForAppReady(page);
      await openNavMenu(page, 'desktop');
      await page.click('#open-questionnaires');
      await page.waitForSelector('#questionnaires-submenu:not([hidden])');
      await page.click('#questionnaires-submenu .nav-subitem:first-child');
      await page.waitForSelector('#questionnaires-modal:not([hidden])');
      await page.waitForTimeout(1000);

      const incomplete = page.locator('.questionnaire-option[data-complete="false"]').first();
      if (await incomplete.count() > 0) {
        await incomplete.click();
        await page.waitForTimeout(500);
        await screenshot(page, 'error-incomplete-questionnaire', 'desktop');
      } else {
        console.log('  ⚠ Nenhum questionário incompleto encontrado');
      }
    });

    test('Admin - Login inválido', async ({ page }) => {
      await page.goto(`${BASE_URL}/admin.html`, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('#login-view:not(.hidden)', { timeout: 15000 });

      await page.fill('#login-email', 'invalido@test.com');
      await page.fill('#login-password', 'senhaerrada');
      await page.click('#login-btn');
      await page.waitForSelector('#login-error:not(.hidden)', { timeout: 5000 });
      await page.waitForTimeout(300);
      await screenshot(page, 'admin-error-invalid-login', 'desktop');
    });

    test('Admin - Formulário de questionário vazio', async ({ page }) => {
      await ensureAdminAuth(page);
      await page.waitForSelector('#view-questionnaires:not(.hidden)', { timeout: 10000 });
      await page.click('#add-questionnaire-btn');
      await page.waitForSelector('#view-questionnaire-form:not(.hidden)', { timeout: 5000 });
      await page.click('#save-questionnaire-btn');
      await page.waitForSelector('#questionnaire-form-error:not(.hidden)', { timeout: 5000 });
      await page.waitForTimeout(300);
      await screenshot(page, 'admin-error-empty-questionnaire-form', 'desktop');
    });
  });
});