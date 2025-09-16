// ===============================
// AJUDAS / JOKERS
// ===============================

/**
 * Handler para clique em uma opção de resposta
 * Garante que só pode responder uma vez por pergunta
 */
function handleOptionClick() {
    if (respostaBloqueada || questionAnswered) return;
    questionAnswered = true;
    respostaBloqueada = true;
    const isCorrect = this.getAttribute('data-correct') === 'true';

    // Desabilita todas as opções
    this.parentElement.querySelectorAll('.option').forEach(opt => {
        opt.style.pointerEvents = 'none';
    });

    if (isCorrect) {
      // TOCA O SOM DE ACERTO
        const audio = document.getElementById('correto-audio');
        if (audio) {
            audio.currentTime = 0;
            audio.play();
        }
        this.classList.add('correct');
        currentScore = questions[currentQuestion].points;
        document.getElementById('current-score').textContent = currentScore;

        // Mensagem de acerto
        let nextValue = (questions[currentQuestion + 1]) ? questions[currentQuestion + 1].points : null;
        let html = `
      <div style="text-align:center">
        <h2>Parabéns! Você acertou!</h2>
        <p>Sua pontuação: <b>${currentScore} pontos</b></p>
        ${nextValue ? `<p>Próxima pergunta vale <b>${nextValue} pontos</b></p>` : `<p>Você completou todas as perguntas!</p>`}
      </div>
    `;
        openFeedbackModal(html, () => {
            if (currentQuestion < questions.length - 1) {
                showPoints(currentQuestion + 2);
                createConfetti();
            } else {
                finishGame(true);
            }
        });

    } else {
       
        this.classList.add('incorrect');
        this.parentElement.querySelector('[data-correct="true"]').classList.add('correct');
        // TOCA O SOM DE ERRO
        const audio = document.getElementById('fiasco-audio');
        if (audio) {
            audio.currentTime = 0;
            audio.play();
        }
        // Mensagem de erro
        let html = `
        <div style="text-align:center">
            <h2>Você errou!</h2>
            <p>Sua jornada no Show do Biblão acabou.</p>
            <p>Pontuação final: <b>${currentScore} pontos</b></p>
        </div>
        `;
        openFeedbackModal(html, () => finishGame(false));
    }
}

