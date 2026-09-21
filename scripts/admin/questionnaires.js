// ===============================
// LISTAGEM DE QUESTIONÁRIOS
// ===============================

// Estados mutuamente exclusivos da listagem: 'loading' | 'table' | 'empty' | 'error'
function setQuestionnairesState(state) {
  const wrapper = $('questionnaires-table-wrapper');
  const loadingState = $('questionnaires-loading');
  const table = $('questionnaires-table');
  const emptyState = $('questionnaires-empty');
  const errorBanner = $('questionnaire-error');

  wrapper.classList.toggle('is-loading', state === 'loading');
  loadingState.classList.toggle('hidden', state !== 'loading');
  table.classList.toggle('hidden', state !== 'table');
  emptyState.classList.toggle('hidden', state !== 'empty');
  if (state !== 'error') {
    errorBanner.classList.add('hidden');
  }
}

function showQuestionnairesError(text) {
  const banner = $('questionnaire-error');
  $('questionnaire-error-msg').textContent = text;
  banner.classList.remove('hidden');
}

function renderQuestionnaireBadge(qn) {
  const count = qn.questions_count;
  if (count === null || count === undefined) {
    return '<span class="count-badge zero" title="Contagem indisponível">?</span>';
  }
  if (count === 0) {
    return '<span class="count-badge zero" title="Sem perguntas — questionário incompleto">0</span>';
  }
  return `<span class="count-badge" title="${count} pergunta(s)">${count}</span>`;
}

function renderQuestionnaireRow(qn) {
  const description = qn.description
    ? `<span class="cell-sub">${escapeHtml(qn.description)}</span>`
    : '';
  return `<tr>
    <td class="cell-name">${escapeHtml(qn.name || '')}${description}</td>
    <td class="col-count">${renderQuestionnaireBadge(qn)}</td>
    <td class="cell-actions">
      <button type="button" class="btn-icon" data-action="view" data-id="${qn.id}" title="Visualizar">${ICON_SVG.view}</button>
      <button type="button" class="btn-icon" data-action="edit" data-id="${qn.id}" title="Editar">${ICON_SVG.edit}</button>
      <button type="button" class="btn-icon danger" data-action="delete" data-id="${qn.id}" title="Excluir">${ICON_SVG.delete}</button>
    </td>
  </tr>`;
}

async function loadQuestionnaires() {
  setQuestionnairesState('loading');
  try {
    const questionnaires = await listQuestionnaires();
    const tbody = $('questionnaires-table-body');

    if (!questionnaires || !questionnaires.length) {
      tbody.innerHTML = '';
      setQuestionnairesState('empty');
      return;
    }

    tbody.innerHTML = questionnaires.map(renderQuestionnaireRow).join('');
    setQuestionnairesState('table');
  } catch (err) {
    console.error(err);
    setQuestionnairesState('error');
    showQuestionnairesError('Erro ao carregar questionários.');
  }
}

async function onDeleteQuestionnaire(id) {
  if (!confirm('Excluir este questionário e todas as suas perguntas?')) return;
  try {
    await deleteQuestionnaire(id);
    await loadQuestionnaires();
  } catch (err) {
    console.error(err);
    showQuestionnairesError('Erro ao excluir questionário.');
  }
}

function initQuestionnairesView() {
  const addBtn = $('add-questionnaire-btn');
  if (addBtn) {
    addBtn.addEventListener('click', () => navigate('/questionnaires/new'));
  }

  const emptyAddBtn = $('empty-new-questionnaire-btn');
  if (emptyAddBtn) {
    emptyAddBtn.addEventListener('click', () => navigate('/questionnaires/new'));
  }

  const retryBtn = $('questionnaires-retry-btn');
  if (retryBtn) {
    retryBtn.addEventListener('click', () => loadQuestionnaires());
  }

  const tbody = $('questionnaires-table-body');
  if (tbody) {
    tbody.addEventListener('click', (event) => {
      const btn = event.target.closest('button[data-action]');
      if (!btn) return;
      const id = btn.dataset.id;
      const action = btn.dataset.action;
      if (action === 'view') {
        navigate(`/questionnaires/${id}/view`);
      } else if (action === 'edit') {
        navigate(`/questionnaires/${id}/edit`);
      } else if (action === 'delete') {
        onDeleteQuestionnaire(id);
      }
    });
  }
}
