// ===============================
// ESCAPE DE HTML — util compartilhado (jogo + admin)
// Padrão único de sanitização para interpolações em innerHTML.
// ===============================

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
