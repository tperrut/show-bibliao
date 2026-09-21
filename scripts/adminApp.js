// ===============================
// NAVEGAÇÃO / BOOTSTRAP DO PAINEL
// Hash routing:
//   #/questionnaires
//   #/questionnaires/new
//   #/questionnaires/:id/edit
//   #/questionnaires/:id/questions
//   #/questionnaires/:id/questions/new
//   #/questionnaires/:id/questions/:qid/edit
// ===============================

const ADMIN_VIEWS = [
  'view-questionnaires',
  'view-questionnaire-form',
  'view-questionnaire-detail',
  'view-questions',
  'view-question-form'
];

function showView(viewId) {
  ADMIN_VIEWS.forEach(id => {
    const el = $(id);
    if (el) el.classList.add('hidden');
  });
  const target = $(viewId);
  if (target) target.classList.remove('hidden');
}

function navigate(path) {
  const next = `#${path}`;
  if (location.hash === next) {
    handleRoute();
  } else {
    location.hash = next;
  }
}

function handleRoute() {
  if (!adminState.authUser) {
    return;
  }

  const raw = location.hash.replace(/^#/, '') || '/questionnaires';
  const parts = raw.split('/').filter(Boolean);

  if (parts[0] !== 'questionnaires') {
    navigate('/questionnaires');
    return;
  }

  // #/questionnaires
  if (parts.length === 1) {
    showView('view-questionnaires');
    loadQuestionnaires();
    return;
  }

  // #/questionnaires/new
  if (parts.length === 2 && parts[1] === 'new') {
    adminState.questionReturnPath = null;
    showView('view-questionnaire-form');
    openQuestionnaireForm(null);
    return;
  }

  if (parts.length < 3) {
    navigate('/questionnaires');
    return;
  }

  const questionnaireId = parts[1];
  adminState.questionnaireId = questionnaireId;

  // #/questionnaires/:id/edit
  if (parts[2] === 'edit' && parts.length === 3) {
    adminState.questionReturnPath = null;
    showView('view-questionnaire-form');
    openQuestionnaireForm(questionnaireId);
    return;
  }

  // #/questionnaires/:id/view
  if (parts[2] === 'view' && parts.length === 3) {
    showView('view-questionnaire-detail');
    loadQuestionnaireDetail(questionnaireId);
    return;
  }

  // #/questionnaires/:id/questions
  if (parts[2] === 'questions' && parts.length === 3) {
    showView('view-questions');
    loadQuestionsView(questionnaireId);
    return;
  }

  // #/questionnaires/:id/questions/new
  if (parts[2] === 'questions' && parts.length === 4 && parts[3] === 'new') {
    showView('view-question-form');
    openQuestionForm(questionnaireId, null);
    return;
  }

  // #/questionnaires/:id/questions/:qid/edit
  if (parts[2] === 'questions' && parts.length === 5 && parts[4] === 'edit') {
    showView('view-question-form');
    openQuestionForm(questionnaireId, parts[3]);
    return;
  }

  navigate('/questionnaires');
}

document.addEventListener('DOMContentLoaded', () => {
  const safeInit = (fn) => {
    try { fn(); } catch (err) { console.error(`Erro ao iniciar ${fn.name}:`, err); }
  };

  safeInit(initAuth);
  safeInit(initQuestionnairesView);
  safeInit(initQuestionnaireFormView);
  safeInit(initQuestionnaireDetailView);
  safeInit(initQuestionsView);
  safeInit(initQuestionFormView);

  window.addEventListener('hashchange', handleRoute);

  if (adminState.authUser) {
    handleRoute();
  } else if (!location.hash) {
    location.hash = '/questionnaires';
  }
});
