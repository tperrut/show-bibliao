// ===============================
// AJUDAS / JOKERS — handlers finos
// Fluxo: grade (puro) → applyStateChanges → runEffects.
// ===============================

/**
 * Handler para clique em uma opção de resposta
 * Garante que só pode responder uma vez por pergunta
 */
function handleOptionClick() {
    if (respostaBloqueada || questionAnswered) return;

    const isCorrect = this.getAttribute('data-correct') === 'true';
    const question = questions[currentQuestion];
    const isLastQuestion = currentQuestion >= questions.length - 1;

    const grade = gradeAnswer(getStateSnapshot(), { isCorrect, question, isLastQuestion });
    applyStateChanges(grade.stateChanges);
    runEffects(grade.effects, { clickedOption: this });
}

// ===============================
// Funções de AJUDA/JOKERS
// ===============================

function setupAjudas(questionNumber) {
    setupAjudaPastores(questionNumber);
    setupAjudaClasse(questionNumber);
    setupAjudaPulos(questionNumber);
    setupAjudaCartas(questionNumber);
}

// UI chrome do botão de joker (subtext/classe) — regra de jogo fica no grading.
function markJokerButtonUsed(btn, subtext, remainingText) {
    if (subtext) subtext.textContent = remainingText;
    btn.classList.add('ajuda-usada');
    const img = btn.querySelector('img');
    if (img) img.classList.add('ajuda-usada');
}

// Ajuda dos Pastores
function setupAjudaPastores(questionNumber) {
    const pastoresBtn = document.getElementById(`ajuda-pastores-${questionNumber}`);
    if (!pastoresBtn) return;
    pastoresBtn.classList.toggle('ajuda-usada', jokersUsed.pastores);

    const subtext = pastoresBtn.parentElement.querySelector('.ajuda-subtext');
    if (subtext) subtext.textContent = jokersUsed.pastores ? 'uso restante: 0' : 'uso restante: 1';

    pastoresBtn.onclick = function () {
        const grade = gradeHelpJoker(getStateSnapshot(), 'pastores');
        applyStateChanges(grade.stateChanges);
        if (grade.accepted) {
            markJokerButtonUsed(pastoresBtn, subtext, 'uso restante: 0');
        }
        runEffects(grade.effects);
    };
}

// Ajuda da Classe
function setupAjudaClasse(questionNumber) {
    const classeBtn = document.getElementById(`ajuda-classe-${questionNumber}`);
    if (!classeBtn) return;
    classeBtn.classList.toggle('ajuda-usada', jokersUsed.classe);

    const subtext = classeBtn.parentElement.querySelector('.ajuda-subtext');
    if (subtext) subtext.textContent = jokersUsed.classe ? 'uso restante: 0' : 'uso restante: 1';

    classeBtn.onclick = function () {
        const grade = gradeHelpJoker(getStateSnapshot(), 'classe');
        applyStateChanges(grade.stateChanges);
        if (grade.accepted) {
            markJokerButtonUsed(classeBtn, subtext, 'uso restante: 0');
        }
        runEffects(grade.effects);
    };
}

// Ajuda do Pulo
function setupAjudaPulos(questionNumber) {
    const pulosBtn = document.getElementById(`ajuda-pulos-${questionNumber}`);
    if (!pulosBtn) return;
    pulosBtn.classList.toggle('ajuda-usada', jokersUsed.pulos >= 1);

    const subtext = pulosBtn.parentElement.querySelector('.ajuda-subtext');
    if (subtext) subtext.textContent = (jokersUsed.pulos >= 1) ? 'uso restante: 0' : 'uso restante: 1';

    pulosBtn.onclick = function () {
        const question = questions[currentQuestion];
        const grade = gradeSkip(getStateSnapshot(), { question, questionNumber });
        applyStateChanges(grade.stateChanges);
        if (grade.accepted) {
            markJokerButtonUsed(pulosBtn, subtext, 'uso restante: 0');
        }
        runEffects(grade.effects);
    };
}

// Cartas Misteriosas
function setupAjudaCartas(questionNumber) {
    const cartasBtn = document.getElementById(`ajuda-cartas-${questionNumber}`);
    if (!cartasBtn) return;
    cartasBtn.classList.toggle('ajuda-usada', jokersUsed.cartas);

    const subtext = cartasBtn.parentElement.querySelector('.ajuda-subtext');
    if (subtext) subtext.textContent = jokersUsed.cartas ? 'uso restante: 0' : 'uso restante: 1';

    cartasBtn.onclick = function () {
        const grade = gradeCards(getStateSnapshot(), questionNumber);
        applyStateChanges(grade.stateChanges);
        if (grade.accepted) {
            markJokerButtonUsed(cartasBtn, subtext, 'uso restante: 0');
        }
        runEffects(grade.effects);
    };
}

// ===============================
// Áudios das ajudas
// ===============================
function playCartasAudio() {
    const audio = document.getElementById('cartas-audio');
    if (audio) {
        audio.currentTime = 0;
        audio.play();
    }
    return audio;
}

function desabilitarAjudas(questionNumber) {
  document.querySelectorAll(
    `#ajuda-pastores-${questionNumber}, #ajuda-classe-${questionNumber}, #ajuda-pulos-${questionNumber}, #ajuda-cartas-${questionNumber}`
  ).forEach(btn => {
    if (btn) {
      btn.classList.add('ajuda-usada');
      btn.style.pointerEvents = 'none';
      btn.style.opacity = '0.5';
    }
  });
}

function reabilitarAjudas(questionNumber) {
  document.querySelectorAll(
    `#ajuda-pastores-${questionNumber}, #ajuda-classe-${questionNumber}, #ajuda-pulos-${questionNumber}, #ajuda-cartas-${questionNumber}`
  ).forEach(btn => {
    if (btn && !btn.classList.contains('ajuda-usada')) {
      btn.style.pointerEvents = 'auto';
      btn.style.opacity = '1';
    }
  });
}