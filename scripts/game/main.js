// ===============================
// INICIALIZAÇÃO E FINALIZAÇÃO
// ===============================

// Log de depuração — prefixo único para filtrar no Console (F12)
function debugLog(...args) {
  console.log('[ShowBiblao]', ...args);
}

debugLog('main.js carregado');

// Preenche o modal de regras a partir de gameRules (escada e total).
function renderRulesModal() {
  const countEl = document.getElementById('rules-questions-count');
  if (countEl) countEl.textContent = `${QUESTIONS_TARGET} perguntas`;

  const list = document.getElementById('rules-points-list');
  if (list) {
    list.innerHTML = POINTS_LADDER.map((points, index) => `
      <div><span class="point-number">${index + 1}</span> <span class="point-desc">${points} pontos</span></div>
    `).join('');
  }
}

document.addEventListener('DOMContentLoaded', function() {
  debugLog('DOM pronto — montando telas');
  renderRulesModal();
  createGameScreens();
  setCurrentQuestionnaire(null, 'Padrão');
  document.getElementById('start-game').addEventListener('click', requestStartGame);
  document.getElementById('play-again').addEventListener('click', resetGame);
  const backHomeBtn = document.getElementById('back-home');
  if (backHomeBtn) backHomeBtn.addEventListener('click', resetGame);
  const saveHistoryBtn = document.getElementById('save-game-history');
  if (saveHistoryBtn) saveHistoryBtn.addEventListener('click', () => openSaveHistoryPrompt());
  initProgressBar();
  setupMainNav();
  setupExitGame();
  setupGameHistory();
  debugLog('Telas criadas, listeners de início/reset/nav/sair OK');
});

// Expande/recolhe o sub-menu de anos do item "Escolher Questionários".
function setQuestionnairesSubmenuOpen(open) {
  const btn = document.getElementById('open-questionnaires');
  const submenu = document.getElementById('questionnaires-submenu');
  if (!btn || !submenu) return;
  btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  submenu.hidden = !open;
}

// Pede confirmação do questionário antes de iniciar (se ainda não foi escolhido).
function requestStartGame() {
  if (questionnaireChosen) {
    startGame();
    return;
  }

  openModal(`<div style="text-align:center;">
    <h3 style="color:var(--primary-color); margin-bottom:15px;">Questionário ainda não escolhido</h3>
    <p style="font-size:1.15rem; margin-bottom:8px;">Deseja jogar com o questionário <b>Padrão</b>?</p>
    <div class="modal-actions">
      <button type="button" class="btn-primary" id="confirm-play-default">Jogar com padrão</button>
      <button type="button" class="btn-primary" id="confirm-choose-questionnaire">Escolher questionário</button>
      <button type="button" class="btn-primary" id="confirm-cancel-start">Cancelar</button>
    </div>
  </div>`);

  const playDefault = document.getElementById('confirm-play-default');
  const chooseQ = document.getElementById('confirm-choose-questionnaire');
  const cancelStart = document.getElementById('confirm-cancel-start');

  if (playDefault) {
    playDefault.onclick = function () {
      setQuestionnaireChosen();
      setCurrentQuestionnaire(null, 'Padrão');
      closeModal();
      startGame();
    };
  }
  if (chooseQ) {
    // Com o sub-menu de anos no menu lateral, este botão expande o sub-menu
    // (e abre o drawer no mobile) em vez de abrir o modal diretamente.
    chooseQ.onclick = function () {
      closeModal();
      setQuestionnairesSubmenuOpen(true);
      if (typeof window.abrirMenuLateral === 'function') window.abrirMenuLateral();
    };
  }
  if (cancelStart) {
    cancelStart.onclick = function () {
      closeModal();
    };
  }
}

