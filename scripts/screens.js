// ===============================
// RENDERIZAÇÃO DE TELAS
// ===============================

/**
 * Cria dinamicamente as telas de pontuação e perguntas
 */
function createGameScreens() {
  const container = document.querySelector('.container');
  questions.forEach((q, index) => {
    // Slide de pontuação
    const pointsScreen = document.createElement('div');
    pointsScreen.className = 'slide points-screen';
    pointsScreen.id = `points-${index+1}`;
    pointsScreen.innerHTML = `
      <h2>Pergunta número ${index+1}</h2>
      <div class="points-value">${q.points} pontos</div>
      <div class="controls">
        <button class="btn-primary" onclick="showQuestion(${index+1})">Iniciar Pergunta</button>
      </div>
    `;
    container.appendChild(pointsScreen);

    // Slide de pergunta
    const questionScreen = document.createElement('div');
    questionScreen.className = 'slide question-screen';
    questionScreen.id = `question-${index+1}`;
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
        <a href="javascript:void(0)" class="ajuda-img" id="ajuda-pastores-${index+1}" title="Ajuda dos Pastores">
          <img src="images/pastores.png" alt="Ajuda dos Pastores">
        </a>
        <a href="javascript:void(0)" class="ajuda-img" id="ajuda-classe-${index+1}" title="Ajuda da Classe">
          <img src="images/classe.jpg" alt="Ajuda da Clcasse">
        </a>
        <a href="javascript:void(0)" class="ajuda-img" id="ajuda-cartas-${index+1}" title="Cartas Misteriosas">
          <img src="images/carta.jpg" alt="Cartas Misteriosas">
        </a>
        <a href="javascript:void(0)" class="ajuda-img" id="ajuda-pulos-${index+1}" title="Pular Pergunta">
          <img src="images/pular.png" alt="Pular Pergunta">
        </a>
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
      setupAjudas(idx+1);
    });
  }, 100);
}