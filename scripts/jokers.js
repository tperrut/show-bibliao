// ===============================
// AJUDAS / JOKERS
// ===============================

/**
 * Handler para clique em uma opção de resposta
 * Garante que só pode responder uma vez por pergunta
 */
function handleOptionClick() {
    if (respostaBloqueada || questionAnswered) return;
    markAnswered();
    const isCorrect = this.getAttribute('data-correct') === 'true';

    // Desabilita todas as opções
    this.parentElement.querySelectorAll('.option').forEach(opt => {
        opt.style.pointerEvents = 'none';
    });
    // Desabilita os botões de ajuda
    desabilitarAjudas(currentQuestion + 1);

    if (isCorrect) {
        createConfetti();

        // TOCA O SOM DE ACERTO
        const certa_resposta = document.getElementById('certa-resposta-audio');
        if (certa_resposta) {
            certa_resposta.currentTime = 0;
            certa_resposta.play();
        }
        const audio = document.getElementById('aplausos-audio');
        if (audio) {
            audio.currentTime = 0;
            audio.play();
        }
        this.classList.add('correct');
        setScore(questions[currentQuestion].points);

        setTimeout(() => {
            if (currentQuestion < questions.length - 1) {
                showPoints(currentQuestion + 2);
            } else {
                finishGame(true);
            }
        }, 3000);
    } else {
        this.classList.add('incorrect');
        this.parentElement.querySelector('[data-correct="true"]').classList.add('correct');
        // TOCA O SOM DE ERRO
        const audio = document.getElementById('fiasco-audio');
        if (audio) {
            audio.currentTime = 0;
            audio.play();
        }
        
        // Finaliza o jogo após 3 segundos sem mostrar modal de erro
        setTimeout(() => {
            finishGame(false);
        }, 3000);
    }
}

// ===============================
// Funções de AJUDA/JOKERS
// ===============================

function setupAjudas(questionNumber) {
    setupAjudaPastores(questionNumber);
    setupAjudaClasse(questionNumber);
    setupAjudaPulos(questionNumber);
    setupAjudaCartas(questionNumber);
}

// Ajuda dos Pastores
function setupAjudaPastores(questionNumber) {
    const pastoresBtn = document.getElementById(`ajuda-pastores-${questionNumber}`);
    if (!pastoresBtn) return;
    pastoresBtn.classList.toggle('ajuda-usada', jokersUsed.pastores);
    
    const subtext = pastoresBtn.parentElement.querySelector('.ajuda-subtext');
    if (subtext) subtext.textContent = jokersUsed.pastores ? 'uso restante: 0' : 'uso restante: 1';

    pastoresBtn.onclick = function () {
        playAjudaAudio();
        if (!useJoker('pastores')) {
            openAjudaModal('<div style="text-align:center"><b>Você já usou a ajuda dos Pastores!</b></div>');
            return;
        }
        if (subtext) subtext.textContent = 'uso restante: 0';
        pastoresBtn.classList.add('ajuda-usada');
        // Aplica efeito visual na imagem
        const img = pastoresBtn.querySelector('img');
        if (img) img.classList.add('ajuda-usada');
        openAjudaModal(
            '<div style="text-align:center"><img src="images/pastores.png" alt="Ajuda dos Pastores" style="max-width:100%;border-radius:8px;margin-bottom:10px;"> <br>Consulte os Pastores Presentes!</div>'
        );
    };
}

// Ajuda da Classe
function setupAjudaClasse(questionNumber) {
    const classeBtn = document.getElementById(`ajuda-classe-${questionNumber}`);
    if (!classeBtn) return;
    classeBtn.classList.toggle('ajuda-usada', jokersUsed.classe);
    
    const subtext = classeBtn.parentElement.querySelector('.ajuda-subtext');
    if (subtext) subtext.textContent = jokersUsed.classe ? 'uso restante: 0' : 'uso restante: 1';

    classeBtn.onclick = function () {
        playAjudaAudio();
        if (!useJoker('classe')) {
            openAjudaModal('<div style="text-align:center"><b>Você já usou a ajuda da Classe!</b></div>');
            return;
        }
        if (subtext) subtext.textContent = 'uso restante: 0';
        classeBtn.classList.add('ajuda-usada');
        // Aplica efeito visual na imagem
        const img = classeBtn.querySelector('img');
        if (img) img.classList.add('ajuda-usada');
        openAjudaModal(
            '<div style="text-align:center"><img src="images/classe.jpg" alt="Classe" style="max-width:100%;border-radius:8px;margin-bottom:10px;"><br>Consulte a Classe!</div>'
        );
    };
}

