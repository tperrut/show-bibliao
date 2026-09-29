// ===============================
// UTILIDADES VISUAIS
// ===============================

/**
 * Cria animação de confetes na tela final
 */
function createConfetti() {
  const container = document.querySelector('.container');
  document.querySelectorAll('.confetti').forEach(confetti => confetti.remove());
  for (let i = 0; i < 50; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.style.left = Math.random() * 100 + '%';
    confetti.style.top = Math.random() * 100 + '%';
    confetti.style.backgroundColor = getRandomColor();
    confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
    container.appendChild(confetti);
  }
}

/**
 * Retorna uma cor aleatória para os confetes
 */
function getRandomColor() {
  const colors = ['#ffce00', '#2ecc71', '#e74c3c', '#3498db', '#9b59b6', '#1abc9c'];
  return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * Remove todos os confetes da tela
 */
function removeConfetti() {
  document.querySelectorAll('.confetti').forEach(confetti => confetti.remove());
}