// ===============================
// GRADING + RUNNER DE EFEITOS (C4)
// grade* : funções puras — recebem snapshot do estado e devolvem
//          { stateChanges, effects } sem tocar DOM/state/timers.
// runEffects : adapter de execução — toca áudio/DOM/timers a partir dos
//          descritores de efeito.
// Fluxo do handler: grade → applyStateChanges → runEffects.
// ===============================

// Constantes de timing — fonte única dos delays do fluxo de resposta.
const EFFECTS_TIMING = {
  answerAdvanceMs: 3000,
  skipFeedbackMs: 3000,
  cardsShuffleMs: 100
};

// Textos dos modais de jokers (copy do fluxo, pt-BR).
const JOKER_MODAL_HTML = {
  pastoresHelp:
    '<div style="text-align:center"><img src="images/pastores.png" alt="Ajuda dos Pastores" style="max-width:100%;border-radius:8px;margin-bottom:10px;"> <br>Consulte os Pastores Presentes!</div>',
  pastoresUsed:
    '<div style="text-align:center"><b>Você já usou a ajuda dos Pastores!</b></div>',
  classeHelp:
    '<div style="text-align:center"><img src="images/classe.jpg" alt="Classe" style="max-width:100%;border-radius:8px;margin-bottom:10px;"><br>Consulte a Classe!</div>',
  classeUsed:
    '<div style="text-align:center"><b>Você já usou a ajuda da Classe!</b></div>',
  pulosUsed:
    '<div style="text-align:center"><b>Você já usou o seu pulo!</b></div>',
  cartasUsed:
    '<div style="text-align:center"><b>Você já usou sua ajuda de Cartas!</b></div>',
  puloFeedback:
    `<div style="text-align:center">
        <h2>Você pulou esta pergunta!</h2>
        <p>Avançando para a próxima...</p>
    </div>`
};

// Mensagens das cartas misteriosas (índice = carta sorteada 0..3).
const CARD_MESSAGES = [
  "Você não vai excluir nenhuma opção.",
  "Você vai excluir apenas uma resposta errada.",
  "Você vai excluir 2 respostas erradas.",
  "Você deu sorte! Excluiu todas as respostas erradas."
];

// Regra pura de disponibilidade do joker (espelho da transição useJoker).
function canUseJoker(jokersUsed, name) {
  if (name === 'pulos') return Number(jokersUsed.pulos) < 1;
  if (!Object.prototype.hasOwnProperty.call(jokersUsed, name)) return false;
  return !jokersUsed[name];
}

/**
 * Avalia a resposta (certa/errada). Puro.
 * @param {object} state - snapshot via getStateSnapshot()
 * @param {object} input - { isCorrect, question, isLastQuestion }
 * @returns {{ stateChanges: object, effects: array }}
 */
function gradeAnswer(state, { isCorrect, question, isLastQuestion }) {
  const questionNumber = state.currentQuestion + 1;
  const stateChanges = { markAnswered: true };
  const effects = [
    { type: 'disable-options', questionNumber },
    { type: 'disable-jokers', questionNumber }
  ];

  if (isCorrect) {
    stateChanges.score = question.points;
    effects.push(
      { type: 'confetti' },
      { type: 'sound', id: 'certa-resposta-audio' },
      { type: 'sound', id: 'aplausos-audio' },
      { type: 'answer-classes', clicked: 'correct', revealCorrect: false },
      {
        type: 'advance-after',
        ms: EFFECTS_TIMING.answerAdvanceMs,
        action: isLastQuestion ? 'finish-win' : 'next-points',
        questionNumber: state.currentQuestion + 2
      }
    );
  } else {
    effects.push(
      { type: 'answer-classes', clicked: 'incorrect', revealCorrect: true },
      { type: 'sound', id: 'fiasco-audio' },
      { type: 'advance-after', ms: EFFECTS_TIMING.answerAdvanceMs, action: 'finish-lose' }
    );
  }

  return { stateChanges, effects };
}