// Menu lateral da tela inicial.
// Web (>=769px): barra fixa, recolhível (‹, handle » ou hover na borda).
// Mobile: drawer com hambúrguer.
function setupMainNav() {
  const toggle = document.getElementById('nav-toggle');
  const menu = document.getElementById('nav-menu');
  const backdrop = document.getElementById('nav-backdrop');
  const closeBtn = document.getElementById('nav-menu-close');
  const expandBtn = document.getElementById('nav-expand');
  const hoverZone = document.getElementById('nav-hover-zone');
  if (!toggle || !menu) return;

  const mqDesktop = window.matchMedia('(min-width: 769px)');
  const STORAGE_KEY = 'showbiblao.navCollapsed';
  let peekOpen = false;

  function isOpen() {
    return menu.classList.contains('is-open');
  }

  function isCollapsed() {
    return menu.classList.contains('is-collapsed');
  }

  function openMenu() {
    menu.classList.add('is-open');
    if (backdrop) {
      backdrop.hidden = false;
      backdrop.classList.add('is-open');
    }
    toggle.setAttribute('aria-expanded', 'true');
  }

  function closeMenu() {
    menu.classList.remove('is-open');
    if (backdrop) {
      backdrop.classList.remove('is-open');
      backdrop.hidden = true;
    }
    toggle.setAttribute('aria-expanded', 'false');
  }

  // Expõe a abertura do menu para outros fluxos (ex.: "Escolher questionário"
  // na confirmação de início de jogo). No desktop o menu já está fixo.
  window.abrirMenuLateral = function () {
    if (!mqDesktop.matches) openMenu();
  };

  // Recolhe/expande a barra fixa no web.
  // keepLayout: só move o painel (peek no hover) sem alterar o padding do conteúdo.
  function setCollapsed(collapsed, options) {
    const keepLayout = options && options.keepLayout;
    menu.classList.toggle('is-collapsed', collapsed);
    if (!keepLayout) {
      document.body.classList.toggle('nav-collapsed', collapsed);
      try {
        localStorage.setItem(STORAGE_KEY, collapsed ? '1' : '0');
      } catch (e) { /* sem armazenamento */ }
    }
    if (closeBtn) closeBtn.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
    if (expandBtn) {
      expandBtn.hidden = !document.body.classList.contains('nav-collapsed');
      expandBtn.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
    }
  }

  function applyCollapsedFromStorage() {
    let collapsed = false;
    try {
      collapsed = localStorage.getItem(STORAGE_KEY) === '1';
    } catch (e) { /* ignora */ }
    setCollapsed(collapsed);
  }

  // Desktop: barra fixa (respeita preferência salva); mobile: drawer normal.
  function syncDesktopMode() {
    if (mqDesktop.matches) {
      menu.classList.add('is-open');
      if (backdrop) {
        backdrop.classList.remove('is-open');
        backdrop.hidden = true;
      }
      toggle.setAttribute('aria-expanded', 'true');
      applyCollapsedFromStorage();
    } else {
      closeMenu();
      setCollapsed(false);
      peekOpen = false;
    }
  }

  toggle.addEventListener('click', function () {
    if (mqDesktop.matches) return;
    if (isOpen()) closeMenu();
    else openMenu();
  });

  // ‹ recolhe (web)
  if (closeBtn) {
    closeBtn.addEventListener('click', function () {
      if (!mqDesktop.matches) {
        closeMenu();
        return;
      }
      peekOpen = false;
      setCollapsed(true);
    });
  }

  // » reabre e fixa (web)
  if (expandBtn) {
    expandBtn.addEventListener('click', function () {
      if (!mqDesktop.matches) return;
      peekOpen = false;
      setCollapsed(false);
    });
  }

  // Hover na borda esquerda: peek (abre por cima sem mudar layout)
  if (hoverZone) {
    hoverZone.addEventListener('mouseenter', function () {
      if (!mqDesktop.matches || !isCollapsed()) return;
      peekOpen = true;
      setCollapsed(false, { keepLayout: true });
    });
  }

  // Saiu do menu com o mouse durante o peek → recolhe de novo
  menu.addEventListener('mouseleave', function () {
    if (!mqDesktop.matches || !peekOpen) return;
    peekOpen = false;
    setCollapsed(true);
  });

  // Hover direto no handle » também abre o peek
  if (expandBtn) {
    expandBtn.addEventListener('mouseenter', function () {
      if (!mqDesktop.matches || !isCollapsed()) return;
      peekOpen = true;
      setCollapsed(false, { keepLayout: true });
    });
  }

  if (backdrop) backdrop.addEventListener('click', closeMenu);

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (mqDesktop.matches) {
      if (isCollapsed() || peekOpen) {
        peekOpen = false;
        setCollapsed(true);
      }
      return;
    }
    if (isOpen()) closeMenu();
  });

  // Itens simples fecham o drawer (mobile)/fixam o peek (desktop).
  // Delegação de clique: as entradas de ano do sub-menu são criadas depois
  // (assíncrono) e não estariam num querySelectorAll feito agora. O item pai
  // fica de fora: ele só expande/recolhe os anos e precisa manter o menu aberto.
  menu.addEventListener('click', function (e) {
    const item = e.target.closest('.nav-item');
    if (!item || item.classList.contains('nav-subtoggle')) return;
    if (!mqDesktop.matches) closeMenu();
    else if (peekOpen) {
      peekOpen = false;
      setCollapsed(false);
    }
  });

  if (typeof mqDesktop.addEventListener === 'function') {
    mqDesktop.addEventListener('change', syncDesktopMode);
  } else if (typeof mqDesktop.addListener === 'function') {
    mqDesktop.addListener(syncDesktopMode);
  }
  syncDesktopMode();
}

