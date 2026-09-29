// ===============================
// NAVEGAÇÃO E PROGRESSO
// ===============================

/**
 * Atualiza a barra de progresso e garante números em todos os estados
 */
function initProgressBar() {
  const progressEl = document.getElementById('progress');
  if (!progressEl) return;

  progressEl.innerHTML = '';

  for (let i = 1; i <= questions.length; i++) {
    const step = document.createElement('div');
    step.className = 'progress-step';
    step.textContent = i; // O número SEMPRE é mantido no centro

    if (isMilestone(i)) step.classList.add('milestone');
    if (isFinalStep(i)) step.classList.add('final-milestone');

    if (i === currentQuestion + 1) {
      step.classList.add('active');
    } else if (i < currentQuestion + 1) {
      step.classList.add('completed');
    }

    progressEl.appendChild(step);
  }

  updateDecisionBoard();
}

/**
 * Atualiza os valores do painel de decisão e a pontuação atual com troféu
 */
function updateDecisionBoard() {
  const currentVal = questions[currentQuestion] ? questions[currentQuestion].points : 0;
  const prevVal = currentQuestion > 0 ? questions[currentQuestion - 1].points : 0;

  const stopVal = prevVal;
  const winVal = currentVal;

  const pararEl = document.getElementById('score-parar');
  const acertarEl = document.getElementById('score-acertar');
  const difficultyLevelEl = document.getElementById('difficulty-level');
  const difficultyBadgeEl = document.getElementById('difficulty-badge');

  if (pararEl) pararEl.textContent = `${stopVal} pts`;
  if (acertarEl) acertarEl.textContent = `${winVal} pts`;
  renderHud();
  
  if (difficultyLevelEl && difficultyBadgeEl) {
    const level = levelForQuestion(currentQuestion + 1);
    const nivel = level.label;
    const cor = level.color;

    // Anima a badge apenas quando o nível muda
    if (difficultyLevelEl.textContent !== nivel && currentQuestion > 0) {
      difficultyBadgeEl.classList.remove('level-change-pulse');
      // Força um reflow para reiniciar a animação
      void difficultyBadgeEl.offsetWidth;
      difficultyBadgeEl.classList.add('level-change-pulse');
    }

    difficultyLevelEl.textContent = nivel;
    difficultyBadgeEl.style.backgroundColor = cor;
    difficultyBadgeEl.style.boxShadow = `0 4px 10px ${cor}40`;
  }
}

/**
 * Inicia o jogo
 */
function startGame() {
  if (typeof debugLog === 'function') debugLog('startGame — iniciando rodada', { totalPerguntas: questions.length });
  document.getElementById('welcome-screen').classList.remove('active');
  document.body.classList.add('game-active');

  const dashboard = document.getElementById('game-dashboard');
  if (dashboard) dashboard.style.display = 'flex';

  if (document.documentElement.requestFullscreen) {
    document.documentElement.requestFullscreen().catch(err => {
      console.log(`Erro ao tentar entrar em tela cheia: ${err.message} (${err.name})`);
    });
  }

  showPoints(1);
}

/**
 * Mostra a tela de pontuação antes da pergunta
 */
function showPoints(questionNumber) {
  if (questionNumber > questions.length) {
    finishGame(true);
    return;
  }

  if (questionNumber === questions.length) {
    const tamborAudio = document.getElementById('tambor-audio');
    if (tamborAudio) {
      tamborAudio.currentTime = 0;
      tamborAudio.play();
    }
  }

  document.querySelectorAll('.slide').forEach(slide => slide.classList.remove('active'));
  document.getElementById(`points-${questionNumber}`).classList.add('active');
  setQuestionIndex(questionNumber - 1);
  initProgressBar();
}

/**
 * Mostra a pergunta atual
 */
function showQuestion(questionNumber) {
  reabilitarAjudas(questionNumber);
  removeConfetti();
  clearAnswerLock();

  document.querySelectorAll('.slide').forEach(slide => slide.classList.remove('active'));
  document.getElementById(`question-${questionNumber}`).classList.add('active');
  setQuestionIndex(questionNumber - 1);

  initProgressBar();

  document.querySelectorAll('.option').forEach(option => {
    option.style.pointerEvents = 'auto';
    option.classList.remove('correct', 'incorrect');
    option.style.opacity = '1';
  });

  setupAjudas(questionNumber);
}