/**
 * Avalia o uso do Pulo. Puro.
 * O som toca sempre (aceito ou não), como no fluxo legado.
 * @param {object} state - snapshot
 * @param {object} input - { question, questionNumber } (questionNumber 1-based)
 * @returns {{ accepted: boolean, stateChanges: object, effects: array }}
 */
function gradeSkip(state, { question, questionNumber }) {
  const effects = [{ type: 'sound', id: 'pulo-audio' }];
  const accepted = canUseJoker(state.jokersUsed, 'pulos');

  if (!accepted) {
    effects.push({ type: 'modal', html: JOKER_MODAL_HTML.pulosUsed, mode: 'ajuda' });
    return { accepted: false, stateChanges: {}, effects };
  }

  const stateChanges = { useJoker: 'pulos' };
  if (!state.respostaBloqueada) {
    stateChanges.score = question.points;
    stateChanges.markAnswered = true;
    effects.push({ type: 'disable-options', questionNumber });
  }

  effects.push({
    type: 'modal-after',
    ms: EFFECTS_TIMING.skipFeedbackMs,
    html: JOKER_MODAL_HTML.puloFeedback,
    onModalClose: { kind: 'show-points', questionNumber: questionNumber + 1 }
  });

  return { accepted: true, stateChanges, effects };
}

/**
 * Avalia Pastores/Classe (ajuda com modal de imagem). Puro.
 * O som toca sempre (aceito ou não), como no fluxo legado.
 * @param {object} state - snapshot
 * @param {string} name - 'pastores' | 'classe'
 * @returns {{ accepted: boolean, stateChanges: object, effects: array }}
 */
function gradeHelpJoker(state, name) {
  const effects = [{ type: 'sound', id: 'ajuda-audio' }];
  const accepted = canUseJoker(state.jokersUsed, name);

  if (!accepted) {
    effects.push({ type: 'modal', html: JOKER_MODAL_HTML[`${name}Used`], mode: 'ajuda' });
    return { accepted: false, stateChanges: {}, effects };
  }

  effects.push({ type: 'modal', html: JOKER_MODAL_HTML[`${name}Help`], mode: 'ajuda' });
  return { accepted: true, stateChanges: { useJoker: name }, effects };
}

/**
 * Avalia o uso das Cartas Misteriosas. Puro.
 * O fluxo completo (shuffle, áudios, resultado) roda no runEffects via cards-draw.
 * @param {object} state - snapshot
 * @param {number} questionNumber - 1-based
 * @returns {{ accepted: boolean, stateChanges: object, effects: array }}
 */
function gradeCards(state, questionNumber) {
  const accepted = canUseJoker(state.jokersUsed, 'cartas');

  if (!accepted) {
    return {
      accepted: false,
      stateChanges: {},
      effects: [{ type: 'modal', html: JOKER_MODAL_HTML.cartasUsed, mode: 'ajuda' }]
    };
  }

  return {
    accepted: true,
    stateChanges: { useJoker: 'cartas' },
    effects: [{ type: 'cards-draw', questionNumber, mensagens: CARD_MESSAGES }]
  };
}

// ===============================
// RUNNER DE EFEITOS
// ===============================

/**
 * Executa a lista de descritores de efeito (ordem do array).
 * @param {array} effects
 * @param {object} [ctx] - contexto do clique ({ clickedOption })
 */
function runEffects(effects, ctx = {}) {
  if (!Array.isArray(effects)) return;
  effects.forEach(effect => runEffect(effect, ctx));
}

