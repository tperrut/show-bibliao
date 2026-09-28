// ===============================
// ESTADO GLOBAL DO JOGO (único writer)
// Somente este módulo muta as variáveis de estado.
// Outros módulos leem e chamam as transições abaixo.
// ===============================

// Forma canônica do estado — manter em sincronia com resetState().
let currentScore = 0;
let currentQuestion = 0;
let jokersUsed = { cartas: false, classe: false, pastores: false, pulos: 0 };
let questionAnswered = false;
let respostaBloqueada = false;
// true quando o usuário escolheu um questionário (ou confirmou o padrão) nesta sessão.
let questionnaireChosen = false;
// Histórico da rodada: um round por pergunta respondida ou pulada, capturado
// no instante da resposta (o "print" da partida é derivado daqui).
let roundHistory = [];
// Índice do round que encerrou a partida (null enquanto ela corre).
let decisiveRoundIndex = null;
// Contexto da partida que acabou — null quando não há partida encerrada.
// `lastOutcome` é 'win' | 'lose'; `playedAt` é o ISO do momento do fim.
let lastOutcome = null;
let playedAt = null;
// Questionário em uso. Persistente na sessão como `questionnaireChosen`:
// "Jogar Novamente" reaproveita as perguntas carregadas.
let currentQuestionnaire = { id: null, name: null };

// Zera o estado para uma nova rodada (mesmas chaves/tipos da forma inicial).
// questionnaireChosen e currentQuestionnaire são persistentes na sessão — não zeram aqui.
function resetState() {
  currentScore = 0;
  currentQuestion = 0;
  jokersUsed = { cartas: false, classe: false, pastores: false, pulos: 0 };
  questionAnswered = false;
  respostaBloqueada = false;
  roundHistory = [];
  decisiveRoundIndex = null;
  lastOutcome = null;
  playedAt = null;
  renderHud();
}

// Registra a identidade do questionário carregado (id null = questionário padrão em memória).
function setCurrentQuestionnaire(id, name) {
  currentQuestionnaire = { id: id || null, name: name || null };
}

// Questionário em uso — espelho de leitura do estado.
function getCurrentQuestionnaire() {
  return { ...currentQuestionnaire };
}

// Marca o fim da partida: resultado e horário (usados no registro de histórico).
function finishGameState(outcome) {
  lastOutcome = outcome === 'win' ? 'win' : 'lose';
  playedAt = new Date().toISOString();
}

// Registra um round da rodada. É o único escritor de roundHistory/decisiveRoundIndex.
// O retrato dos jokers é tirado do estado no momento do registro — por isso
// applyStateChanges resolve `useJoker` antes de `recordRound`.
function recordRound(round) {
  if (!round) return;
  const entry = { ...round, jokers: { ...jokersUsed } };
  roundHistory.push(entry);
  if (round.decisive) decisiveRoundIndex = roundHistory.length - 1;
}

// Marca que um questionário já foi escolhido/confirmado (evita reperguntar ao iniciar).
function setQuestionnaireChosen() {
  questionnaireChosen = true;
}

// Define a pontuação atual e atualiza o HUD.
function setScore(value) {
  currentScore = value;
  renderHud();
}

// Avança/recua o índice da pergunta atual (0-based) e atualiza o HUD.
function setQuestionIndex(index) {
  currentQuestion = index;
  renderHud();
}

// Marca a pergunta atual como respondida (bloqueia novo clique).
function markAnswered() {
  questionAnswered = true;
  respostaBloqueada = true;
}

// Libera a pergunta para nova resposta (usado ao mostrar nova pergunta).
function clearAnswerLock() {
  questionAnswered = false;
  respostaBloqueada = false;
}

// Registra o uso de um joker. name: 'cartas' | 'classe' | 'pastores' | 'pulos'.
// Retorna true se o uso foi aceito, false se já estava esgotado.
// A regra pura de disponibilidade vive em canUseJoker (grading.js).
function useJoker(name) {
  if (!canUseJoker(jokersUsed, name)) return false;
  if (name === 'pulos') {
    jokersUsed.pulos++;
    return true;
  }
  jokersUsed[name] = true;
  return true;
}

// Snapshot imutável do estado para as funções puras de grading.
function getStateSnapshot() {
  return {
    currentScore,
    currentQuestion,
    jokersUsed: { ...jokersUsed },
    questionAnswered,
    respostaBloqueada,
    roundHistory: [...roundHistory],
    decisiveRoundIndex,
    lastOutcome,
    playedAt
  };
}

// Aplica as mudanças de estado devolvidas por grade* via transições do módulo.
// A ordem importa: `useJoker` antes de `recordRound`, para o round gravado já
// refletir o joker consumido na mesma jogada (ex.: Pular).
function applyStateChanges(changes) {
  if (!changes) return;
  if ('score' in changes) setScore(changes.score);
  if ('questionIndex' in changes) setQuestionIndex(changes.questionIndex);
  if (changes.markAnswered) markAnswered();
  if (changes.clearAnswerLock) clearAnswerLock();
  if (changes.useJoker) useJoker(changes.useJoker);
  if (changes.recordRound) recordRound(changes.recordRound);
}

// Renderiza o placar/HUD a partir do estado (ponto único de escrita na UI de score).
function renderHud() {
  const el = document.getElementById('current-score-display');
  if (el) el.textContent = String(currentScore);
}
