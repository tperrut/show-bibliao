// ===============================
// RENDERIZAÇÃO DE TELAS
// ===============================

/**
 * Cria dinamicamente as telas de pontuação e perguntas
 */
function createGameScreens() {
  const container = document.querySelector('.container');
  const totalQuestions = questions.length;

  questions.forEach((q, index) => {
    const qNum = index + 1;

    // Banner de mudança de nível
    let levelMessage = '';
    if (qNum === 6) {
      levelMessage = `<div class="level-up-banner medio">⭐ VOCÊ CHEGOU AO NÍVEL MÉDIO! ⭐</div>`;
    } else if (qNum === 11) {
      levelMessage = `<div class="level-up-banner dificil">🔥 PREPARE-SE: NÍVEL DIFÍCIL! 🔥</div>`;
    }

    // Slide de pontuação
    const pointsScreen = document.createElement('div');
    pointsScreen.className = 'slide points-screen';
    pointsScreen.id = `points-${qNum}`;
    pointsScreen.innerHTML = `
      ${levelMessage}
      <h2>Pergunta número ${qNum}</h2>
      <div class="points-value">${q.points} pontos</div>
      <div class="controls">
        <button class="btn-primary" onclick="showQuestion(${qNum})">${qNum === 1 ? 'Iniciar' : 'Próxima'}</button>
      </div>
    `;
    container.appendChild(pointsScreen);

    // Slide de pergunta
    const questionScreen = document.createElement('div');
    questionScreen.className = 'slide question-screen';
    questionScreen.id = `question-${qNum}`;

    let optionsHTML = '';
    const letters = ['A', 'B', 'C', 'D'];
    q.options.forEach((option, optIndex) => {
      optionsHTML += `
        <div class="option" data-correct="${option.correct}">
          <div class="option-letter">${letters[optIndex]}</div>
          <div class="option-text">${option.text}</div>
        </div>
      `;
    });

    questionScreen.innerHTML = `
    
      <div class="question-text">${q.question}</div>
      <div class="options">${optionsHTML}</div>

      <div class="ajudas">
        <div class="ajuda-container">
          <a href="javascript:void(0)" class="ajuda-img" id="ajuda-pastores-${qNum}" title="Ajuda dos Pastores">
            <img src="images/pastores.png" alt="Ajuda dos Pastores">
          </a>
          <span class="ajuda-title">PASTORES</span>
          <span class="ajuda-subtext">uso restante: 1</span>
        </div>
        <div class="ajuda-container">
          <a href="javascript:void(0)" class="ajuda-img" id="ajuda-classe-${qNum}" title="Ajuda da Classe">
            <img src="images/classe.jpg" alt="Ajuda da Classe">
          </a>
          <span class="ajuda-title">ALUNOS</span>
          <span class="ajuda-subtext">uso restante: 1</span>
        </div>
        <div class="ajuda-container">
          <a href="javascript:void(0)" class="ajuda-img" id="ajuda-cartas-${qNum}" title="Cartas Misteriosas">
            <img src="images/carta.jpg" alt="Cartas Misteriosas">
          </a>
          <span class="ajuda-title">CORINGA (+4)</span>
          <span class="ajuda-subtext">uso restante: 1</span>
        </div>
        <div class="ajuda-container">
          <a href="javascript:void(0)" class="ajuda-img" id="ajuda-pulos-${qNum}" title="Pular Pergunta">
            <img src="images/pular.png" alt="Pular Pergunta">
          </a>
          <span class="ajuda-title">PULAR</span>
          <span class="ajuda-subtext">uso restante: 1</span>
        </div>
      </div>
    `;
    container.appendChild(questionScreen);
  });

  // Adiciona listeners após renderizar
  setTimeout(() => {
    document.querySelectorAll('.option').forEach(option => {
      option.addEventListener('click', handleOptionClick);
    });
    questions.forEach((q, idx) => {
      setupAjudas(idx + 1);
    });
  }, 100);
}