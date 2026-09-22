// ===============================
// UTILITÁRIOS COMPARTILHADOS DO PAINEL
// ===============================
// Constantes de regra (QUESTIONS_TARGET, POINTS_LADDER, pointsForOrder)
// vêm de scripts/gameRules.js — fonte única carregada antes deste arquivo.

const $ = (id) => document.getElementById(id);

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function questionsProgressText(count) {
  const done = Number(count) || 0;
  if (done >= QUESTIONS_TARGET) {
    return `${done}/${QUESTIONS_TARGET} perguntas — completo`;
  }
  return `${done}/${QUESTIONS_TARGET} perguntas — complete as que faltam`;
}

function showMessage(id, text, type = 'success') {
  const el = $(id);
  if (!el) return;
  el.textContent = text;
  el.classList.remove('hidden');
  el.classList.remove('success', 'error');
  el.classList.add(type);
}

function hideMessage(id) {
  const el = $(id);
  if (el) el.classList.add('hidden');
}

// Ícones SVG inline (padrão de mercado) — sem dependência externa.
const ICON_SVG = {
  view:
    '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
  edit:
    '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>',
  delete:
    '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'
};

// Estado global leve do painel (rota atual, ids em contexto)
const adminState = {
  authUser: null,
  questionnaireId: null,
  questionId: null,
  questionReturnPath: null
};
