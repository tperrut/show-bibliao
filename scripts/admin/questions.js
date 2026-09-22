// ===============================
// LISTAGEM DE PERGUNTAS DO QUESTIONÁRIO
// ===============================

async function loadQuestionsView(questionnaireId) {
  adminState.questionnaireId = questionnaireId;
  hideMessage('questionnaire-questions-error');

  const titleEl = $('questions-view-title');
  titleEl.textContent = 'Perguntas';
  $('questions-questionnaire-name').textContent = 'Carregando…';

  setQuestionsLoading(true);
  try {
    const [questionnaire, questions] = await Promise.all([
      getQuestionnaire(questionnaireId),
      listQuestionsForAdmin(questionnaireId)
    ]);

    if (!questionnaire) {
      navigate('/questionnaires');
      return;
    }

    titleEl.textContent = `Perguntas — ${questionnaire.name}`;
    $('questions-questionnaire-name').textContent = questionsProgressText(questions.length);

    const atLimit = questions.length >= QUESTIONS_TARGET;
    const addBtn = $('add-question-btn');
    const emptyAddBtn = $('empty-new-question-btn');
    addBtn.disabled = atLimit;
    addBtn.textContent = atLimit ? `Limite de ${QUESTIONS_TARGET} atingido` : '+ Nova Pergunta';
    emptyAddBtn.disabled = atLimit;

    const tbody = $('questions-table-body');
    const table = $('questions-table');
    const emptyState = $('questions-empty');

    if (!questions.length) {
      tbody.innerHTML = '';
      table.classList.add('hidden');
      emptyState.classList.remove('hidden');
      return;
    }

    tbody.innerHTML = questions.map(renderQuestionRow).join('');
    table.classList.remove('hidden');
    emptyState.classList.add('hidden');
  } catch (err) {
    console.error(err);
    showQuestionsError('Erro ao carregar perguntas.');
  } finally {
    setQuestionsLoading(false);
  }
}

function renderQuestionRow(q) {
  const correct = (q.options || []).find(o => o.isCorrect);
  const correctText = correct ? correct.text : '—';
  const excerpt = (q.text || '').substring(0, 60);
  const more = (q.text || '').length > 60 ? '…' : '';
  return `<tr>
    <td class="col-count">${q.order}</td>
    <td>${q.points} pts</td>
    <td class="cell-name">${escapeHtml(excerpt)}${escapeHtml(more)}
      <span class="cell-sub">Correta: ${escapeHtml(correctText)}</span>
    </td>
    <td class="col-count">${(q.options || []).length}</td>
    <td class="cell-actions">
      <button type="button" class="btn-icon" data-action="edit-question" data-id="${q.id}" title="Editar">${ICON_SVG.edit}</button>
      <button type="button" class="btn-icon danger" data-action="delete-question" data-id="${q.id}" title="Excluir">${ICON_SVG.delete}</button>
    </td>
  </tr>`;
}

function setQuestionsLoading(loading) {
  const wrapper = $('questions-table-wrapper');
  const loadingState = $('questions-loading');
  const table = $('questions-table');
  const emptyState = $('questions-empty');

  if (loading) {
    wrapper.classList.add('is-loading');
    loadingState.classList.remove('hidden');
    if (table) table.classList.add('hidden');
    emptyState.classList.add('hidden');
  } else {
    wrapper.classList.remove('is-loading');
    loadingState.classList.add('hidden');
  }
}

function showQuestionsError(text) {
  const banner = $('questionnaire-questions-error');
  $('questions-error-msg').textContent = text;
  banner.classList.remove('hidden');
}

async function onDeleteQuestion(questionId) {
  if (!confirm('Excluir esta pergunta?')) return;
  try {
    await deleteQuestion(adminState.questionnaireId, questionId);
    await loadQuestionsView(adminState.questionnaireId);
  } catch (err) {
    console.error(err);
    showQuestionsError('Erro ao excluir pergunta.');
  }
}

function initQuestionsView() {
  const backBtn = $('questions-back-btn');
  if (backBtn) {
    backBtn.addEventListener('click', () => navigate('/questionnaires'));
  }

  const openNewQuestion = () => {
    adminState.questionReturnPath = `/questionnaires/${adminState.questionnaireId}/questions`;
    navigate(`/questionnaires/${adminState.questionnaireId}/questions/new`);
  };

  const addBtn = $('add-question-btn');
  if (addBtn) {
    addBtn.addEventListener('click', openNewQuestion);
  }

  const emptyAddBtn = $('empty-new-question-btn');
  if (emptyAddBtn) {
    emptyAddBtn.addEventListener('click', openNewQuestion);
  }

  const retryBtn = $('questions-retry-btn');
  if (retryBtn) {
    retryBtn.addEventListener('click', () => loadQuestionsView(adminState.questionnaireId));
  }

  const tbody = $('questions-table-body');
  if (tbody) {
    tbody.addEventListener('click', (event) => {
      const btn = event.target.closest('button[data-action]');
      if (!btn) return;
      const id = btn.dataset.id;
      if (btn.dataset.action === 'edit-question') {
        adminState.questionReturnPath = `/questionnaires/${adminState.questionnaireId}/questions`;
        navigate(`/questionnaires/${adminState.questionnaireId}/questions/${id}/edit`);
      } else if (btn.dataset.action === 'delete-question') {
        onDeleteQuestion(id);
      }
    });
  }
}