// AJUDAS
function setupAjudas(questionNumber) {
    // Pastores
    const pastoresBtn = document.getElementById(`ajuda-pastores-${questionNumber}`);
    if (pastoresBtn) {
        pastoresBtn.classList.toggle('ajuda-usada', jokersUsed.pastores);
        pastoresBtn.onclick = function () {
            if (jokersUsed.pastores) return;
            playAjudaAudio();
            jokersUsed.pastores = true;
            pastoresBtn.classList.add('ajuda-usada');
            openAjudaModal(
                '<div style="text-align:center"><img src="images/pastores.png" alt="Ajuda dos Pastores" style="max-width:100%;border-radius:8px;margin-bottom:10px;"> <br>Consulte os Pastores Presentes!</div>');
        };
    }
    // Classe
    const classeBtn = document.getElementById(`ajuda-classe-${questionNumber}`);
    if (classeBtn) {
        classeBtn.classList.toggle('ajuda-usada', jokersUsed.classe);
        classeBtn.onclick = function () {
            if (jokersUsed.classe) return;
            playAjudaAudio();
            jokersUsed.classe = true;
            classeBtn.classList.add('ajuda-usada');
            openAjudaModal('<div style="text-align:center"><img src="images/classe.jpg" alt="Classe" style="max-width:100%;border-radius:8px;margin-bottom:10px;"><br>Consulte a Classe!</div>');
        };
    }
    // Pulos
    const pulosBtn = document.getElementById(`ajuda-pulos-${questionNumber}`);
    if (pulosBtn) {
        pulosBtn.classList.toggle('ajuda-usada', jokersUsed.pulos >= 1);
        pulosBtn.onclick = function () {
            playPuloAudio();
            if (jokersUsed.pulos >= 1) {
                openAjudaModal('<div style="text-align:center"><b>Você já usou o seu pulo!</b></div>');
                return;
            }
            jokersUsed.pulos++;
            if (jokersUsed.pulos >= 1) pulosBtn.classList.add('ajuda-usada');
            // Ao pular, atribui a pontuação da pergunta atual (como se tivesse acertado)
            if (!respostaBloqueada) {
                currentScore = questions[currentQuestion].points;
                document.getElementById('current-score').textContent = currentScore;
                // Desabilita apenas as opções de resposta
                document.querySelectorAll(`#question-${questionNumber} .option`).forEach(opt => {
                    opt.style.pointerEvents = 'none';
                });
                respostaBloqueada = true;
            }
            openFeedbackModal(
                 `<div style="text-align:center">
                    <h2>Você pulou esta pergunta!</h2>
                    <p>Avançando para a próxima...</p>
                  </div>`,
                  function() {
                    // Código a ser executado ao fechar o modal
                    showPoints(questionNumber + 1); 
                    // Exemplo: avança para a próxima pergunta
                 }
          );
        };
    }
    // Cartas Misteriosas
    const cartasBtn = document.getElementById(`ajuda-cartas-${questionNumber}`);
if (cartasBtn) {
  cartasBtn.classList.toggle('ajuda-usada', jokersUsed.cartas);
  cartasBtn.onclick = function () {
    if (jokersUsed.cartas) return;
    jokersUsed.cartas = true;
    cartasBtn.classList.add('ajuda-usada');
    const carta = Math.floor(Math.random() * 4);
    const mensagens = [
      "Você não vai excluir nenhuma opção.",
      "Você vai excluir apenas uma resposta errada.",
      "Você vai excluir 2 respostas erradas.",
      "Você deu sorte! Excluiu todas as respostas erradas."
    ];

    // Mostra o GIF de embaralhando enquanto o áudio toca
    openFeedbackModal(`
      <div style="text-align:center">
        <img src="images/roda.webp" alt="Embaralhando cartas" style="max-width:100%;border-radius:8px;margin-bottom:10px;">
        <br><b>Embaralhando cartas...</b>
      </div>
    `);

    // Toca o áudio e só mostra a carta depois que terminar
    const audio = playCartasAudio();
    if (audio) {
      audio.onended = function () {
        openFeedbackModal(
          `<div style="text-align:center">
            <img src="images/carta${carta}.jpg" alt="Carta Misteriosa" style="max-width:100%;border-radius:8px;margin-bottom:10px;">
            <br>${mensagens[carta]}
          </div>`,
          () => {
            if (carta > 0) {
              const opcoes = document.querySelectorAll(`#question-${questionNumber} .option`);
              let erradas = Array.from(opcoes).filter(opt => opt.getAttribute('data-correct') === 'false');
              // Embaralha as erradas
              for (let i = erradas.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [erradas[i], erradas[j]] = [erradas[j], erradas[i]];
              }
              // Remove a quantidade de acordo com a carta
              for (let i = 0; i < carta && erradas.length > 0; i++) {
                erradas[i].style.opacity = '0.3';
                erradas[i].style.pointerEvents = 'none';
              }
            }
          }
        );
        audio.onended = null; // Limpa o handler
      };
    } else {
      // Se não houver áudio, mostra imediatamente
      openFeedbackModal(
        `<div style="text-align:center">
          <img src="images/carta${carta}.jpg" alt="Carta Misteriosa" style="max-width:100%;border-radius:8px;margin-bottom:10px;">
          <br>${mensagens[carta]}
        </div>`,
        () => {
          if (carta > 0) {
            const opcoes = document.querySelectorAll(`#question-${questionNumber} .option`);
            let erradas = Array.from(opcoes).filter(opt => opt.getAttribute('data-correct') === 'false');
            for (let i = erradas.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [erradas[i], erradas[j]] = [erradas[j], erradas[i]];
            }
            for (let i = 0; i < carta && erradas.length > 0; i++) {
              erradas[i].style.opacity = '0.3';
              erradas[i].style.pointerEvents = 'none';
            }
          }
        }
      );
    }
  };
}    
}

function playAjudaAudio() {
    const audio = document.getElementById('ajuda-audio');
    if (audio) {
        audio.currentTime = 0;
        audio.play();
    }
}

function playCartasAudio() {
    const audio = document.getElementById('cartas-audio');
    if (audio) {
        audio.currentTime = 0;
        audio.play();
    }
    return audio;
}

function playPuloAudio() {
    const audio = document.getElementById('pulo-audio');
    if (audio) {
        audio.currentTime = 0;
        audio.play();
    }
    return audio;
}