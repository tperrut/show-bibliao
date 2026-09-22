// ===============================
// FORMULÁRIO DE QUESTIONÁRIO (criar / editar)
// Na edição, exibe também o bloco de perguntas (questionário completo).
// Ids em contexto vêm de parseAdminRoute().
// ===============================

function hideQuestionnaireFormMessages() {
  hideMessage('questionnaire-form-error');
  hideMessage('questionnaire-form-success');
}

function renderEditQuestions(questions) {
  const count = questions.length;
  $('edit-questions-progress').textContent = questionsProgressText(count);

  const addBtn = $('edit-add-question-btn');
  const emptyAddBtn = $('edit-questions-empty-btn');
  const atLimit = count >= QUESTIONS_TARGET;

  addBtn.disabled = atLimit;
  addBtn.textContent = atLimit ? `Limite de ${QUESTIONS_TARGET} atingido` : '+ Nova Pergunta';
  emptyAddBtn.disabled = atLimit;

  const emptyState = $('edit-questions-empty');
  const table = $('edit-questions-table');
  const tbody = $('edit-questions-table-body');

  if (!count) {
    tbody.innerHTML = '';
    table.classList.add('hidden');
    emptyState.classList.remove('hidden');
    if (atLimit) {
      emptyState.querySelector('p').textContent = `Limite de ${QUESTIONS_TARGET} perguntas atingido.`;
    } else {
      emptyState.querySelector('p').textContent =
        'Este questionário ainda não tem perguntas. Você pode cadastrá-las aos poucos.';
    }
    return;
  }

  emptyState.classList.add('hidden');
  table.classList.remove('hidden');
  tbody.innerHTML = questions.map(renderQuestionRow).join('');
}

async function reloadEditQuestions() {
  const { questionnaireId } = parseAdminRoute();
  if (!questionnaireId) return;
  try {
    const questions = await listQuestionsForAdmin(questionnaireId);
    renderEditQuestions(questions);
  } catch (err) {
    console.error(err);
    showMessage('questionnaire-form-error', 'Erro ao carregar perguntas.', 'error');
  }
}

function setQuestionsBlockEnabled(enabled) {
  const addBtn = $('edit-add-question-btn');
  const emptyAddBtn = $('edit-questions-empty-btn');
  addBtn.disabled = !enabled;
  emptyAddBtn.disabled = !enabled;
}

// Estado do bloco de perguntas antes do primeiro salvamento (modo criação):
// o admin vê que as perguntas fazem parte do questionário, mas só podem ser
// cadastradas após salvar (o documento precisa existir no Firestore).
function renderPendingQuestionsBlock() {
  setQuestionsBlockEnabled(false);
  $('edit-add-question-btn').textContent = '+ Nova Pergunta';
  $('edit-questions-progress').textContent =
    'Salve o questionário para começar a cadastrar as perguntas (15 no total).';
  $('edit-questions-table').classList.add('hidden');
  $('edit-questions-table-body').innerHTML = '';
  $('edit-questions-empty').classList.remove('hidden');
  $('edit-questions-empty').querySelector('p').textContent =
    'Primeiro salve o questionário; depois você cadastra as perguntas aqui, quantas quiser de cada vez.';
}

async function openQuestionnaireForm(id) {
  hideQuestionnaireFormMessages();
  $('qn-name').value = '';
  $('qn-desc').value = '';
  $('form-title-questionnaire').textContent = id ? 'Editar Questionário' : 'Novo Questionário';

  const questionsBlock = $('edit-questions-block');
  questionsBlock.classList.remove('hidden');

  if (!id) {
    renderPendingQuestionsBlock();
    $('qn-name').focus();
    return;
  }

  try {
    const [questionnaire, questions] = await Promise.all([
      getQuestionnaire(id),
      listQuestionsForAdmin(id)
    ]);
    if (!questionnaire) {
      navigate('/questionnaires');
      return;
    }
    $('qn-name').value = questionnaire.name;
    $('qn-desc').value = questionnaire.description || '';
    renderEditQuestions(questions);
  } catch (err) {
    console.error(err);
    showMessage('questionnaire-form-error', 'Erro ao carregar questionário.', 'error');
  }
}

async function onSaveQuestionnaire() {
  const name = $('qn-name').value.trim();
  const description = $('qn-desc').value.trim();

  if (!name) {
    showMessage('questionnaire-form-error', 'Informe o nome do questionário.', 'error');
    return;
  }

  hideQuestionnaireFormMessages();
  const saveBtn = $('save-questionnaire-btn');
  saveBtn.disabled = true;
  try {
    const { questionnaireId } = parseAdminRoute();
    if (questionnaireId) {
      await updateQuestionnaire(questionnaireId, { name, description });
      showMessage('questionnaire-form-success', 'Questionário salvo. Continue editando as perguntas abaixo.', 'success');
    } else {
      const ref = await createQuestionnaire({ name, description });
      navigate(`/questionnaires/${ref.id}/edit`);
    }
  } catch (err) {
    console.error(err);
    showMessage('questionnaire-form-error', 'Erro ao salvar questionário.', 'error');
  } finally {
    saveBtn.disabled = false;
  }
}

function goToQuestionForm(mode) {
  const { questionnaireId } = parseAdminRoute();
  adminState.questionReturnPath = `/questionnaires/${questionnaireId}/edit`;
  navigate(`/questionnaires/${questionnaireId}/questions/${mode}`);
}

async function onDeleteQuestionFromEdit(questionId) {
  if (!confirm('Excluir esta pergunta?')) return;
  const { questionnaireId } = parseAdminRoute();
  try {
    await deleteQuestion(questionnaireId, questionId);
    await reloadEditQuestions();
  } catch (err) {
    console.error(err);
    showMessage('questionnaire-form-error', 'Erro ao excluir pergunta.', 'error');
  }
}

function initQuestionnaireFormView() {
  const saveBtn = $('save-questionnaire-btn');
  if (saveBtn) {
    saveBtn.addEventListener('click', onSaveQuestionnaire);
  }

  const cancelBtn = $('cancel-questionnaire-btn');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => navigate('/questionnaires'));
  }

  const addBtn = $('edit-add-question-btn');
  if (addBtn) {
    addBtn.addEventListener('click', () => goToQuestionForm('new'));
  }

  const emptyAddBtn = $('edit-questions-empty-btn');
  if (emptyAddBtn) {
    emptyAddBtn.addEventListener('click', () => goToQuestionForm('new'));
  }

  const tbody = $('edit-questions-table-body');
  if (tbody) {
    tbody.addEventListener('click', (event) => {
      const btn = event.target.closest('button[data-action]');
      if (!btn) return;
      const id = btn.dataset.id;
      if (btn.dataset.action === 'edit-question') {
        goToQuestionForm(`${id}/edit`);
      } else if (btn.dataset.action === 'delete-question') {
        onDeleteQuestionFromEdit(id);
      }
    });
  }
}
