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
 * Mostra a tela final, exibe a pontuação, solta confetes e se merecer ganha aplausos
 */
function finishGame() {
    document.querySelectorAll('.slide').forEach(slide => slide.classList.remove('active'));
    document.getElementById('final-screen').classList.add('active');
    document.getElementById('final-score').textContent = `${currentScore} pontos`;
    createConfetti();

    // TOCA O SOM DE APLAUSOS SE PONTUAÇÃO MÁXIMA
    if (currentScore === 1000) {
        const audio = document.getElementById('aplausos-audio');
        if (audio) {
            audio.currentTime = 0;
            audio.play();
        }
    }
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

function openAjudaModal(text) {
    document.getElementById('ajuda-modal-text').textContent = text;
    document.getElementById('ajuda-modal').classList.add('active');
}
document.addEventListener('DOMContentLoaded', function() {
    const closeBtn = document.getElementById('close-ajuda-modal');
    const modal = document.getElementById('ajuda-modal');
    if (closeBtn && modal) {
        closeBtn.onclick = () => modal.classList.remove('active');
        modal.onclick = (e) => { if (e.target === modal) modal.classList.remove('active'); };
        document.addEventListener('keydown', function(e) {
            if (e.key === "Escape") modal.classList.remove('active');
        });
    }
});