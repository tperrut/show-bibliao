// ===============================
// REGRAS DO JOGO — fonte única (deep module)
// Escada de pontos, total de perguntas e faixas de nível.
// Consumido pelo jogo (index.html) e pelo painel (admin.html).
// ===============================

const QUESTIONS_TARGET = 15;

// Escada de pontos por ordem da pergunta (1..QUESTIONS_TARGET).
const POINTS_LADDER = [
  10, 20, 30, 40, 50,
  100, 200, 300, 400, 500,
  600, 700, 800, 900, 1000
];

// Limites de dificuldade (ordem 1-based, inclusivos).
// cssClass alimenta os banners .level-up-banner; banner é o texto do aviso
// exibido na primeira pergunta de cada nível (null = sem banner).
const LEVEL_BOUNDS = [
  {
    start: 1,
    end: 5,
    label: 'Fácil',
    color: '#f39c12',
    cssClass: '',
    banner: null
  },
  {
    start: 6,
    end: 10,
    label: 'Médio',
    color: '#e67e22',
    cssClass: 'medio',
    banner: '⭐ VOCÊ CHEGOU AO NÍVEL MÉDIO! ⭐'
  },
  {
    start: 11,
    end: QUESTIONS_TARGET,
    label: 'Difícil',
    color: '#d35400',
    cssClass: 'dificil',
    banner: '🔥 PREPARE-SE: NÍVEL DIFÍCIL! 🔥'
  }
];

// Pontos da pergunta pela ordem (1-based). Fora da escada → 0.
function pointsForOrder(order) {
  const index = Number(order) - 1;
  return POINTS_LADDER[index] ?? 0;
}

// Faixa de nível da pergunta pela ordem (1-based).
// Ordem inválida cai na última faixa (defensivo — não deve acontecer).
function levelForQuestion(questionOrder) {
  const n = Number(questionOrder);
  const level = LEVEL_BOUNDS.find(b => n >= b.start && n <= b.end);
  return level || LEVEL_BOUNDS[LEVEL_BOUNDS.length - 1];
}

// Marco intermediário da trilha (ordens múltiplas de 5, exceto a final).
function isMilestone(questionOrder) {
  const n = Number(questionOrder);
  return n > 0 && n < QUESTIONS_TARGET && n % 5 === 0;
}

// Último degrau da trilha (pergunta final).
function isFinalStep(questionOrder) {
  return Number(questionOrder) === QUESTIONS_TARGET;
}
