const { test } = require('@playwright/test');
const {
  BASE_URL,
  VIEWPORTS,
  ensureDir,
  screenshot,
  navigateToAdmin,
} = require('./helpers');
const { ensureAdminAuth, logoutAdmin } = require('./auth-helper');

test.describe.configure({ retries: 0, timeout: 180000 });

test.describe('Admin Flow - Fluxo do Painel Administrativo', () => {
  test.beforeAll(async () => {
    await ensureDir();
  });

  test.describe('Desktop (1280x720)', () => {
    test.use({ viewport: VIEWPORTS.desktop });

    test('01 - Tela de Login', async ({ page }) => {
      await navigateToAdmin(page, 'desktop');
      await screenshot(page, 'admin-01-login', 'desktop');
    });

    test('02 - Lista de Questionários (autenticado)', async ({ page }) => {
      await ensureAdminAuth(page);
      await page.waitForSelector('#view-questionnaires:not(.hidden)', { timeout: 10000 });
      await page.waitForTimeout(500);
      await screenshot(page, 'admin-02-questionnaires-list', 'desktop');
    });

    test('03 - Formulário de Questionário', async ({ page }) => {
      await ensureAdminAuth(page);
      await page.click('#add-questionnaire-btn');
      await page.waitForSelector('#view-questionnaire-form:not(.hidden)', { timeout: 5000 });
      await page.waitForSelector('#form-title-questionnaire', { timeout: 5000 });
      await page.waitForTimeout(300);
      await screenshot(page, 'admin-03-questionnaire-form', 'desktop');
      await page.click('#cancel-questionnaire-btn');
    });

    test('04 - Formulário de Pergunta', async ({ page }) => {
      await ensureAdminAuth(page);
      await page.waitForSelector('#view-questionnaires:not(.hidden)', { timeout: 10000 });
      const firstRow = page.locator('#questionnaires-table-body tr').first();
      if (await firstRow.count() > 0) {
        await firstRow.locator('button[title="Visualizar"]').first().click();
        await page.waitForSelector('#view-questionnaire-detail:not(.hidden)', { timeout: 5000 });
        await page.click('#detail-add-question-btn');
        await page.waitForSelector('#view-question-form:not(.hidden)', { timeout: 5000 });
        await page.waitForSelector('#form-title-question', { timeout: 5000 });
        await page.waitForTimeout(300);
        await screenshot(page, 'admin-04-question-form', 'desktop');
        await page.click('#cancel-question-btn');
      } else {
        console.log('  ⚠ Nenhum questionário para testar formulário de pergunta');
      }
    });

    test('05 - Visualização de Questionário', async ({ page }) => {
      await ensureAdminAuth(page);
      await page.waitForSelector('#view-questionnaires:not(.hidden)', { timeout: 10000 });
      const firstRow = page.locator('#questionnaires-table-body tr').first();
      if (await firstRow.count() > 0) {
        await firstRow.locator('button[title*="Visualizar"]').first().click();
        await page.waitForSelector('#view-questionnaire-detail:not(.hidden)', { timeout: 5000 });
        await page.waitForSelector('#detail-name', { timeout: 5000 });
        await page.waitForTimeout(500);
        await screenshot(page, 'admin-05-questionnaire-detail', 'desktop');
        await page.click('#detail-back-btn');
      } else {
        console.log('  ⚠ Nenhum questionário para visualizar');
      }
    });

    test('06 - Histórico de Jogadas', async ({ page }) => {
      await ensureAdminAuth(page);
      await page.click('#nav-tab-historico');
      await page.waitForSelector('#view-game-history:not(.hidden)', { timeout: 5000 });
      await page.waitForTimeout(500);
      await screenshot(page, 'admin-06-game-history', 'desktop');
    });

    test('07 - Logout', async ({ page }) => {
      await ensureAdminAuth(page);
      // Simula logout limpando o adminState
      await page.evaluate(() => {
        window.adminState = window.adminState || {};
        window.adminState.authUser = null;
        if (typeof window.renderAuthView === 'function') {
          window.renderAuthView(null);
        }
      });
      await page.waitForSelector('#login-view:not(.hidden)', { timeout: 5000 });
      await page.waitForTimeout(300);
      await screenshot(page, 'admin-07-logout', 'desktop');
    });
  });
});