// Sair do jogo durante a partida (com confirmação de desistência).
function setupExitGame() {
  const exitBtn = document.getElementById('exit-game');
  if (!exitBtn) return;

  exitBtn.addEventListener('click', function () {
    openModal(`<div style="text-align:center;">
      <h3 style="color:var(--primary-color); margin-bottom:15px;">Sair do jogo?</h3>
      <p style="font-size:1.15rem; margin-bottom:8px;">O progresso desta rodada será perdido.</p>
      <div class="modal-actions">
        <button type="button" class="btn-primary" id="confirm-exit-yes">Sim, sair</button>
        <button type="button" class="btn-primary" id="confirm-exit-no">Continuar jogando</button>
      </div>
    </div>`);

    const yesBtn = document.getElementById('confirm-exit-yes');
    const noBtn = document.getElementById('confirm-exit-no');

    if (yesBtn) {
      yesBtn.onclick = function () {
        closeModal();
        resetGame();
      };
    }
    if (noBtn) {
      noBtn.onclick = function () {
        closeModal();
      };
    }
  });
}

function openFeedbackModal(html, callback) {
  openModal(html, { onClose: callback });
}

// ===============================
// HISTÓRICO DE JOGADAS (prompt da tela final)
// A montagem do documento é pura (gameHistory.js); aqui ficam só as
// decisões de UI e o porte do registro pelo portão de login (authGate.js).
// ===============================

// Chave da última identidade usada — só para pré-preencher o prompt.
const HISTORY_IDENTITY_KEY = 'showbiblao.lastIdentity';

// Registro que o prompt atual está tratando: pendente retomada do
// sessionStorage ou null (partida nova, montada do estado vivo).
let historyPromptRecord = null;

function readLastHistoryIdentity() {
  try {
    const raw = localStorage.getItem(HISTORY_IDENTITY_KEY);
    if (!raw) return { playerName: '', className: '' };
    const parsed = JSON.parse(raw);
    return {
      playerName: typeof parsed.playerName === 'string' ? parsed.playerName : '',
      className: typeof parsed.className === 'string' ? parsed.className : ''
    };
  } catch (e) {
    return { playerName: '', className: '' };
  }
}

function rememberHistoryIdentity(identity) {
  try {
    localStorage.setItem(HISTORY_IDENTITY_KEY, JSON.stringify(identity));
  } catch (e) { /* sem armazenamento — apenas não pré-preenche da próxima vez */ }
}

function showSaveHistoryEntry() {
  const btn = document.getElementById('save-game-history');
  if (btn) btn.hidden = false;
}

function hideSaveHistoryEntry() {
  const btn = document.getElementById('save-game-history');
  if (btn) btn.hidden = true;
}

// Mensagem dentro do prompt de salvar (erro, info ou sucesso).
function showHistoryMessage(text, type) {
  const el = document.getElementById('history-message');
  if (!el) return;
  el.textContent = text;
  el.classList.remove('error', 'success', 'info');
  el.classList.add(type || 'error');
  el.classList.add('is-visible');
}

function setHistoryBusy(busy) {
  const confirm = document.getElementById('history-save-confirm');
  const cancel = document.getElementById('history-save-cancel');
  if (confirm) {
    confirm.disabled = busy;
    confirm.textContent = busy ? 'Salvando…' : 'Salvar no histórico';
  }
  if (cancel) cancel.disabled = busy;
}

