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
  document.getElementById('start-game').addEventListener('click', requestStartGame);
  document.getElementById('play-again').addEventListener('click', resetGame);
  const backHomeBtn = document.getElementById('back-home');
  if (backHomeBtn) backHomeBtn.addEventListener('click', resetGame);
  initProgressBar();
  setupMainNav();
  setupExitGame();
  debugLog('Telas criadas, listeners de início/reset/nav/sair OK');
});

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
      closeModal();
      startGame();
    };
  }
  if (chooseQ) {
    chooseQ.onclick = function () {
      openModal(null, { modalId: 'questionnaires-modal' });
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

  menu.querySelectorAll('.nav-item').forEach(function (item) {
    item.addEventListener('click', function () {
      if (!mqDesktop.matches) closeMenu();
      else if (peekOpen) {
        peekOpen = false;
        setCollapsed(false);
      }
    });
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
/**
 * Mostra a tela final, exibe a pontuação, solta confetes e se merecer ganha aplausos
 */
function finishGame(victory = true) {
  debugLog('finishGame', { victory, currentScore });
  document.querySelectorAll('.slide').forEach(slide => slide.classList.remove('active'));
  document.getElementById('final-screen').classList.add('active');
  document.getElementById('final-score').textContent = `${currentScore} pontos`;

  const dashboard = document.getElementById('game-dashboard');
  if (dashboard) dashboard.style.display = 'none';

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

  // Popula a lista de questionários a partir do Firestore.
  // Só questionários completos (15 perguntas) podem ser selecionados.
  async function loadQuestionnairesFromDb() {
    qList.innerHTML = '<p style="text-align:center; color:#ccc;">Carregando…</p>';
    try {
      const questionnaires = await listQuestionnaires();
      debugLog('Questionários recebidos do Firestore', { total: questionnaires.length });
      qList.innerHTML = '';
      if (!questionnaires.length) {
        qList.innerHTML = '<p style="text-align:center; color:#ccc;">Nenhum questionário cadastrado.</p>';
        return;
      }
      questionnaires.forEach(q => {
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
        qList.appendChild(btn);
      });
    } catch (err) {
      debugLog('ERRO ao listar questionários', err);
      console.error(err);
      qList.innerHTML = '<p style="text-align:center; color:#e74c3c;">Erro ao carregar questionários.</p>';
    }
  }

  if (openQBtn && qModal && closeQBtn && qList) {
    loadQuestionnairesFromDb();
    // Fechamento (X/outside/ESC) registrado no openModal.
    openQBtn.onclick = () => openModal(null, { modalId: 'questionnaires-modal' });
  }
});