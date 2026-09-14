// ===============================
// INICIALIZAÇÃO E FINALIZAÇÃO
// ===============================

document.addEventListener('DOMContentLoaded', function() {
  createGameScreens();
  document.getElementById('start-game').addEventListener('click', startGame);
  document.getElementById('play-again').addEventListener('click', resetGame);
  initProgressBar();
});

function openFeedbackModal(html, callback) {
  document.getElementById('ajuda-modal-text').innerHTML = html;
  const modal = document.getElementById('ajuda-modal');
  modal.classList.add('active');

  // Fecha ao clicar no X, fora do modal ou ESC
  function closeHandler() {
    modal.classList.remove('active');
    document.getElementById('close-ajuda-modal').removeEventListener('click', closeHandler);
    modal.removeEventListener('click', outsideHandler);
    document.removeEventListener('keydown', escHandler);
    if (callback) callback();
  }
  function outsideHandler(e) { if (e.target === modal) closeHandler(); }
  function escHandler(e) { if (e.key === "Escape") closeHandler(); }

  document.getElementById('close-ajuda-modal').onclick = closeHandler;
  modal.onclick = outsideHandler;
  document.addEventListener('keydown', escHandler);
}
/**
 * Mostra a tela final, exibe a pontuação, solta confetes e se merecer ganha aplausos
 */
function finishGame(victory = true) {
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
  currentScore = 0;
  currentQuestion = 0;
  jokersUsed = { cinquenta: false, pastores: false, pulos: 0 };
  const currentScoreEl = document.getElementById('current-score');
  if (currentScoreEl) currentScoreEl.textContent = '0';
  const currentScoreDisplay = document.getElementById('current-score-display');
  if (currentScoreDisplay) currentScoreDisplay.textContent = '0';
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
function openAjudaModal(html) {
  document.getElementById('ajuda-modal-text').innerHTML = html;
  document.getElementById('ajuda-modal').classList.add('active');
  // Ao fechar, reabilite as opções
  const closeBtn = document.getElementById('close-ajuda-modal');
  const modal = document.getElementById('ajuda-modal');
  function closeHandler() {
    modal.classList.remove('active');
    // Reabilita opções da pergunta atual
    document.querySelectorAll(`#question-${currentQuestion + 1} .option`).forEach(option => {
      if (option.style.opacity !== '0.3') // não reabilita as removidas por cartas
        option.style.pointerEvents = 'auto';
    });
    closeBtn.removeEventListener('click', closeHandler);
    modal.removeEventListener('click', outsideHandler);
    document.removeEventListener('keydown', escHandler);
  }
  function outsideHandler(e) { if (e.target === modal) closeHandler(); }
  function escHandler(e) { if (e.key === "Escape") closeHandler(); }
  closeBtn.onclick = closeHandler;
  modal.onclick = outsideHandler;
  document.addEventListener('keydown', escHandler);
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

// Modal de Questionários
document.addEventListener('DOMContentLoaded', function() {
  const openQBtn = document.getElementById('open-questionnaires');
  const qModal = document.getElementById('questionnaires-modal');
  const closeQBtn = document.getElementById('close-questionnaires');
  const qList = document.getElementById('questionnaires-list');

  const availableQuestionnaires = [
    { file: 'perguntas_adolescentes_dificult.js', name: 'Adolescentes - Difícil' },
    { file: 'perguntas_adolescentes_easy.js', name: 'Adolescentes - Fácil' },
    { file: 'perguntas_embaralhadas.js', name: 'Embaralhadas' },
    { file: 'perguntas_homens.js', name: 'Homens' },
    { file: 'perguntas_jovens.js', name: 'Jovens' },
    { file: 'perguntas_mulheres.js', name: 'Mulheres' },
    { file: 'perguntas_pre_adolescentes.js', name: 'Pré-Adolescentes' },
    { file: 'perguntas_test.js', name: 'Teste' }
  ];

  if (openQBtn && qModal && closeQBtn && qList) {
    availableQuestionnaires.forEach(q => {
      const btn = document.createElement('button');
      btn.className = 'btn-primary';
      btn.style.width = '100%';
      btn.style.marginTop = '0';
      btn.style.fontSize = '1.2rem';
      btn.textContent = q.name;
      btn.onclick = () => {
        const script = document.createElement('script');
        script.src = `perguntas/${q.file}`;
        script.onload = () => {
          // Remover telas anteriores
          document.querySelectorAll('.points-screen, .question-screen').forEach(el => el.remove());
          
          // Recriar telas com as novas perguntas
          createGameScreens();

          // Atualizar o nome do questionário na tela
          const nameEl = document.getElementById('current-questionnaire-name');
          if (nameEl) nameEl.textContent = `Questionário: ${q.name}`;

          // Mostrar modal de sucesso no lugar do alert
          openAjudaModal(`<div style="text-align:center;">
            <h3 style="color:var(--primary-color); margin-bottom:15px;">Sucesso</h3>
            <p style="font-size:1.2rem;">Questionário "<b>${q.name}</b>" carregado!</p>
          </div>`);
          qModal.classList.remove('active');
        };
        document.body.appendChild(script);
      };
      qList.appendChild(btn);
    });

    openQBtn.onclick = () => qModal.classList.add('active');
    closeQBtn.onclick = () => qModal.classList.remove('active');
    qModal.onclick = (e) => {
      if (e.target === qModal) qModal.classList.remove('active');
    };
    document.addEventListener('keydown', function(e) {
      if (e.key === "Escape") qModal.classList.remove('active');
    });
  }
});