// Um registro de partida tem `playedAt` (ISO); qualquer outro valor passado
// por engano (ex.: o evento de clique) é ignorado e o prompt monta um novo.
function isHistoryRecord(value) {
  return !!value && typeof value === 'object' && !Array.isArray(value) &&
    typeof value.playedAt === 'string';
}

/**
 * Abre o prompt de salvamento. Não é automático: só entra aqui por ação
 * explícita do jogador, ou pela retomada de um registro pendente.
 * @param {object} [pendingRecord] - registro retomado do sessionStorage
 */
function openSaveHistoryPrompt(pendingRecord) {
  const record = isHistoryRecord(pendingRecord) ? pendingRecord : null;
  historyPromptRecord = record;
  const base = record || {};
  const identity = readLastHistoryIdentity();
  const playerName = base.playerName || identity.playerName;
  const className = base.className || identity.className;
  const resumed = !!record;

  openModal(`<div style="text-align:center;">
    <h3 style="color:var(--primary-color); margin-bottom:10px;">Salvar no histórico</h3>
    <p style="font-size:1.05rem; margin-bottom:16px;">
      ${resumed
        ? 'A partida que você jogou ficou guardada. Confirme os dados para salvar.'
        : 'Guarde a pontuação e as respostas desta partida.'}
    </p>
    <div class="history-form">
      <label for="history-player-name">Nome do jogador</label>
      <input type="text" id="history-player-name" maxlength="${HISTORY_LIMITS.playerNameMax}"
             value="${escapeHtml(playerName)}" placeholder="Ex.: Maria Silva" autocomplete="off">
    </div>
    <div class="history-form" style="margin-top:12px;">
      <label for="history-class-name">Classe</label>
      <input type="text" id="history-class-name" maxlength="${HISTORY_LIMITS.classNameMax}"
             value="${escapeHtml(className)}" placeholder="Ex.: Jovens" autocomplete="off">
    </div>
    <div class="history-message" id="history-message"></div>
    <div class="modal-actions">
      <button type="button" class="btn-primary" id="history-save-confirm">Salvar no histórico</button>
      <button type="button" class="btn-primary btn-outline" id="history-save-cancel">Agora não</button>
    </div>
  </div>`);

  const confirmBtn = document.getElementById('history-save-confirm');
  const cancelBtn = document.getElementById('history-save-cancel');
  const nameInput = document.getElementById('history-player-name');

  if (confirmBtn) confirmBtn.onclick = confirmSaveHistory;
  if (cancelBtn) {
    cancelBtn.onclick = function () {
      closeModal();
      // Cancelar o prompt de retomada descarta a pendência; na oferta normal
      // (fim de partida) o registro simplesmente não é salvo.
      if (resumed) {
        clearPendingRecord();
        historyPromptRecord = null;
      }
    };
  }
  if (nameInput) nameInput.focus();
}

function confirmSaveHistory() {
  const nameEl = document.getElementById('history-player-name');
  const classEl = document.getElementById('history-class-name');
  const identity = {
    playerName: nameEl ? nameEl.value.trim() : '',
    className: classEl ? classEl.value.trim() : ''
  };

  // Retomada: o reload da aba zerou o estado do jogo, então o registro salvo
  // é o pendente guardado antes do login (com a identidade atualizada no
  // prompt), nunca um novo montado de um estado vazio.
  const record = historyPromptRecord
    ? {
        ...historyPromptRecord,
        playerName: identity.playerName,
        className: identity.className,
        savedByEmail: currentUserEmail()
      }
    : buildGameRecord({
        state: getStateSnapshot(),
        identity,
        questionnaire: getCurrentQuestionnaire(),
        outcome: lastOutcome,
        playedAt: playedAt,
        savedByEmail: currentUserEmail()
      });

  const validation = validateGameRecord(record);
  if (!validation.ok) {
    showHistoryMessage(validation.errors[0], 'error');
    return;
  }

  if (!hasAdminSession()) {
    if (savePendingRecord(record)) {
      showLoginRequiredModal();
    } else {
      showHistoryMessage('Não foi possível guardar o registro para salvar depois do login.', 'error');
    }
    return;
  }

  persistGameRecord(record);
}

