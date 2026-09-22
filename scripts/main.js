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
  document.getElementById('start-game').addEventListener('click', startGame);
  document.getElementById('play-again').addEventListener('click', resetGame);
  initProgressBar();
  debugLog('Telas criadas, listeners de início/reset OK');
});

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
  
  if (document.fullscreenElement && document.exitFullscreen) {
    document.exitFullscreen().catch(err => console.log(`Erro ao sair da tela cheia: ${err.message}`));
  }

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
        <p style="font-size:1.2rem;">O questionário "<b>${q.name}</b>" tem ${q.questions_count ?? 0} de ${QUESTIONS_TARGET} perguntas. Complete o cadastro no painel administrativo.</p>
      </div>`);
      return;
    }
    try {
      const loaded = await loadQuestions(q.id);
      if (loaded.length !== QUESTIONS_TARGET) {
        openAjudaModal(`<div style="text-align:center;">
          <h3 style="color:var(--primary-color); margin-bottom:15px;">Questionário incompleto</h3>
          <p style="font-size:1.2rem;">O questionário "<b>${q.name}</b>" possui ${loaded.length} de ${QUESTIONS_TARGET} perguntas. Complete o cadastro no painel administrativo.</p>
        </div>`);
        return;
      }
      window.questions = loaded;
      debugLog('Questionário carregado — recriando telas', { perguntas: loaded.length });
      document.querySelectorAll('.points-screen, .question-screen').forEach(el => el.remove());
      createGameScreens();
      const nameEl = document.getElementById('current-questionnaire-name');
      if (nameEl) nameEl.textContent = `Questionário: ${q.name}`;
      openAjudaModal(`<div style="text-align:center;">
        <h3 style="color:var(--primary-color); margin-bottom:15px;">Sucesso</h3>
        <p style="font-size:1.2rem;">Questionário "<b>${q.name}</b>" carregado!</p>
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