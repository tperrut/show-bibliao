// ===============================
// AUTENTICAÇÃO DO PAINEL
// ===============================

function renderAuthView(user) {
  adminState.authUser = user;
  const logged = !!user;
  $('login-view').classList.toggle('hidden', logged);
  $('admin-view').classList.toggle('hidden', !logged);
  $('auth-actions').classList.toggle('hidden', !logged);
  if (user) {
    $('user-email').textContent = user.email;
  }
}

function initAuth() {
  const loginBtn = $('login-btn');
  if (loginBtn) {
    loginBtn.onclick = async () => {
      const email = $('login-email').value.trim();
      const password = $('login-password').value.trim();
      if (!email || !password) {
        showMessage('login-error', 'Preencha email e senha.', 'error');
        return;
      }
      try {
        await loginAdmin(email, password);
        hideMessage('login-error');
      } catch (err) {
        showMessage('login-error', 'Email ou senha inválidos.', 'error');
      }
    };
  }

  const logoutBtn = $('logout-btn');
  if (logoutBtn) {
    logoutBtn.onclick = () => logoutAdmin();
  }

  const forgotBtn = $('forgot-password-btn');
  if (forgotBtn) {
    forgotBtn.onclick = async () => {
      const email = $('login-email').value.trim();
      if (!email) {
        showMessage('login-error', 'Informe o email para redefinir a senha.', 'error');
        return;
      }
      try {
        await sendPasswordResetEmail(email);
        showMessage('login-error', 'Email de redefinição enviado.', 'success');
      } catch (err) {
        showMessage('login-error', 'Erro ao enviar email de redefinição.', 'error');
      }
    };
  }
}

onAuthStateChange(user => {
  renderAuthView(user);
  if (user && typeof handleRoute === 'function') {
    handleRoute();
  }
});