function runEffect(effect, ctx) {
  switch (effect.type) {
    case 'sound': {
      const audio = document.getElementById(effect.id);
      if (audio) {
        audio.currentTime = 0;
        audio.play();
      }
      break;
    }

    case 'confetti':
      createConfetti();
      break;

    case 'disable-options':
      document.querySelectorAll(`#question-${effect.questionNumber} .option`).forEach(opt => {
        opt.style.pointerEvents = 'none';
      });
      break;

    case 'disable-jokers':
      desabilitarAjudas(effect.questionNumber);
      break;

    case 'answer-classes': {
      const clicked = ctx.clickedOption;
      if (!clicked) break;
      if (effect.clicked) clicked.classList.add(effect.clicked);
      if (effect.revealCorrect) {
        const correct = clicked.parentElement.querySelector('[data-correct="true"]');
        if (correct) correct.classList.add('correct');
      }
      break;
    }

    case 'advance-after':
      setTimeout(() => runAdvanceAction(effect), effect.ms);
      break;

    case 'modal':
      openModalFromEffect(effect);
      break;

    case 'modal-after':
      setTimeout(() => openModalFromEffect(effect), effect.ms);
      break;

    case 'cards-draw':
      runCardsDraw(effect);
      break;

    default:
      console.warn('[ShowBiblao] efeito desconhecido:', effect.type);
  }
}

function openModalFromEffect(effect) {
  if (effect.onModalClose) {
    openFeedbackModal(effect.html, () => runModalCloseAction(effect.onModalClose));
  } else if (effect.mode === 'ajuda') {
    openAjudaModal(effect.html);
  } else {
    openFeedbackModal(effect.html);
  }
}

function runAdvanceAction(effect) {
  if (effect.action === 'next-points') showPoints(effect.questionNumber);
  else if (effect.action === 'finish-win') finishGame(true);
  else if (effect.action === 'finish-lose') finishGame(false);
}

function runModalCloseAction(action) {
  if (action.kind === 'show-points') showPoints(action.questionNumber);
  else if (action.kind === 'finish-win') finishGame(true);
  else if (action.kind === 'finish-lose') finishGame(false);
}

// Fluxo das cartas: shuffle (delay) → áudio base → especial → resultado → dim.
function runCardsDraw({ questionNumber, mensagens }) {
  const carta = Math.floor(Math.random() * 4);

  setTimeout(() => {
    openFeedbackModal(`
        <div style="text-align:center">
            <img src="images/roda.webp" alt="Embaralhando cartas" style="max-width:100%;border-radius:8px;margin-bottom:10px;">
            <br><b>Embaralhando cartas...</b>
        </div>
    `);
  }, EFFECTS_TIMING.cardsShuffleMs);

  const audioCartas = typeof playCartasAudio === 'function' ? playCartasAudio() : null;

  function tocarAudioEspecial() {
    if (carta === 0) {
      runEffect({ type: 'sound', id: 'fiasco-audio' }, {});
    } else if (carta === 3) {
      runEffect({ type: 'sound', id: 'eeeeee-criancas-audio' }, {});
    }
  }

  function mostrarCarta() {
    openFeedbackModal(
      `<div style="text-align:center">
                <img src="images/carta${carta}.jpg" alt="Carta Misteriosa" style="max-width:100%;border-radius:8px;margin-bottom:10px;">
                <br><span style="font-size: 1.5rem; font-weight: bold;">${mensagens[carta]}</span>
            </div>`,
      () => dimWrongOptions(questionNumber, carta)
    );
  }

  if (audioCartas) {
    audioCartas.onended = function () {
      tocarAudioEspecial();
      mostrarCarta();
      audioCartas.onended = null;
    };
  } else {
    tocarAudioEspecial();
    mostrarCarta();
  }
}

function dimWrongOptions(questionNumber, carta) {
  if (carta <= 0) return;
  const opcoes = document.querySelectorAll(`#question-${questionNumber} .option`);
  const erradas = Array.from(opcoes).filter(opt => opt.getAttribute('data-correct') === 'false');
  for (let i = erradas.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [erradas[i], erradas[j]] = [erradas[j], erradas[i]];
  }
  for (let i = 0; i < carta && erradas.length > 0; i++) {
    erradas[i].style.opacity = '0.3';
    erradas[i].style.pointerEvents = 'none';
  }
}