async function persistGameRecord(record) {
  setHistoryBusy(true);
  showHistoryMessage('Salvando no histórico…', 'info');
  // A autoria é sempre a do admin logado agora, mesmo numa retomada.
  record.savedByEmail = currentUserEmail();
  try {
    await saveGameRecord(record);
    clearPendingRecord();
    historyPromptRecord = null;
    rememberHistoryIdentity({ playerName: record.playerName, className: record.className });
    hideSaveHistoryEntry();
    showSavedConfirmation(record);
  } catch (err) {
    console.error('[ShowBiblao] Erro ao salvar o registro da partida', err);
    setHistoryBusy(false);
    showHistoryMessage('Não foi possível salvar no histórico. Tente novamente.', 'error');
  }
}

function showSavedConfirmation(record) {
  const resultLabel = record.outcome === 'win' ? 'vitória' : 'derrota';
  openModal(`<div style="text-align:center;">
    <h3 style="color:var(--primary-color); margin-bottom:10px;">Partida salva!</h3>
    <p style="font-size:1.05rem;">
      ${escapeHtml(record.playerName)}${record.className ? ` — ${escapeHtml(record.className)}` : ''}<br>
      ${record.score} pontos (${resultLabel}) em ${record.answeredCount} pergunta(s).
    </p>
    <div class="modal-actions">
      <button type="button" class="btn-primary" id="history-saved-close">Fechar</button>
    </div>
  </div>`);

  const closeBtn = document.getElementById('history-saved-close');
  if (closeBtn) closeBtn.onclick = closeModal;
}

// Sem sessão de admin: o registro fica pendente e o jogador vai ao login.
function showLoginRequiredModal() {
  openModal(`<div style="text-align:center;">
    <h3 style="color:var(--primary-color); margin-bottom:10px;">Entrar para salvar</h3>
    <p style="font-size:1.05rem; margin-bottom:8px;">
      Só o administrador do painel pode gravar no histórico. A partida ficou guardada
      nesta aba: entre, volte ao jogo e o salvamento é oferecido de novo.
    </p>
    <p style="font-size:0.9rem; color:#607d8b;">Guarde esta aba aberta para não perder o registro.</p>
    <div class="modal-actions">
      <button type="button" class="btn-primary" id="history-go-login">Ir para o login</button>
      <button type="button" class="btn-primary btn-outline" id="history-stay-here">Ficar aqui</button>
    </div>
  </div>`);

  const goLogin = document.getElementById('history-go-login');
  const stay = document.getElementById('history-stay-here');
  if (goLogin) goLogin.onclick = function () { location.href = 'admin.html'; };
  if (stay) stay.onclick = closeModal;
}

// Retomada: ao abrir o jogo, uma pendência da mesma aba reaparece.
function setupGameHistory() {
  const pending = readPendingRecord();
  if (!pending) return;

  if (hasAdminSession()) {
    openSaveHistoryPrompt(pending);
    return;
  }

  // A sessão do Firebase Auth é restaurada de forma assíncrona: espera o
  // primeiro estado de auth antes de decidir entre reabrir o prompt (sessão
  // confirmada) e avisar que a pendência aguarda login.
  let resolved = false;
  const watching = watchAuthSession(signedIn => {
    if (resolved) return;
    resolved = true;
    if (signedIn) openSaveHistoryPrompt(pending);
    else notifyPendingRecord();
  });

  // Sem como observar a sessão: avisa e oferece descartar (não prende a pendência).
  if (!watching) notifyPendingRecord();
}

function notifyPendingRecord() {
  openModal(`<div style="text-align:center;">
    <h3 style="color:var(--primary-color); margin-bottom:10px;">Partida aguardando salvamento</h3>
    <p style="font-size:1.05rem; margin-bottom:8px;">
      Há uma partida guardada nesta aba esperando um administrador entrar para salvá-la.
    </p>
    <div class="modal-actions">
      <button type="button" class="btn-primary" id="history-go-login">Ir para o login</button>
      <button type="button" class="btn-primary btn-outline" id="history-discard">Descartar registro</button>
    </div>
  </div>`);

  const goLogin = document.getElementById('history-go-login');
  const discard = document.getElementById('history-discard');
  if (goLogin) goLogin.onclick = function () { location.href = 'admin.html'; };
  if (discard) {
    discard.onclick = function () {
      clearPendingRecord();
      closeModal();
    };
  }
}

