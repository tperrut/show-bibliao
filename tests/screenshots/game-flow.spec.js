const { test } = require('@playwright/test');
const {
  BASE_URL,
  VIEWPORTS,
  ensureDir,
  screenshot,
  waitForAppReady,
  openNavMenu,
} = require('./helpers');

test.describe.configure({ retries: 0, timeout: 120000 });

test.describe('Game Flow - Fluxo do Jogo', () => {
  test.beforeAll(async () => {
    await ensureDir();
  });

  for (const [viewportName, viewport] of Object.entries(VIEWPORTS)) {
    test.describe(`Viewport: ${viewportName} (${viewport.width}x${viewport.height})`, () => {
      test.use({ viewport });

      test('01 - Tela inicial (welcome)', async ({ page }) => {
        await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
        await waitForAppReady(page);
        await screenshot(page, '01-welcome', viewportName);
      });

      test('02 - Modal de Regras', async ({ page }) => {
        await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
        await waitForAppReady(page);
        await openNavMenu(page, viewportName);
        await page.click('#open-rules');
        await page.waitForSelector('#rules-modal:not([hidden])', { timeout: 5000 });
        await page.waitForTimeout(300);
        await screenshot(page, '02-rules-modal', viewportName);
        await page.click('#close-rules');
      });

      test('03 - Modal Escolher Questionários', async ({ page }) => {
        await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
        await waitForAppReady(page);
        await openNavMenu(page, viewportName);
        await page.click('#open-questionnaires');
        await page.waitForSelector('#questionnaires-submenu:not([hidden])', { timeout: 5000 });
        await page.click('#questionnaires-submenu .nav-subitem:first-child');
        await page.waitForSelector('#questionnaires-modal:not([hidden])', { timeout: 5000 });
        await page.waitForTimeout(1500);
        await screenshot(page, '03-questionnaires-modal', viewportName);
        await page.click('#close-questionnaires');
      });

      test('04 - Tela de jogo - primeira pergunta', async ({ page }) => {
        await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
        await waitForAppReady(page);
        await openNavMenu(page, viewportName);
        await page.click('#open-questionnaires');
        await page.waitForSelector('#questionnaires-submenu:not([hidden])');
        await page.click('#questionnaires-submenu .nav-subitem:first-child');
        await page.waitForSelector('#questionnaires-modal:not([hidden])');
        await page.waitForTimeout(1500);

        const firstQuestionnaire = page.locator('.questionnaire-option[data-complete="true"]').first();
        if (await firstQuestionnaire.count() > 0) {
          await firstQuestionnaire.click();
          await page.waitForTimeout(1000);
          await page.waitForSelector('.slide.active:not(#welcome-screen)', { timeout: 15000 });
          await page.waitForSelector('#game-dashboard:not([style*="display: none"])', { timeout: 5000 });
          await page.waitForTimeout(500);
          await screenshot(page, '04-game-first-question', viewportName);
        } else {
          console.log(`  ⚠ Nenhum questionário completo (15/15) encontrado em ${viewportName}`);
        }
      });

      test('05 - Tela final (game over)', async ({ page }) => {
        await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
        await waitForAppReady(page);
        await openNavMenu(page, viewportName);
        await page.click('#open-questionnaires');
        await page.waitForSelector('#questionnaires-submenu:not([hidden])');
        await page.click('#questionnaires-submenu .nav-subitem:first-child');
        await page.waitForSelector('#questionnaires-modal:not([hidden])');
        await page.waitForTimeout(1500);

        const firstQuestionnaire = page.locator('.questionnaire-option[data-complete="true"]').first();
        if (await firstQuestionnaire.count() > 0) {
          await firstQuestionnaire.click();
          await page.waitForTimeout(1000);
          await page.waitForSelector('.slide.active:not(#welcome-screen)', { timeout: 15000 });

          for (let i = 0; i < 15; i++) {
            const optionBtn = page.locator('.option-btn:not(.correct):not(.incorrect)').first();
            if (await optionBtn.count() > 0) {
              await optionBtn.click();
              await page.waitForTimeout(600);
            } else {
              break;
            }
          }

          await page.waitForSelector('#final-screen.active', { timeout: 15000 });
          await page.waitForTimeout(500);
          await screenshot(page, '05-game-final', viewportName);
        } else {
          console.log(`  ⚠ Pulando tela final - sem questionário completo em ${viewportName}`);
        }
      });
    });
  }
});