// Ajuda do Pulo
function setupAjudaPulos(questionNumber) {
    const pulosBtn = document.getElementById(`ajuda-pulos-${questionNumber}`);
    if (!pulosBtn) return;
    pulosBtn.classList.toggle('ajuda-usada', jokersUsed.pulos >= 1);
    
    const subtext = pulosBtn.parentElement.querySelector('.ajuda-subtext');
    if (subtext) subtext.textContent = (jokersUsed.pulos >= 1) ? 'uso restante: 0' : 'uso restante: 1';

    pulosBtn.onclick = function () {
        playPuloAudio();
        if (!useJoker('pulos')) {
            openAjudaModal('<div style="text-align:center"><b>Você já usou o seu pulo!</b></div>');
            return;
        }
        if (subtext) subtext.textContent = 'uso restante: 0';
        if (jokersUsed.pulos >= 1) pulosBtn.classList.add('ajuda-usada');
        // Aplica efeito visual na imagem
        const img = pulosBtn.querySelector('img');
        if (img) img.classList.add('ajuda-usada');
        // Ao pular, atribui a pontuação da pergunta atual (como se tivesse acertado)
        if (!respostaBloqueada) {
            setScore(questions[currentQuestion].points);
            // Desabilita apenas as opções de resposta
            document.querySelectorAll(`#question-${questionNumber} .option`).forEach(opt => {
                opt.style.pointerEvents = 'none';
            });
            markAnswered();
        }
       setTimeout(() => {
        openFeedbackModal(
            `<div style="text-align:center">
                <h2>Você pulou esta pergunta!</h2>
                <p>Avançando para a próxima...</p>
            </div>`,
            function () {
                showPoints(questionNumber + 1);
            }
        );
       }, 3000);
    };
}

// Cartas Misteriosas
function setupAjudaCartas(questionNumber) {
    const cartasBtn = document.getElementById(`ajuda-cartas-${questionNumber}`);
    if (!cartasBtn) return;
    cartasBtn.classList.toggle('ajuda-usada', jokersUsed.cartas);
    
    const subtext = cartasBtn.parentElement.querySelector('.ajuda-subtext');
    if (subtext) subtext.textContent = jokersUsed.cartas ? 'uso restante: 0' : 'uso restante: 1';

    cartasBtn.onclick = function () {
        if (!useJoker('cartas')) {
            openAjudaModal('<div style="text-align:center"><b>Você já usou sua ajuda de Cartas!</b></div>');
            return;
        }
        if (subtext) subtext.textContent = 'uso restante: 0';
        cartasBtn.classList.add('ajuda-usada');
        // Aplica efeito visual na imagem
        const img = cartasBtn.querySelector('img');
        if (img) img.classList.add('ajuda-usada');
        const mensagens = [
            "Você não vai excluir nenhuma opção.",
            "Você vai excluir apenas uma resposta errada.",
            "Você vai excluir 2 respostas erradas.",
            "Você deu sorte! Excluiu todas as respostas erradas."
        ];
        sortearCartaMisteriosa(questionNumber, mensagens);
    };
}

// ===============================
// Lógica das Cartas Misteriosas
// ===============================
function sortearCartaMisteriosa(questionNumber, mensagens) {
    // Sorteia a carta (0 a 3)
    const carta = Math.floor(Math.random() * 4);

    // Mostra o GIF de embaralhando enquanto o áudio toca
    setTimeout(() => {

    openFeedbackModal(`
        <div style="text-align:center">
            <img src="images/roda.webp" alt="Embaralhando cartas" style="max-width:100%;border-radius:8px;margin-bottom:10px;">
            <br><b>Embaralhando cartas...</b>
        </div>
    `);
    }, 100);
    // Toca o áudio padrão das cartas, se houver (opcional)
    const audioCartas = playCartasAudio ? playCartasAudio() : null;

    // Função para tocar o áudio especial conforme a carta
    function tocarAudioEspecial() {
        if (carta === 0) {
            const fiasco = document.getElementById('fiasco-audio');
            if (fiasco) {
                fiasco.currentTime = 0;
                fiasco.play();
            }
        } else if (carta === 3) {
            const eeeeee_criancas = document.getElementById('eeeeee-criancas-audio');
            if (eeeeee_criancas) {
                eeeeee_criancas.currentTime = 0;
                eeeeee_criancas.play();
            }
        }
    }

    // Função para mostrar o modal e aplicar o efeito nas opções
    function mostrarCarta() {
        openFeedbackModal(
            `<div style="text-align:center">
                <img src="images/carta${carta}.jpg" alt="Carta Misteriosa" style="max-width:100%;border-radius:8px;margin-bottom:10px;">
                <br><span style="font-size: 1.5rem; font-weight: bold;">${mensagens[carta]}</span>
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
    }

    // Se houver áudio de cartas, espera terminar para tocar o especial e mostrar a carta
    if (audioCartas) {
        audioCartas.onended = function () {
            tocarAudioEspecial();
            mostrarCarta();
            audioCartas.onended = null; // Limpa o handler
        };
    } else {
        // Se não houver áudio de cartas, toca o especial e mostra imediatamente
        tocarAudioEspecial();
        mostrarCarta();
    }
}

// ===============================
// Áudios das ajudas
// ===============================
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

function desabilitarAjudas(questionNumber) {
  document.querySelectorAll(
    `#ajuda-pastores-${questionNumber}, #ajuda-classe-${questionNumber}, #ajuda-pulos-${questionNumber}, #ajuda-cartas-${questionNumber}`
  ).forEach(btn => {
    if (btn) {
      btn.classList.add('ajuda-usada');
      btn.style.pointerEvents = 'none';
      btn.style.opacity = '0.5';
    }
  });
}

function reabilitarAjudas(questionNumber) {
  document.querySelectorAll(
    `#ajuda-pastores-${questionNumber}, #ajuda-classe-${questionNumber}, #ajuda-pulos-${questionNumber}, #ajuda-cartas-${questionNumber}`
  ).forEach(btn => {
    if (btn && !btn.classList.contains('ajuda-usada')) {
      btn.style.pointerEvents = 'auto';
      btn.style.opacity = '1';
    }
  });
}