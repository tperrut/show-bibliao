// ===============================
// MODAL — interface única
// Um único registro de ESC/clique-fora/X por abertura; removido no close.
// ===============================

// Modal aberto no momento (null quando nenhum).
let modalElAtual = null;
let modalOnCloseAtual = null;
let modalRegistro = null;

/**
 * Abre um modal.
 * @param {string|null} html - conteúdo a injetar em #ajuda-modal-text
 *   (null mantém o conteúdo estático do modal, ex.: regras/questionários)
 * @param {object} [options]
 * @param {string} [options.modalId='ajuda-modal'] - id do elemento modal
 * @param {Function} [options.onClose] - chamado após o modal fechar
 */
function openModal(html, options = {}) {
  const modalId = options.modalId || 'ajuda-modal';
  const onClose = typeof options.onClose === 'function' ? options.onClose : null;

  // Um modal por vez: fecha o anterior sem disparar o onClose dele
  // (o novo open substitui o antigo, ex.: 2º feedback das cartas).
  if (modalElAtual) {
    encerrarModal(false);
  }

  const el = document.getElementById(modalId);
  if (!el) return;

  if (html != null) {
    const textEl = document.getElementById('ajuda-modal-text');
    if (textEl) textEl.innerHTML = html;
  }

  const closeBtn = el.querySelector('.close-modal');

  function onOverlayClick(e) {
    if (e.target === el) closeModal();
  }
  function onKey(e) {
    if (e.key === 'Escape') closeModal();
  }
  function onCloseClick() {
    closeModal();
  }

  if (closeBtn) closeBtn.addEventListener('click', onCloseClick);
  el.addEventListener('click', onOverlayClick);
  document.addEventListener('keydown', onKey);

  el.classList.add('active');
  modalElAtual = el;
  modalOnCloseAtual = onClose;
  modalRegistro = { closeBtn, onOverlayClick, onKey, onCloseClick };
}

/**
 * Fecha o modal aberto e dispara o onClose registrado.
 */
function closeModal() {
  encerrarModal(true);
}

// Remove o modal ativo, desregistra os listeners e (opcionalmente) roda onClose.
function encerrarModal(dispararOnClose) {
  if (!modalElAtual) return;

  const el = modalElAtual;
  const onClose = modalOnCloseAtual;
  const reg = modalRegistro;

  el.classList.remove('active');
  if (reg) {
    if (reg.closeBtn) reg.closeBtn.removeEventListener('click', reg.onCloseClick);
    el.removeEventListener('click', reg.onOverlayClick);
    document.removeEventListener('keydown', reg.onKey);
  }

  modalElAtual = null;
  modalOnCloseAtual = null;
  modalRegistro = null;

  if (dispararOnClose && onClose) onClose();
}