/**
 * Mostra a tela final, exibe a pontuação, solta confetes e se merecer ganha aplausos.
 * A tela final é um destino: o jogador fica aqui (mesmo na derrota) e decide
 * entre salvar no histórico, jogar de novo ou voltar ao início.
 */
function finishGame(victory = true) {
  debugLog('finishGame', { victory, currentScore });
  document.querySelectorAll('.slide').forEach(slide => slide.classList.remove('active'));
  document.getElementById('final-screen').classList.add('active');
  document.getElementById('final-score').textContent = `${currentScore} pontos`;

  const dashboard = document.getElementById('game-dashboard');
  if (dashboard) dashboard.style.display = 'none';

  // Estado do fim de partida (resultado e horário) — consumido pelo registro.
  finishGameState(victory ? 'win' : 'lose');
  showSaveHistoryEntry();

  if (victory) {
    document.getElementById('final-title').textContent = "Parabéns!";
    document.getElementById('final-message').textContent = "Você venceu o Show do Milhão Bíblico!";
    createConfetti();
    // TOCA O SOM DE APLAUSOS SE PONTUAÇÃO MÁXIMA
    if (currentScore === 1000) {
      const audio = document.getElementById('aplausos-audio');
      if (audio) {
        audio.currentTime = 0;
        audio.play();
      }
      const eeeeee_criancas = document.getElementById('eeeeee-criancas-audio');
            if (eeeeee_criancas) {
                eeeeee_criancas.currentTime = 0;
                eeeeee_criancas.play();
            }
    }
  } else {
    document.getElementById('final-title').textContent = "Fim de Jogo!";
    document.getElementById('final-message').textContent = "Você perdeu!!!";
    removeConfetti();
  }
}
/**
 * Reseta o estado do jogo para jogar novamente
 */
function resetGame() {
  debugLog('resetGame — zerando estado');
  resetState();
  document.body.classList.remove('game-active');
  removeConfetti();
  // Partida encerrada: a pendência de salvamento não sobrevive a um reset.
  clearPendingRecord();
  historyPromptRecord = null;
  hideSaveHistoryEntry();

  const dashboard = document.getElementById('game-dashboard');
  if (dashboard) dashboard.style.display = 'none';

  if (document.fullscreenElement && document.exitFullscreen) {
    document.exitFullscreen().catch(err => console.log(`Erro ao sair da tela cheia: ${err.message}`));
  }

  // Limpa TODAS as telas (inclui points-N/question-N que ficariam com .active)
  document.querySelectorAll('.slide').forEach(slide => slide.classList.remove('active'));
  document.getElementById('welcome-screen').classList.add('active');
  document.getElementById('final-screen').classList.remove('active');
  document.querySelectorAll('.ajuda-img').forEach(btn => btn.classList.remove('ajuda-usada'));
  document.querySelectorAll('.option').forEach(option => {
    option.style.opacity = '1';
    option.style.pointerEvents = 'auto';
    option.classList.remove('correct', 'incorrect');
  });
  initProgressBar();
}

// Modal de regras — abertura via openModal; fechamento (X/outside/ESC) registrado no open.
document.addEventListener('DOMContentLoaded', function() {
  const openBtn = document.getElementById('open-rules');
  if (openBtn) {
    openBtn.onclick = () => openModal(null, { modalId: 'rules-modal' });
  }
});

function openAjudaModal(html) {
  openModal(html, {
    onClose: function () {
      // Reabilita opções da pergunta atual (não reabilita as removidas por cartas)
      document.querySelectorAll(`#question-${currentQuestion + 1} .option`).forEach(option => {
        if (option.style.opacity !== '0.3') {
          option.style.pointerEvents = 'auto';
        }
      });
    }
  });
}

