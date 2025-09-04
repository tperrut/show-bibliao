// ===============================
// INICIALIZAÇÃO E FINALIZAÇÃO
// ===============================

document.addEventListener('DOMContentLoaded', function() {
  createGameScreens();
  document.getElementById('start-game').addEventListener('click', startGame);
  document.getElementById('play-again').addEventListener('click', resetGame);
  initProgressBar();
});

/**
 * Mostra a tela final, exibe a pontuação e solta confetes
 */
function finishGame() {
  document.querySelectorAll('.slide').forEach(slide => slide.classList.remove('active'));
  document.getElementById('final-screen').classList.add('active');
  document.getElementById('final-score').textContent = `${currentScore} pontos`;
  createConfetti();
}

/**
 * Reseta o estado do jogo para jogar novamente
 */
function resetGame() {
  currentScore = 0;
  currentQuestion = 0;
  jokersUsed = { cinquenta: false, pastores: false, pulos: 0 };
  document.getElementById('current-score').textContent = '0';
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

// Modal de regras
document.addEventListener('DOMContentLoaded', function() {
  const openBtn = document.getElementById('open-rules');
  const modal = document.getElementById('rules-modal');
  const closeBtn = document.getElementById('close-rules');

  if (openBtn && modal && closeBtn) {
    openBtn.onclick = () => modal.classList.add('active');
    closeBtn.onclick = () => modal.classList.remove('active');
    // Fecha ao clicar fora do conteúdo
    modal.onclick = (e) => {
      if (e.target === modal) modal.classList.remove('active');
    };
    // Fecha com ESC
    document.addEventListener('keydown', function(e) {
      if (e.key === "Escape") modal.classList.remove('active');
    });
  }
});