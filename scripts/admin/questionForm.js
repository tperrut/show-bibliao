// ===============================
// FORMULÁRIO DE PERGUNTA (criar / editar) — vista própria
// ===============================

let editingQuestionId = null;
let formQuestionnaireId = null;

function renderOptionRow(text = '', isCorrect = false, index = 0) {
  const row = document.createElement('div');
  row.className = 'option-row';
  row.innerHTML = `
    <input type="radio" class="option-correct" name="question-correct-option"
           title="Marcar como correta" ${isCorrect ? 'checked' : ''}>
    <input type="text" class="option-text" placeholder="Texto da alternativa ${index + 1}"
           value="${escapeHtml(text)}">
    <button type="button" class="btn-icon danger btn-remove-option" title="Remover alternativa">&#10005;</button>
  `;

  row.querySelector('.btn-remove-option').addEventListener('click', () => {
    const container = $('question-options-container');
    if (container.querySelectorAll('.option-row').length <= 2) {
      showMessage('question-form-error', 'A pergunta precisa de pelo menos 2 alternativas.', 'error');
      return;
    }
    row.remove();
    normalizeOptionIndexes();
  });

  return row;
}

function normalizeOptionIndexes() {
  const rows = $('question-options-container').querySelectorAll('.option-row');
  rows.forEach((row, i) => {
    const input = row.querySelector('.option-text');
    input.placeholder = `Texto da alternativa ${i + 1}`;
  });
}

function updatePointsDisplay() {
  const order = $('q-order').value;
  $('q-points-display').value = `${pointsForOrder(order)} pts`;
}

function collectOptions() {
  const rows = Array.from($('question-options-container').querySelectorAll('.option-row'));
  return rows.map(row => ({
    text: row.querySelector('.option-text').value.trim(),
    isCorrect: row.querySelector('.option-correct').checked
  }));
}

async function openQuestionForm(questionnaireId, questionId) {
  formQuestionnaireId = questionnaireId;
  editingQuestionId = questionId || null;
  adminState.questionnaireId = questionnaireId;
  adminState.questionId = questionId || null;

  hideMessage('question-form-error');
  $('form-title-question').textContent = questionId ? 'Editar pergunta' : 'Nova pergunta';
  $('question-form-back-link').setAttribute('href', questionReturnPath());
  $('q-text').value = '';
  $('q-order').value = '1';
  updatePointsDisplay();

  const container = $('question-options-container');
  container.innerHTML = '';

  if (!questionId) {
    for (let i = 0; i < 4; i++) {
      container.appendChild(renderOptionRow('', i === 0, i));
    }
    // Sugere a próxima ordem livre (criação incremental: 1, 2, 3… 15).
    try {
      const existing = await listQuestionsForAdmin(questionnaireId);
      if (existing.length >= QUESTIONS_TARGET) {
        showMessage('question-form-error', `Este questionário já tem ${QUESTIONS_TARGET} perguntas (limite atingido).`, 'error');
      }
      const nextOrder = Math.min(existing.length + 1, QUESTIONS_TARGET);
      $('q-order').value = String(nextOrder);
      updatePointsDisplay();
    } catch (err) {
      console.error(err);
    }
    $('q-text').focus();
    return;
  }

  try {
    const questions = await listQuestionsForAdmin(questionnaireId);
    const question = questions.find(q => q.id === questionId);
    if (!question) {
      navigate(questionReturnPath());
      return;
    }

    $('q-text').value = question.text || '';
    $('q-order').value = String(question.order || 1);
    updatePointsDisplay();

    (question.options || []).forEach((opt, i) => {
      container.appendChild(renderOptionRow(opt.text, !!opt.isCorrect, i));
    });
    if (!container.querySelector('.option-row')) {
      container.appendChild(renderOptionRow('', true, 0));
      container.appendChild(renderOptionRow('', false, 1));
    }
  } catch (err) {
    console.error(err);
    showMessage('question-form-error', 'Erro ao carregar pergunta.', 'error');
  }
}

async function onSaveQuestion() {
  const text = $('q-text').value.trim();
  const order = Number($('q-order').value);
  const options = collectOptions();

  if (!text) {
    showMessage('question-form-error', 'Informe o enunciado da pergunta.', 'error');
    return;
  }
  if (!Number.isInteger(order) || order < 1 || order > QUESTIONS_TARGET) {
    showMessage('question-form-error', `A ordem deve estar entre 1 e ${QUESTIONS_TARGET}.`, 'error');
    return;
  }

  if (!editingQuestionId) {
    try {
      const existing = await listQuestionsForAdmin(formQuestionnaireId);
      if (existing.length >= QUESTIONS_TARGET) {
        showMessage('question-form-error', `Limite de ${QUESTIONS_TARGET} perguntas atingido neste questionário.`, 'error');
        return;
      }
    } catch (err) {
      console.error(err);
    }
  }
  if (options.some(opt => !opt.text)) {
    showMessage('question-form-error', 'Todas as alternativas precisam de texto.', 'error');
    return;
  }
  const correctCount = options.filter(opt => opt.isCorrect).length;
  if (correctCount !== 1) {
    showMessage('question-form-error', 'Marque exatamente uma alternativa como correta.', 'error');
    return;
  }

  const points = pointsForOrder(order);
  const saveBtn = $('save-question-btn');
  saveBtn.disabled = true;
  try {
    if (editingQuestionId) {
      await updateQuestion(formQuestionnaireId, editingQuestionId, { points, text, order, options });
    } else {
      await createQuestion(formQuestionnaireId, { points, text, order, options });
    }
    navigate(adminState.questionReturnPath || `/questionnaires/${formQuestionnaireId}/questions`);
  } catch (err) {
    console.error(err);
    showMessage('question-form-error', 'Erro ao salvar pergunta.', 'error');
  } finally {
    saveBtn.disabled = false;
  }
}

function questionReturnPath() {
  return adminState.questionReturnPath || `/questionnaires/${formQuestionnaireId}/questions`;
}

function initQuestionFormView() {
  // Sincroniza limites do campo de ordem com QUESTIONS_TARGET (gameRules).
  const orderInputInit = $('q-order');
  const orderLabelInit = document.querySelector('label[for="q-order"]');
  if (orderInputInit) {
    orderInputInit.min = '1';
    orderInputInit.max = String(QUESTIONS_TARGET);
  }
  if (orderLabelInit) {
    orderLabelInit.textContent = `Ordem (1 a ${QUESTIONS_TARGET})`;
  }

  const saveBtn = $('save-question-btn');
  if (saveBtn) {
    saveBtn.addEventListener('click', onSaveQuestion);
  }

  const cancelBtn = $('cancel-question-btn');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      navigate(questionReturnPath());
    });
  }

  const addOptionBtn = $('add-question-option-btn');
  if (addOptionBtn) {
    addOptionBtn.addEventListener('click', () => {
      const container = $('question-options-container');
      const index = container.querySelectorAll('.option-row').length;
      container.appendChild(renderOptionRow('', false, index));
      normalizeOptionIndexes();
    });
  }

  const orderInput = $('q-order');
  if (orderInput) {
    orderInput.addEventListener('input', updatePointsDisplay);
    orderInput.addEventListener('change', updatePointsDisplay);
  }
}
