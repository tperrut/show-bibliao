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

// Zera o estado para uma nova rodada (mesmas chaves/tipos da forma inicial).
function resetState() {
  currentScore = 0;
  currentQuestion = 0;
  jokersUsed = { cartas: false, classe: false, pastores: false, pulos: 0 };
  questionAnswered = false;
  respostaBloqueada = false;
  renderHud();
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
function useJoker(name) {
  if (name === 'pulos') {
    if (jokersUsed.pulos >= 1) return false;
    jokersUsed.pulos++;
    return true;
  }
  if (!Object.prototype.hasOwnProperty.call(jokersUsed, name)) return false;
  if (jokersUsed[name]) return false;
  jokersUsed[name] = true;
  return true;
}

// Renderiza o placar/HUD a partir do estado (ponto único de escrita na UI de score).
function renderHud() {
  const el = document.getElementById('current-score-display');
  if (el) el.textContent = String(currentScore);
}
