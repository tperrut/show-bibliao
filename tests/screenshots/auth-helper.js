const { BASE_URL } = require('./helpers');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@showbiblao.test';
const FAKE_API_KEY = 'fake-api-key-for-testing';

function buildFakeAuthUser(overrides = {}) {
  const uid = 'test-admin-uid';
  const now = Date.now();
  return {
    uid: uid,
    email: ADMIN_EMAIL,
    emailVerified: true,
    displayName: 'Admin Test',
    isAnonymous: false,
    metadata: {
      creationTime: new Date(now - 86400000).toISOString(),
      lastSignInTime: new Date(now).toISOString()
    },
    providerData: [{
      uid: uid,
      displayName: 'Admin Test',
      email: ADMIN_EMAIL,
      phoneNumber: null,
      photoURL: null,
      providerId: 'password'
    }],
    stsTokenManager: {
      accessToken: 'fake-access-token-' + now,
      expirationTime: now + 3600000,
      refreshToken: 'fake-refresh-token'
    },
    ...overrides
  };
}

async function ensureAdminAuth(page) {
  await page.goto(`${BASE_URL}/admin.html`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#login-view:not(.hidden)', { timeout: 15000 });

  // Injeta o usuário fake diretamente no adminState e dispara o render
  await page.evaluate(({ user, apiKey }) => {
    // Set no adminState global
    window.adminState = window.adminState || {};
    window.adminState.authUser = user;
    
    // Chama renderAuthView diretamente se existir
    if (typeof window.renderAuthView === 'function') {
      window.renderAuthView(user);
    }
    
    // Também chama handleRoute se existir
    if (typeof window.handleRoute === 'function') {
      window.handleRoute();
    }
    
    // Set no localStorage para persistência
    const key = `firebase:authUser:${apiKey}:[DEFAULT]`;
    localStorage.setItem(key, JSON.stringify(user));
    sessionStorage.setItem(key, JSON.stringify(user));
  }, { user: buildFakeAuthUser(), apiKey: FAKE_API_KEY });

  // Aguarda o painel admin aparecer
  await page.waitForSelector('#admin-view:not(.hidden)', { timeout: 15000 });
  await page.waitForSelector('#admin-nav:not(.hidden)', { timeout: 5000 });
  await page.waitForSelector('#user-email', { timeout: 5000 });
  await page.waitForTimeout(500);

  const userEmail = await page.textContent('#user-email');
  console.log(`  ✓ Painel admin autenticado como: ${userEmail}`);
}

async function loginAdmin(page) {
  await page.goto(`${BASE_URL}/admin.html`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#login-view:not(.hidden)', { timeout: 15000 });

  await page.fill('#login-email', ADMIN_EMAIL);
  await page.fill('#login-password', 'admin123');
  await page.click('#login-btn');

  await page.waitForSelector('#login-view.hidden', { timeout: 15000 });
  await page.waitForSelector('#admin-view:not(.hidden)', { timeout: 10000 });
  await page.waitForSelector('#admin-nav:not(.hidden)', { timeout: 5000 });
  await page.waitForTimeout(500);

  console.log('  ✓ Login admin realizado via UI');
}

async function loginAdminViaEmulator(page) {
  const authEmulatorUrl = process.env.FIREBASE_AUTH_EMULATOR_URL || 'http://localhost:9099';

  try {
    const response = await fetch(`${authEmulatorUrl}/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FAKE_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: ADMIN_EMAIL,
        password: 'admin123',
        returnSecureToken: true
      })
    });

    if (response.ok) {
      const data = await response.json();
      await page.evaluate((token) => {
        const user = {
          apiKey: FAKE_API_KEY,
          displayName: '',
          email: ADMIN_EMAIL,
          emailVerified: true,
          expiresIn: '3600',
          localId: data.localId,
          refreshToken: data.refreshToken,
          uid: data.localId,
          accessToken: data.idToken,
          stsTokenManager: {
            accessToken: data.idToken,
            expirationTime: Date.now() + 3600000,
            refreshToken: data.refreshToken
          }
        };
        localStorage.setItem(`firebase:authUser:${FAKE_API_KEY}:[DEFAULT]`, JSON.stringify(user));
        sessionStorage.setItem(`firebase:authUser:${FAKE_API_KEY}:[DEFAULT]`, JSON.stringify(user));
      }, data.idToken);
      console.log('  ✓ Token de auth definido via emulador');
      return true;
    }
  } catch (err) {
    console.log('  ⚠ Emulador de auth não disponível');
  }
  return false;
}

async function logoutAdmin(page) {
  const logoutBtn = page.locator('#logout-btn');
  if (await logoutBtn.count() > 0) {
    await logoutBtn.click();
    await page.waitForSelector('#login-view:not(.hidden)', { timeout: 5000 });
  }
}

module.exports = {
  ADMIN_EMAIL,
  FAKE_API_KEY,
  buildFakeAuthUser,
  ensureAdminAuth,
  loginAdmin,
  loginAdminViaEmulator,
  logoutAdmin,
};