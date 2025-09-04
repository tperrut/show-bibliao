let currentScore = 0;
let currentQuestion = 0;
let jokersUsed = { cinquenta: false, pastores: false, pulos: 0 };
let questionAnswered = false;

document.addEventListener('DOMContentLoaded', function() {
  createGameScreens();
  document.getElementById('start-game').addEventListener('click', startGame);
  document.getElementById('play-again').addEventListener('click', resetGame);
  initProgressBar();
});

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
        <a href="javascript:void(0)" class="ajuda-img" id="ajuda-pastores-${index+1}" title="Pastores">
          <img src="images/pastores.png" alt="Pastores">
        </a>
        <a href="javascript:void(0)" class="ajuda-img" id="ajuda-cinquenta-${index+1}" title="50% de chance">
          <img src="images/cinquenta.png" alt="50%">
        </a>
        <a href="javascript:void(0)" class="ajuda-img" id="ajuda-pulos-${index+1}" title="Pular">
          <img src="images/pular.png" alt="Pular">
          <span class="pulos-restantes">(2)</span>
        </a>
      </div>
    `;
    container.appendChild(questionScreen);
  });

  setTimeout(() => {
    document.querySelectorAll('.option').forEach(option => {
      option.addEventListener('click', handleOptionClick);
    });
    questions.forEach((q, idx) => {
      setupAjudas(idx+1);
    });
  }, 100);
}

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

function startGame() {
  document.getElementById('welcome-screen').classList.remove('active');
  showPoints(1);
}

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

function handleOptionClick() {
  if (questionAnswered) return;
  questionAnswered = true;
  const isCorrect = this.getAttribute('data-correct') === 'true';
  if (isCorrect) {
    this.classList.add('correct');
    currentScore += questions[currentQuestion].points;
    document.getElementById('current-score').textContent = currentScore;
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        showPoints(currentQuestion + 2);
      } else {
        finishGame();
      }
    }, 1000);
  } else {
    this.classList.add('incorrect');
    this.parentElement.querySelector('[data-correct="true"]').classList.add('correct');
    setTimeout(finishGame, 1000);
  }
  this.parentElement.querySelectorAll('.option').forEach(opt => {
    opt.style.pointerEvents = 'none';
  });
}

// AJUDAS
function setupAjudas(questionNumber) {
  // Pastores
  const pastoresBtn = document.getElementById(`ajuda-pastores-${questionNumber}`);
  if (pastoresBtn) {
    pastoresBtn.classList.toggle('ajuda-usada', jokersUsed.pastores);
    pastoresBtn.onclick = function() {
      if (jokersUsed.pastores) return;
      jokersUsed.pastores = true;
      pastoresBtn.classList.add('ajuda-usada');
      alert('Consulte os Pastores Presentes');
    };
  }
  // 50% de chance
  const cinquentaBtn = document.getElementById(`ajuda-cinquenta-${questionNumber}`);
  if (cinquentaBtn) {
    cinquentaBtn.classList.toggle('ajuda-usada', jokersUsed.cinquenta);
    cinquentaBtn.onclick = function() {
      if (jokersUsed.cinquenta) return;
      jokersUsed.cinquenta = true;
      cinquentaBtn.classList.add('ajuda-usada');
      // Remove duas erradas
      const opcoes = document.querySelectorAll(`#question-${questionNumber} .option`);
      let erradas = Array.from(opcoes).filter(opt => opt.getAttribute('data-correct') === 'false');
      // Remove duas aleatórias
      for (let i = 0; i < 2 && erradas.length > 0; i++) {
        let idx = Math.floor(Math.random() * erradas.length);
        erradas[idx].style.opacity = '0.3';
        erradas[idx].style.pointerEvents = 'none';
        erradas.splice(idx, 1);
      }
    };
  }
  // Pulos
  const pulosBtn = document.getElementById(`ajuda-pulos-${questionNumber}`);
  if (pulosBtn) {
    pulosBtn.classList.toggle('ajuda-usada', jokersUsed.pulos >= 2);
    pulosBtn.querySelector('.pulos-restantes').textContent = `(${2-jokersUsed.pulos})`;
    pulosBtn.onclick = function() {
      if (jokersUsed.pulos >= 2) {
        alert('Você já usou todos os pulos!');
        return;
      }
      jokersUsed.pulos++;
      pulosBtn.querySelector('.pulos-restantes').textContent = `(${2-jokersUsed.pulos})`;
      if (jokersUsed.pulos >= 2) pulosBtn.classList.add('ajuda-usada');
      // Soma os pontos da pergunta pulada apenas se não respondeu ainda
      if (!questionAnswered) {
        currentScore += questions[currentQuestion].points;
        document.getElementById('current-score').textContent = currentScore;
        questionAnswered = true;
      }
      // Avança para a próxima pergunta
      showPoints(currentQuestion + 2);
    };
  }
}

function finishGame() {
  document.querySelectorAll('.slide').forEach(slide => slide.classList.remove('active'));
  document.getElementById('final-screen').classList.add('active');
  document.getElementById('final-score').textContent = `${currentScore} pontos`;
  createConfetti();
}

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

function createConfetti() {
  const container = document.querySelector('.container');
  document.querySelectorAll('.confetti').forEach(confetti => confetti.remove());
  for (let i = 0; i < 50; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.style.left = Math.random() * 100 + '%';
    confetti.style.top = Math.random() * 100 + '%';
    confetti.style.backgroundColor = getRandomColor();
    confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
    container.appendChild(confetti);
  }
}

function getRandomColor() {
  const colors = ['#ffce00', '#2ecc71', '#e74c3c', '#3498db', '#9b59b6', '#1abc9c'];
  return colors[Math.floor(Math.random() * colors.length)];
}