// Função para converter CSV em array de objetos
function parseCSV(csv) {
    const lines = csv.trim().split('\n');
    const header = lines[0].split(',');
    const questions = [];

    for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',');
        const q = {
            points: Number(cols[0]),
            question: cols[1],
            options: [
                { text: cols[2], correct: cols[3] === 'true' },
                { text: cols[4], correct: cols[5] === 'true' },
                { text: cols[6], correct: cols[7] === 'true' },
                { text: cols[8], correct: cols[9] === 'true' }
            ]
        };
        questions.push(q);
    }
    return questions;
}

// Carrega o CSV e inicializa o jogo
function loadQuestionsAndStart() {
    fetch('perguntas.csv')
        .then(response => response.text())
        .then(csv => {
            window.questions = parseCSV(csv); // Torna global
            // Agora pode chamar a função que gera as telas, etc.
            // Exemplo: initGameUI();
        })
        .catch(err => {
            alert('Erro ao carregar perguntas!');
            console.error(err);
        });
}

// Chame isso ao carregar a página
window.addEventListener('DOMContentLoaded', loadQuestionsAndStart);