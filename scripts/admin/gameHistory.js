// ===============================
// HISTÓRICO DE JOGADAS — listagem e detalhe
// Estados da listagem: 'loading' | 'table' | 'empty' | 'error' (mesmo
// padrão de scripts/admin/questionnaires.js). Todo texto do documento
// (nome do jogador, classe, perguntas) é escapado na renderização.
// ===============================

// Estados mutuamente exclusivos da listagem.
function setHistoryState(state) {
  const wrapper = $('history-table-wrapper');
  const loadingState = $('history-loading');
  const table = $('history-table');
  const emptyState = $('history-empty');
  const errorBanner = $('history-error');

  if (wrapper) wrapper.classList.toggle('is-loading', state === 'loading');
  if (loadingState) loadingState.classList.toggle('hidden', state !== 'loading');
  if (table) table.classList.toggle('hidden', state !== 'table');
  if (emptyState) emptyState.classList.toggle('hidden', state !== 'empty');
  if (state !== 'error' && errorBanner) errorBanner.classList.add('hidden');
}

function showHistoryError(text) {
  const banner = $('history-error');
  const msg = $('history-error-msg');
  if (msg) msg.textContent = text;
  if (banner) banner.classList.remove('hidden');
}

// Aceita Timestamp do Firestore, ISO string ou Date; devolve '' se não houver.
function toDate(value) {
  if (!value) return null;
  if (typeof value.toDate === 'function') return value.toDate();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatDateTime(value) {
  const date = toDate(value);
  if (!date) return '—';
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatOutcome(outcome) {
  return outcome === 'win' ? 'Vitória' : 'Derrota';
}

// Rótulos das ajudas consumidas até o round (fonte única das tags/texto).
function jokerLabels(jokers) {
  const source = jokers && typeof jokers === 'object' ? jokers : {};
  const labels = [];
  if (source.pastores) labels.push('Pastores');
  if (source.classe) labels.push('Classe');
  if (source.cartas) labels.push('Cartas');
  if (Number(source.pulos) > 0) labels.push('Pulo');
  return labels;
}

// Versão em texto puro (usada nos metadados do detalhe e do card).
function describeJokers(jokers) {
  const labels = jokerLabels(jokers);
  return labels.length ? labels.join(', ') : '—';
}

// Versão em tags coloridas (coluna "Ajuda" da tabela de rounds).
function renderJokerTags(jokers) {
  const labels = jokerLabels(jokers);
  if (!labels.length) return '<span class="joker-tag is-none">—</span>';
  return labels
    .map(label => `<span class="joker-tag">${escapeHtml(label)}</span>`)
    .join('');
}

// Ajudas recém-consumidas NAQUELE round: o snapshot `round.jokers` acumula
// desde o início da partida, então a coluna destaca só o round em que a
// ajuda foi de fato pedida (diff com o round anterior).
function jokersUsedInRound(rounds, index) {
  const current = (rounds[index] && rounds[index].jokers) || {};
  const previous = (index > 0 && rounds[index - 1] && rounds[index - 1].jokers) || {};
  return {
    pastores: !!current.pastores && !previous.pastores,
    classe: !!current.classe && !previous.classe,
    cartas: !!current.cartas && !previous.cartas,
    pulos: Math.max(0, (Number(current.pulos) || 0) - (Number(previous.pulos) || 0))
  };
}

function renderHistoryRow(record) {
  return `<tr>
    <td class="col-date">${escapeHtml(formatDateTime(record.createdAt || record.playedAt))}</td>
    <td class="cell-name">${escapeHtml(record.playerName || '')}</td>
    <td>${escapeHtml(record.className || '—')}</td>
    <td>${escapeHtml(record.questionnaireName || 'Padrão')}</td>
    <td class="col-count">${escapeHtml(String(record.score))}</td>
    <td>${escapeHtml(formatOutcome(record.outcome))}</td>
    <td>${escapeHtml(record.savedByEmail || '—')}</td>
    <td class="cell-actions">
      <button type="button" class="btn-icon" data-action="view" data-id="${escapeHtml(record.id)}" title="Visualizar">${ICON_SVG.view}</button>
      <button type="button" class="btn-icon danger" data-action="delete" data-id="${escapeHtml(record.id)}" title="Excluir">${ICON_SVG.delete}</button>
    </td>
  </tr>`;
}

async function loadGameHistory() {
  setHistoryState('loading');
  try {
    const records = await listGameRecords();
    const tbody = $('history-table-body');

    if (!records || !records.length) {
      if (tbody) tbody.innerHTML = '';
      setHistoryState('empty');
      return;
    }

    if (tbody) tbody.innerHTML = records.map(renderHistoryRow).join('');
    setHistoryState('table');
  } catch (err) {
    console.error(err);
    setHistoryState('error');
    showHistoryError('Erro ao carregar o histórico de jogadas.');
  }
}

async function onDeleteGameRecord(id) {
  if (!confirm('Excluir este registro de partida? Esta ação não pode ser desfeita.')) return;
  try {
    await deleteGameRecord(id);
    await loadGameHistory();
  } catch (err) {
    console.error(err);
    setHistoryState('error');
    showHistoryError('Erro ao excluir o registro.');
  }
}

// ===============================
// DETALHE DA PARTIDA
// ===============================

// "Print" da pergunta decisiva: a tela da partida reconstruída a partir do
// snapshot estruturado gravado no documento.
function renderHistoryPrintCard(record) {
  const container = $('history-print-card');
  if (!container) return;

  const index = record.decisiveRoundIndex;
  const round = Number.isInteger(index) ? record.rounds[index] : null;

  if (!round) {
    container.innerHTML = '<p class="history-empty-note">Esta partida não tem pergunta decisiva registrada.</p>';
    return;
  }

  const letters = ['A', 'B', 'C', 'D'];
  const optionsHTML = round.options.map((option, i) => {
    const classes = ['history-option'];
    if (option.correct) classes.push('is-correct');
    if (i === round.chosenIndex) {
      classes.push('is-chosen');
      if (round.chosenCorrect === false) classes.push('is-wrong');
    }
    const marks = [];
    if (option.correct) marks.push('correta');
    if (i === round.chosenIndex) {
      marks.push('escolhida');
      if (round.chosenCorrect === false) marks.push('errada');
    }
    return `<div class="${classes.join(' ')}">
      <span class="history-option-letter">${letters[i] || '?'}</span>
      <span class="history-option-text">${escapeHtml(option.text || '')}</span>
      ${marks.length ? `<span class="history-option-tag">${escapeHtml(marks.join(' · '))}</span>` : ''}
    </div>`;
  }).join('');

  const header = round.skipped
    ? 'Pergunta pulada'
    : round.chosenCorrect
      ? 'Resposta correta'
      : 'Resposta errada — fim de jogo';

  container.innerHTML = `
    <div class="history-print-meta">
      <span class="history-badge">${escapeHtml(header)}</span>
      <span>Pergunta ${escapeHtml(String(round.order))}</span>
      <span>${escapeHtml(String(round.points))} pontos</span>
      <span>Ajuda usada: ${escapeHtml(describeJokers(round.jokers))}</span>
    </div>
    <div class="history-print-question">${escapeHtml(round.question || '')}</div>
    <div class="history-print-options">${optionsHTML}</div>
  `;
}

function renderHistoryRoundRow(rounds, index, decisiveIndex) {
  const round = rounds[index] || {};
  const answer = round.skipped
    ? '<span class="cell-sub">Pulada</span>'
    : `${escapeHtml(round.chosenText || '—')}${round.chosenCorrect === false ? ' <span class="history-wrong">(errada)</span>' : ''}`;
  const decisive = index === decisiveIndex
    ? ' <span class="history-badge">decisiva</span>'
    : '';
  return `<tr>
    <td class="col-count">${escapeHtml(String(round.order))}${decisive}</td>
    <td class="col-count">${escapeHtml(String(round.points))}</td>
    <td>${escapeHtml(round.question || '')}</td>
    <td>${answer}</td>
    <td>${renderJokerTags(jokersUsedInRound(rounds, index))}</td>
  </tr>`;
}

async function loadGameHistoryDetail(id) {
  const errorBanner = $('history-detail-error');
  const loadingState = $('history-detail-loading');
  const main = $('history-detail-main');

  if (errorBanner) errorBanner.classList.add('hidden');
  if (loadingState) loadingState.classList.remove('hidden');
  if (main) main.classList.add('hidden');

  try {
    const record = await getGameRecord(id);
    if (!record) {
      if (loadingState) loadingState.classList.add('hidden');
      const msg = $('history-detail-error-msg');
      if (msg) msg.textContent = 'Registro não encontrado.';
      if (errorBanner) errorBanner.classList.remove('hidden');
      return;
    }

    const title = $('history-detail-title');
    if (title) {
      title.textContent = `${record.playerName || 'Sem nome'} — ${formatOutcome(record.outcome)}`;
    }

    const meta = $('history-detail-meta');
    if (meta) {
      const lines = [
        `Pontuação final: ${record.score} pontos`,
        `Classe: ${record.className || '—'}`,
        `Questionário: ${record.questionnaireName || 'Padrão'}`,
        `Partida encerrada em: ${formatDateTime(record.playedAt)}`,
        `Salvo em: ${formatDateTime(record.createdAt)} por ${record.savedByEmail || '—'}`,
        `Ajuda usada na partida: ${describeJokers(record.jokersUsed)}`
      ];
      meta.textContent = lines.join(' · ');
    }

    renderHistoryPrintCard(record);

    const tbody = $('history-rounds-body');
    if (tbody) {
      tbody.innerHTML = record.rounds
        .map((round, index) => renderHistoryRoundRow(record.rounds, index, record.decisiveRoundIndex))
        .join('');
    }

    // O id vem da rota (parseAdminRoute) — sem holder paralelo.
    if (loadingState) loadingState.classList.add('hidden');
    if (main) main.classList.remove('hidden');
  } catch (err) {
    console.error(err);
    if (loadingState) loadingState.classList.add('hidden');
    const msg = $('history-detail-error-msg');
    if (msg) msg.textContent = 'Erro ao carregar o registro da partida.';
    if (errorBanner) errorBanner.classList.remove('hidden');
  }
}

// ===============================
// BINDING DAS VIEWS
// ===============================

function initGameHistoryViews() {
  const retryBtn = $('history-retry-btn');
  if (retryBtn) retryBtn.addEventListener('click', () => loadGameHistory());

  const tbody = $('history-table-body');
  if (tbody) {
    tbody.addEventListener('click', (event) => {
      const btn = event.target.closest('button[data-action]');
      if (!btn) return;
      const id = btn.dataset.id;
      if (btn.dataset.action === 'view') {
        navigate(`/historico/${id}`);
      } else if (btn.dataset.action === 'delete') {
        onDeleteGameRecord(id);
      }
    });
  }

  const detailRetry = $('history-detail-retry-btn');
  if (detailRetry) {
    detailRetry.addEventListener('click', () => {
      const ctx = parseAdminRoute();
      loadGameHistoryDetail(ctx.recordId);
    });
  }

  const backBtn = $('history-detail-back-btn');
  if (backBtn) backBtn.addEventListener('click', () => navigate('/historico'));

  const deleteBtn = $('history-detail-delete-btn');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', async () => {
      const ctx = parseAdminRoute();
      if (!ctx.recordId) return;
      if (!confirm('Excluir este registro de partida? Esta ação não pode ser desfeita.')) return;
      try {
        await deleteGameRecord(ctx.recordId);
        navigate('/historico');
      } catch (err) {
        console.error(err);
        const msg = $('history-detail-error-msg');
        if (msg) msg.textContent = 'Erro ao excluir o registro.';
        const banner = $('history-detail-error');
        if (banner) banner.classList.remove('hidden');
      }
    });
  }
}
