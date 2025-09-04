// ===============================
// AJUDAS / JOKERS
// ===============================

/**
 * Handler para clique em uma opção de resposta
 * Garante que só pode responder uma vez por pergunta
 */
function handleOptionClick() {
    if (questionAnswered) return;
    questionAnswered = true;
    const isCorrect = this.getAttribute('data-correct') === 'true';

    if (isCorrect) {
        // Marca a opção correta de verde
        this.classList.add('correct');
        // NOVA REGRA: Substitui a pontuação pelo valor da pergunta atual
        currentScore = questions[currentQuestion].points;
        document.getElementById('current-score').textContent = currentScore;
        setTimeout(() => {
            if (currentQuestion < questions.length - 1) {
                showPoints(currentQuestion + 2);
                createConfetti();
            } else {
                finishGame();
            }
        }, 1000);
    } else {
        // Marca a opção clicada de vermelho
        this.classList.add('incorrect');
        // Marca a opção correta de verde
        this.parentElement.querySelector('[data-correct="true"]').classList.add('correct');
        setTimeout(finishGame, 1000);
    }

    // Desabilita todas as opções
    this.parentElement.querySelectorAll('.option').forEach(opt => {
        opt.style.pointerEvents = 'none';
    });
}

// AJUDAS
function setupAjudas(questionNumber) {
    // Pastores
    const pastoresBtn = document.getElementById(`ajuda-pastores-${questionNumber}`);
    if (pastoresBtn) {
        pastoresBtn.classList.toggle('ajuda-usada', jokersUsed.pastores);
        pastoresBtn.onclick = function() {
            if (jokersUsed.pastores) return;
            jokersUsed.pastores = true;
            pastoresBtn.classList.add('ajuda-usada');
            openAjudaModal('Consulte os Pastores Presentes');
        };
    }
    // 50% de chance
    const cinquentaBtn = document.getElementById(`ajuda-cinquenta-${questionNumber}`);
    if (cinquentaBtn) {
        cinquentaBtn.classList.toggle('ajuda-usada', jokersUsed.cinquenta);
        cinquentaBtn.onclick = function() {
            if (jokersUsed.cinquenta) return;
            jokersUsed.cinquenta = true;
            cinquentaBtn.classList.add('ajuda-usada');
            // Remove duas erradas
            const opcoes = document.querySelectorAll(`#question-${questionNumber} .option`);
            let erradas = Array.from(opcoes).filter(opt => opt.getAttribute('data-correct') === 'false');
            // Remove duas aleatórias
            for (let i = 0; i < 2 && erradas.length > 0; i++) {
                let idx = Math.floor(Math.random() * erradas.length);
                erradas[idx].style.opacity = '0.3';
                erradas[idx].style.pointerEvents = 'none';
                erradas.splice(idx, 1);
            }
        };
    }
    // Pulos
const pulosBtn = document.getElementById(`ajuda-pulos-${questionNumber}`);
if (pulosBtn) {
    pulosBtn.classList.toggle('ajuda-usada', jokersUsed.pulos >= 2);
    pulosBtn.querySelector('.pulos-restantes').textContent = `(${2-jokersUsed.pulos})`;
    pulosBtn.onclick = function() {
        if (jokersUsed.pulos >= 2) {
            alert('Você já usou todos os pulos!');
            return;
        }
        jokersUsed.pulos++;
        pulosBtn.querySelector('.pulos-restantes').textContent = `(${2-jokersUsed.pulos})`;
        if (jokersUsed.pulos >= 2) pulosBtn.classList.add('ajuda-usada');
        // NOVA REGRA: Ao pular, atribui a pontuação da pergunta atual (como se tivesse acertado)
        if (!questionAnswered) {
            currentScore = questions[currentQuestion].points;
            document.getElementById('current-score').textContent = currentScore;
            questionAnswered = true;
        }
        // Avança para a próxima pergunta
        showPoints(currentQuestion + 2);
    };
}
}