// Modal de Questionários (carregados do Firestore)
document.addEventListener('DOMContentLoaded', function() {
  const openQBtn = document.getElementById('open-questionnaires');
  const qModal = document.getElementById('questionnaires-modal');
  const closeQBtn = document.getElementById('close-questionnaires');
  const qList = document.getElementById('questionnaires-list');

  function isIncomplete(q) {
    return q.questions_count !== QUESTIONS_TARGET;
  }

  // Carrega um questionário do banco e recria as telas do jogo.
  async function loadAndRenderQuestionnaire(q) {
    debugLog('loadAndRenderQuestionnaire', { id: q.id, name: q.name, count: q.questions_count });
    if (isIncomplete(q)) {
      openAjudaModal(`<div style="text-align:center;">
        <h3 style="color:var(--primary-color); margin-bottom:15px;">Questionário incompleto</h3>
        <p style="font-size:1.2rem;">O questionário "<b>${escapeHtml(q.name)}</b>" tem ${q.questions_count ?? 0} de ${QUESTIONS_TARGET} perguntas. Complete o cadastro no painel administrativo.</p>
      </div>`);
      return;
    }
    try {
      const loaded = await loadQuestions(q.id);
      if (loaded.length !== QUESTIONS_TARGET) {
        openAjudaModal(`<div style="text-align:center;">
          <h3 style="color:var(--primary-color); margin-bottom:15px;">Questionário incompleto</h3>
          <p style="font-size:1.2rem;">O questionário "<b>${escapeHtml(q.name)}</b>" possui ${loaded.length} de ${QUESTIONS_TARGET} perguntas. Complete o cadastro no painel administrativo.</p>
        </div>`);
        return;
      }
      window.questions = loaded;
      debugLog('Questionário carregado — recriando telas', { perguntas: loaded.length });
      document.querySelectorAll('.points-screen, .question-screen').forEach(el => el.remove());
      createGameScreens();
      setCurrentQuestionnaire(q.id, q.name);
      const nameEl = document.getElementById('current-questionnaire-name');
      if (nameEl) nameEl.textContent = `Questionário: ${q.name}`;
      setQuestionnaireChosen();
      openAjudaModal(`<div style="text-align:center;">
        <h3 style="color:var(--primary-color); margin-bottom:15px;">Sucesso</h3>
        <p style="font-size:1.2rem;">Questionário "<b>${escapeHtml(q.name)}</b>" carregado!</p>
      </div>`);
    } catch (err) {
      debugLog('ERRO ao carregar questionário', err);
      console.error(err);
      openAjudaModal(`<div style="text-align:center;">
        <h3 style="color:var(--error-color, #e74c3c); margin-bottom:15px;">Erro</h3>
        <p style="font-size:1.2rem;">Não foi possível carregar o questionário. Verifique a conexão.</p>
      </div>`);
    }
  }

  // Cria o botão de um questionário no modal (incompletos ficam desabilitados).
  function createQuestionnaireButton(q) {
    const complete = !isIncomplete(q);
    const btn = document.createElement('button');
    btn.className = 'btn-primary';
    btn.style.width = '100%';
    btn.style.marginTop = '0';
    btn.style.fontSize = '1.2rem';
    if (complete) {
      btn.textContent = q.name;
      btn.onclick = () => loadAndRenderQuestionnaire(q);
    } else {
      btn.disabled = true;
      btn.style.opacity = '0.5';
      btn.style.cursor = 'not-allowed';
      btn.textContent = `${q.name} — ${q.questions_count ?? 0}/${QUESTIONS_TARGET} (incompleto)`;
      btn.title = `Questionário incompleto: só é possível jogar com ${QUESTIONS_TARGET} perguntas cadastradas.`;
    }
    return btn;
  }

  // Grupos por ano em memória (null = "Sem ano"), carregados uma única vez.
  let yearGroups = null;

  const submenuEl = document.getElementById('questionnaires-submenu');

  // Ícone de pasta para as entradas do sub-menu (SVG inline).
  const FOLDER_ICON_SVG =
    '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">' +
    '<path fill="#f5b942" d="M2 6a2 2 0 0 1 2-2h5.2l2 2H20a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6z"/>' +
    '<path fill="#e09b1f" d="M2 9h20v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9z" opacity="0.45"/>' +
    '</svg>';

  // Anos em ordem decrescente; null ("Sem ano") por último.
  function orderedYears() {
    const years = [...yearGroups.keys()]
      .filter(year => year !== null)
      .sort((a, b) => b - a);
    if (yearGroups.has(null)) years.push(null);
    return years;
  }

  // Questionários de um ano, em ordem alfabética (seguro para ano inexistente).
  function sortedByName(year) {
    const items = yearGroups.get(year) || [];
    return items
      .slice()
      .sort((a, b) => String(a.name).localeCompare(String(b.name), 'pt-BR'));
  }

  // Carrega e agrupa os questionários uma única vez, sem renderizar.
  async function ensureYearGroups() {
    if (yearGroups) return yearGroups;
    const questionnaires = await listQuestionnaires();
    debugLog('Questionários recebidos do Firestore', { total: questionnaires.length });
    // Agrupamento 100% em memória: a listagem já veio completa, sem query extra.
    const groups = new Map();
    questionnaires.forEach(q => {
      const key = typeof q.year === 'number' ? q.year : null;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(q);
    });
    yearGroups = groups;
    return yearGroups;
  }

  // Preenche o sub-menu do menu lateral com uma entrada por ano.
  function renderYearSubmenu() {
    if (!submenuEl || !yearGroups) return;
    submenuEl.innerHTML = '';
    if (!yearGroups.size) {
      submenuEl.innerHTML =
        '<li class="nav-subitem-empty">Nenhum questionário cadastrado.</li>';
      return;
    }
    orderedYears().forEach(year => {
      const total = sortedByName(year).length;
      const li = document.createElement('li');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'nav-item nav-subitem' + (year === null ? ' is-untagged' : '');
      btn.innerHTML =
        FOLDER_ICON_SVG +
        `<span class="nav-subitem-label">${year === null ? 'Sem ano' : year}</span>` +
        `<span class="nav-subitem-count">${total}</span>`;
      btn.onclick = () => openQuestionnairesModal(year);
      li.appendChild(btn);
      submenuEl.appendChild(li);
    });
  }

  // Lista de questionários do ano escolhido — responsabilidade única do modal.
  // Só questionários completos (15 perguntas) podem ser selecionados.
  function renderQuestionnairesForYear(year) {
    qList.innerHTML = '';
    const items = sortedByName(year);
    if (!items.length) {
      qList.innerHTML =
        '<p style="text-align:center; color:#ccc;">Nenhum questionário neste ano.</p>';
      return;
    }
    items.forEach(q => {
      qList.appendChild(createQuestionnaireButton(q));
    });
  }

  // Abre o modal já listando os questionários do ano clicado no menu lateral.
  async function openQuestionnairesModal(year) {
    const title = qModal ? qModal.querySelector('.rules-header h2') : null;
    if (title) {
      title.textContent =
        year === null ? 'Escolher Questionário — Sem ano' : `Escolher Questionário — ${year}`;
    }
    qList.innerHTML = '<p style="text-align:center; color:#ccc;">Carregando…</p>';
    // Fechamento (X/outside/ESC) registrado no openModal.
    openModal(null, { modalId: 'questionnaires-modal' });
    try {
      await ensureYearGroups();
      renderYearSubmenu();
      renderQuestionnairesForYear(year);
    } catch (err) {
      debugLog('ERRO ao listar questionários', err);
      console.error(err);
      qList.innerHTML =
        '<p style="text-align:center; color:#e74c3c;">Erro ao carregar questionários.</p>';
    }
  }

  if (openQBtn && qModal && closeQBtn && qList) {
    // Pré-carrega os dados (e já preenche o sub-menu) sem abrir o modal.
    ensureYearGroups()
      .then(renderYearSubmenu)
      .catch(err => {
        debugLog('ERRO ao pré-carregar questionários', err);
        console.error(err);
      });

    // O item pai só expande/recolhe o sub-menu de anos; o modal abre ao
    // clicar numa entrada de ano.
    openQBtn.onclick = () => {
      const willOpen = openQBtn.getAttribute('aria-expanded') !== 'true';
      setQuestionnairesSubmenuOpen(willOpen);
      // Se o pré-carregamento falhou, tenta de novo ao expandir.
      if (willOpen && !yearGroups) {
        ensureYearGroups()
          .then(renderYearSubmenu)
          .catch(err => console.error(err));
      }
    };
  }
});