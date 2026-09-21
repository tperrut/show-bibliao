// ===============================
// VISUALIZAÇÃO DO QUESTIONÁRIO (detail)
// ===============================

let detailQuestionnaireId = null;

function setDetailState(state) {
  $('detail-loading').classList.toggle('hidden', state !== 'loading');
  $('detail-main').classList.toggle('hidden', state !== 'ready');
  if (state !== 'error') {
    $('detail-error').classList.add('hidden');
  }
}

function showDetailError(text) {
  $('detail-error-msg').textContent = text;
  $('detail-error').classList.remove('hidden');
}

function renderDetailQuestionCard(q) {
  const optionsHtml = (q.options || [])
    .map((opt, index) => {
      const letter = String.fromCharCode(65 + index);
      const correctClass = opt.isCorrect ? ' correct' : '';
      const tag = opt.isCorrect ? '<span class="correct-tag">Correta</span>' : '';
      return `<li class="detail-option${correctClass}">
        <span class="option-letter">${letter}</span>
        <span class="option-text">${escapeHtml(opt.text)}</span>
        ${tag}
      </li>`;
    })
    .join('');

  return `<article class="detail-question">
    <header class="detail-question-header">
      <span class="detail-order">#${q.order}</span>
      <span class="detail-points">${q.points} pts</span>
    </header>
    <p class="detail-text">${escapeHtml(q.text || '')}</p>
    <ul class="detail-options">${optionsHtml}</ul>
  </article>`;
}

function renderQuestionnaireDetail(data) {
  $('detail-name').textContent = data.name || 'Sem nome';

  const count = (data.questions || []).length;
  const desc = data.description ? `${data.description} · ` : '';
  $('detail-meta').textContent = `${desc}${questionsProgressText(count)}`;

  const emptyState = $('detail-empty');
  const list = $('detail-questions');

  if (!count) {
    list.innerHTML = '';
    emptyState.classList.remove('hidden');
  } else {
    emptyState.classList.add('hidden');
    list.innerHTML = data.questions.map(renderDetailQuestionCard).join('');
  }
}

async function loadQuestionnaireDetail(id) {
  detailQuestionnaireId = id;
  adminState.questionnaireId = id;
  $('detail-error').classList.add('hidden');
  setDetailState('loading');

  try {
    const data = await getQuestionnaireWithQuestions(id);
    if (!data) {
      navigate('/questionnaires');
      return;
    }
    renderQuestionnaireDetail(data);
    setDetailState('ready');
  } catch (err) {
    console.error(err);
    setDetailState('error');
    showDetailError('Erro ao carregar questionário.');
  }
}

function initQuestionnaireDetailView() {
  const backBtn = $('detail-back-btn');
  if (backBtn) {
    backBtn.addEventListener('click', () => navigate('/questionnaires'));
  }

  const editBtn = $('detail-edit-btn');
  if (editBtn) {
    editBtn.addEventListener('click', () => {
      navigate(`/questionnaires/${detailQuestionnaireId}/edit`);
    });
  }

  const goAddQuestion = () => {
    adminState.questionReturnPath = `/questionnaires/${detailQuestionnaireId}/view`;
    navigate(`/questionnaires/${detailQuestionnaireId}/questions/new`);
  };

  const addBtn = $('detail-add-question-btn');
  if (addBtn) addBtn.addEventListener('click', goAddQuestion);

  const emptyAddBtn = $('detail-empty-new-btn');
  if (emptyAddBtn) emptyAddBtn.addEventListener('click', goAddQuestion);

  const retryBtn = $('detail-retry-btn');
  if (retryBtn) {
    retryBtn.addEventListener('click', () => loadQuestionnaireDetail(detailQuestionnaireId));
  }
}
