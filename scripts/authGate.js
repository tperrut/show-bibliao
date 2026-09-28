// ===============================
// PORTÃO DE AUTORIZAÇÃO DO HISTÓRICO
// Responde a uma pergunta só: "esta partida pode ser gravada agora?"
// Sem DOM — devolve dados e o main.js decide o que apresentar.
// A pendência vive no sessionStorage: é de uso único e deve evaporar
// com a aba, e a sessão do Firebase Auth já é persistida pelo próprio SDK.
// ===============================

const PENDING_RECORD_KEY = 'showbiblao.pendingRecord';

// Sessão de admin disponível? (requireAdmin do firebaseService valida a
// exceção; aqui é só a consulta, para o jogo decidir o que mostrar.)
function hasAdminSession() {
  try {
    const { auth } = initFirebase();
    return !!auth.currentUser;
  } catch (err) {
    debugLog('Sessão de admin indisponível', err);
    return false;
  }
}

// E-mail do admin logado — vai para o documento como autoria do salvamento.
function currentUserEmail() {
  try {
    const { auth } = initFirebase();
    const user = auth.currentUser;
    return user && user.email ? user.email : '';
  } catch (err) {
    return '';
  }
}

// Guarda o registro montado para retomar depois do login.
// Devolve false se o sessionStorage recusar (modo privado / cota).
function savePendingRecord(record) {
  try {
    sessionStorage.setItem(PENDING_RECORD_KEY, JSON.stringify(record));
    return true;
  } catch (err) {
    console.error('[ShowBiblao] não foi possível guardar o registro pendente:', err);
    return false;
  }
}

// Lê o registro pendente da aba. JSON inválido ou registro incompleto é
// descartado, não lançado (evita reabrir um prompt que nunca pode salvar).
function readPendingRecord() {
  try {
    const raw = sessionStorage.getItem(PENDING_RECORD_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed) ||
        typeof parsed.playedAt !== 'string') {
      clearPendingRecord();
      return null;
    }
    return parsed;
  } catch (err) {
    console.error('[ShowBiblao] registro pendente ilegível, descartando:', err);
    clearPendingRecord();
    return null;
  }
}

function clearPendingRecord() {
  try {
    sessionStorage.removeItem(PENDING_RECORD_KEY);
  } catch (err) {
    // Nada a fazer: sem storage não há pendência para limpar.
  }
}

// Observa a sessão do Firebase Auth. Devolve a função de cancelamento, se houver.
// (nome watchAuthSession para não colidir com o onAuthStateChange global de
// firebaseService.js, usado pelo painel)
function watchAuthSession(callback) {
  try {
    return onAuthStateChange(user => {
      if (typeof callback === 'function') callback(!!user);
    });
  } catch (err) {
    debugLog('Não foi possível observar a sessão de auth', err);
    return null;
  }
}
