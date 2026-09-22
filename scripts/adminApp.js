// ===============================
// NAVEGAÇÃO / BOOTSTRAP DO PAINEL
// Hash routing:
//   #/questionnaires
//   #/questionnaires/new
//   #/questionnaires/:id/edit
//   #/questionnaires/:id/view
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

// Fonte única dos ids em contexto: views leem da rota, não de holders paralelos.
// route: 'list' | 'new-questionnaire' | 'edit-questionnaire' | 'view-questionnaire'
//      | 'list-questions' | 'new-question' | 'edit-question' | null (inválida)
function parseAdminRoute() {
  const raw = location.hash.replace(/^#/, '') || '/questionnaires';
  const parts = raw.split('/').filter(Boolean);

  const ctx = {
    route: null,
    questionnaireId: null,
    questionId: null
  };

  if (parts[0] !== 'questionnaires') return ctx;

  // #/questionnaires
  if (parts.length === 1) {
    ctx.route = 'list';
    return ctx;
  }

  // #/questionnaires/new
  if (parts.length === 2 && parts[1] === 'new') {
    ctx.route = 'new-questionnaire';
    return ctx;
  }

  if (parts.length < 3) return ctx;

  ctx.questionnaireId = parts[1];

  // #/questionnaires/:id/edit | /view | /questions
  if (parts.length === 3) {
    if (parts[2] === 'edit') ctx.route = 'edit-questionnaire';
    else if (parts[2] === 'view') ctx.route = 'view-questionnaire';
    else if (parts[2] === 'questions') ctx.route = 'list-questions';
    return ctx;
  }

  // #/questionnaires/:id/questions/new
  if (parts.length === 4 && parts[2] === 'questions' && parts[3] === 'new') {
    ctx.route = 'new-question';
    return ctx;
  }

  // #/questionnaires/:id/questions/:qid/edit
  if (parts.length === 5 && parts[2] === 'questions' && parts[4] === 'edit') {
    ctx.route = 'edit-question';
    ctx.questionId = parts[3];
    return ctx;
  }

  return ctx;
}

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

  const ctx = parseAdminRoute();

  switch (ctx.route) {
    case 'list':
      showView('view-questionnaires');
      loadQuestionnaires();
      return;

    case 'new-questionnaire':
      adminState.questionReturnPath = null;
      showView('view-questionnaire-form');
      openQuestionnaireForm(null);
      return;

    case 'edit-questionnaire':
      adminState.questionReturnPath = null;
      showView('view-questionnaire-form');
      openQuestionnaireForm(ctx.questionnaireId);
      return;

    case 'view-questionnaire':
      showView('view-questionnaire-detail');
      loadQuestionnaireDetail(ctx.questionnaireId);
      return;

    case 'list-questions':
      showView('view-questions');
      loadQuestionsView(ctx.questionnaireId);
      return;

    case 'new-question':
      showView('view-question-form');
      openQuestionForm(ctx.questionnaireId, null);
      return;

    case 'edit-question':
      showView('view-question-form');
      openQuestionForm(ctx.questionnaireId, ctx.questionId);
      return;

    default:
      navigate('/questionnaires');
  }
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
