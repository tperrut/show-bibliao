// ===============================
// REGISTRO DE PARTIDA — montagem e validação
// Funções puras: sem DOM, rede ou storage. A gravação em si vive em
// firebaseService.js e a autorização em authGate.js.
// ===============================

// Versão do formato do documento — permite migrar registros antigos.
const HISTORY_VERSION = 1;

// Limites do documento. Espelham as validações de forma em firestore.rules.
const HISTORY_LIMITS = {
  playerNameMax: 60,
  classNameMax: 60,
  maxRounds: QUESTIONS_TARGET,
  // Teto folgado para o registro caber no sessionStorage (a pendência de login)
  // com folga para a serialização; o Firestore aceita muito mais.
  maxSerializedBytes: 256 * 1024
};

// Pontuação máxima de uma partida: o topo da escada (currentScore carrega o
// valor do último degrau alcançado, não a soma).
const HISTORY_MAX_SCORE = POINTS_LADDER.reduce((max, points) => Math.max(max, points), 0);

// Normaliza o retrato dos jokers para a forma canônica {cartas, classe, pastores, pulos}.
function normalizeJokers(jokers) {
  const source = jokers && typeof jokers === 'object' ? jokers : {};
  return {
    cartas: !!source.cartas,
    classe: !!source.classe,
    pastores: !!source.pastores,
    pulos: Number(source.pulos) || 0
  };
}

function trimmedString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

// Tamanho do documento serializado, em bytes UTF-8.
function serializedSize(record) {
  const json = JSON.stringify(record);
  if (typeof TextEncoder === 'function') {
    return new TextEncoder().encode(json).length;
  }
  return json.length;
}

/**
 * Monta o documento de histórico a partir do estado encerrado da partida.
 * Puro: não toca DOM, rede nem storage.
 *
 * @param {object} input
 * @param {object} input.state - snapshot via getStateSnapshot() (após o fim da partida)
 * @param {object} input.identity - { playerName, className } (classe é texto livre)
 * @param {object} input.questionnaire - { id, name } via getCurrentQuestionnaire()
 * @param {string} input.outcome - 'win' | 'lose'
 * @param {string} input.playedAt - ISO do momento em que a partida terminou
 * @param {string} [input.savedByEmail] - e-mail do admin que está salvando
 * @returns {object} documento pronto para o Firestore (createdAt entra na gravação)
 */
function buildGameRecord({ state, identity, questionnaire, outcome, playedAt, savedByEmail = '' }) {
  const snapshot = state || {};
  const rounds = (snapshot.roundHistory || [])
    .slice(0, HISTORY_LIMITS.maxRounds)
    .map(round => ({
      order: Number(round.order) || 0,
      question: String(round.question || ''),
      points: Number(round.points) || 0,
      options: (round.options || []).map(option => ({
        text: String(option.text || ''),
        correct: !!option.correct
      })),
      chosenIndex: Number.isInteger(round.chosenIndex) ? round.chosenIndex : null,
      chosenText: round.chosenText == null ? null : String(round.chosenText),
      chosenCorrect: round.skipped ? null : !!round.chosenCorrect,
      skipped: !!round.skipped,
      jokers: normalizeJokers(round.jokers),
      decisive: !!round.decisive
    }));

  const questionnaireData = questionnaire || {};

  return {
    version: HISTORY_VERSION,
    questionnaireId: questionnaireData.id || null,
    questionnaireName: String(questionnaireData.name || ''),
    playerName: trimmedString(identity && identity.playerName),
    className: trimmedString(identity && identity.className),
    score: Number(snapshot.currentScore) || 0,
    outcome: outcome === 'win' ? 'win' : 'lose',
    answeredCount: rounds.length,
    jokersUsed: normalizeJokers(snapshot.jokersUsed),
    rounds,
    decisiveRoundIndex: Number.isInteger(snapshot.decisiveRoundIndex) ? snapshot.decisiveRoundIndex : null,
    playedAt: String(playedAt || ''),
    savedByEmail: trimmedString(savedByEmail)
  };
}

/**
 * Valida a forma do registro antes de gravar (espelha as regras do Firestore,
 * para falhar com mensagem em vez de erro de permissão).
 * @param {object} record
 * @returns {{ ok: boolean, errors: string[] }}
 */
function validateGameRecord(record) {
  const errors = [];
  const data = record || {};

  if (!trimmedString(data.playerName)) {
    errors.push('Informe o nome do jogador.');
  } else if (data.playerName.length > HISTORY_LIMITS.playerNameMax) {
    errors.push(`O nome do jogador deve ter no máximo ${HISTORY_LIMITS.playerNameMax} caracteres.`);
  }

  if (typeof data.className !== 'string') {
    errors.push('Classe inválida.');
  } else if (data.className.length > HISTORY_LIMITS.classNameMax) {
    errors.push(`A classe deve ter no máximo ${HISTORY_LIMITS.classNameMax} caracteres.`);
  }

  const score = Number(data.score);
  if (!Number.isInteger(score) || score < 0 || score > HISTORY_MAX_SCORE) {
    errors.push(`Pontuação inválida (esperado entre 0 e ${HISTORY_MAX_SCORE}).`);
  }

  if (data.outcome !== 'win' && data.outcome !== 'lose') {
    errors.push('Resultado da partida inválido.');
  }

  if (!Array.isArray(data.rounds)) {
    errors.push('Histórico de respostas inválido.');
  } else if (data.rounds.length > HISTORY_LIMITS.maxRounds) {
    errors.push(`A partida não pode ter mais de ${HISTORY_LIMITS.maxRounds} perguntas.`);
  }

  if (!trimmedString(data.playedAt)) {
    errors.push('Data da partida ausente.');
  }

  if (errors.length === 0 && serializedSize(data) > HISTORY_LIMITS.maxSerializedBytes) {
    errors.push('O registro ficou grande demais para ser salvo.');
  }

  return { ok: errors.length === 0, errors };
}
