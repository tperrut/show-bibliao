// ===============================
// NAVEGAÇÃO E PROGRESSO
// ===============================

/**
 * Atualiza a barra de progresso de acordo com a pergunta atual
 */
function initProgressBar() {
  const progressEl = document.getElementById('progress');
  progressEl.innerHTML = '';
  for (let i = 1; i <= questions.length; i++) {
    const step = document.createElement('div');
    step.className = 'progress-step';
    if (i === currentQuestion + 1) step.classList.add('active');
    if (i < currentQuestion + 1) step.classList.add('completed');
    step.textContent = i;
    progressEl.appendChild(step);
  }
}

/**
 * Inicia o jogo, ocultando a tela de boas-vindas e mostrando a primeira pontuação
 */
function startGame() {
  document.getElementById('welcome-screen').classList.remove('active');
  showPoints(1);
}

/**
 * Mostra a tela de pontuação antes da pergunta
 * @param {number} questionNumber - Número da pergunta a ser exibida
 */
function showPoints(questionNumber) {
  if (questionNumber > questions.length) {
    finishGame();
    return;
  }
  document.querySelectorAll('.slide').forEach(slide => slide.classList.remove('active'));
  document.getElementById(`points-${questionNumber}`).classList.add('active');
  currentQuestion = questionNumber - 1;
  initProgressBar();
}

/**
 * Mostra a tela da pergunta e reseta o estado de resposta
 * @param {number} questionNumber - Número da pergunta a ser exibida
 */
function showQuestion(questionNumber) {
  document.querySelectorAll('.slide').forEach(slide => slide.classList.remove('active'));
  document.getElementById(`question-${questionNumber}`).classList.add('active');
  currentQuestion = questionNumber - 1;
  initProgressBar();
  document.querySelectorAll('.option').forEach(option => {
    option.style.pointerEvents = 'auto';
    option.classList.remove('correct', 'incorrect');
    option.style.opacity = '1';
  });
  setupAjudas(questionNumber);
  questionAnswered = false; // Reset ao mostrar nova pergunta
}