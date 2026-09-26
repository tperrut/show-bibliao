// ===============================
// IMPORTAÇÃO DOS QUESTIONÁRIOS DE ATOS — EDIÇÃO 2026
// Uso: npm run seed:2026
// Lê perguntas/questionario[1-4].js e cria um questionário por arquivo,
// todos com year=2026 e questions_count denormalizado.
// Idempotente: pula arquivos que já tenham questionário com o mesmo nome e ano.
// Requer: credenciais de service account (Admin SDK) em ../../serviceAccountKey.json
// (pasta pai do repositório — fora da raiz servida) ou GOOGLE_APPLICATION_CREDENTIALS.
// ===============================

const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

const PERGUNTAS_DIR = path.join(__dirname, '..', 'perguntas');
const SERVICE_ACCOUNT = process.env.GOOGLE_APPLICATION_CREDENTIALS ||
  path.join(__dirname, '..', '..', 'serviceAccountKey.json');

const YEAR = 2026;

// Arquivos de perguntas e nomes exibidos dos questionários de 2026.
const QUESTIONNAIRE_MAP = {
  'perguntas_questionario1.js': 'Atos 2026 - Questionário 1',
  'perguntas_questionario2.js': 'Atos 2026 - Questionário 2',
  'perguntas_questionario3.js': 'Atos 2026 - Questionário 3',
  'perguntas_questionario4.js': 'Atos 2026 - Questionário 4'
};

// Lê um arquivo de perguntas (`var questions = [...]`) e retorna o array.
function parseQuestionsFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const body = content.replace(/^\s*var\s+questions\s*=\s*/, '').replace(/;\s*$/, '');
  // eslint-disable-next-line no-new-func
  return new Function('return (' + body + ')')();
}

// Valida o questionário inteiro antes de gravar; lança erro com contexto.
function validateQuestions(name, questions) {
  if (!Array.isArray(questions) || questions.length !== 15) {
    throw new Error(`${name}: esperadas 15 perguntas, encontradas ${questions ? questions.length : 0}.`);
  }
  questions.forEach((q, i) => {
    const num = `pergunta ${i + 1}`;
    if (!q.question || typeof q.question !== 'string') {
      throw new Error(`${name}, ${num}: texto ausente.`);
    }
    if (!Array.isArray(q.options) || q.options.length < 3 || q.options.length > 4) {
      throw new Error(`${name}, ${num}: esperadas 3 ou 4 opções, encontradas ${q.options ? q.options.length : 0}.`);
    }
    const corretas = q.options.filter(opt => opt.correct).length;
    if (corretas !== 1) {
      throw new Error(`${name}, ${num}: esperada exatamente 1 opção correta, encontradas ${corretas}.`);
    }
  });
}

async function importQuestionarios() {
  if (!fs.existsSync(SERVICE_ACCOUNT)) {
    throw new Error(
      `Credenciais de service account não encontradas em ${SERVICE_ACCOUNT}. ` +
      'Baixe-as no Firebase Console e coloque em ../../serviceAccountKey.json (pasta pai do repositório — fora do deploy).'
    );
  }

  admin.initializeApp({
    credential: admin.credential.cert(SERVICE_ACCOUNT)
  });
  const db = admin.firestore();

  for (const [file, name] of Object.entries(QUESTIONNAIRE_MAP)) {
    const filePath = path.join(PERGUNTAS_DIR, file);
    if (!fs.existsSync(filePath)) {
      console.warn(`Arquivo não encontrado, pulando: ${file}`);
      continue;
    }

    // Idempotência: ignora arquivos que já tenham questionário com o mesmo nome e ano.
    const existentes = await db.collection('questionnaires')
      .where('name', '==', name)
      .where('year', '==', YEAR)
      .get();
    if (!existentes.empty) {
      console.log(`= ${name}: já importado (${existentes.size} ocorrência(s)), pulando.`);
      continue;
    }

    const questions = parseQuestionsFile(filePath);
    validateQuestions(name, questions);

    // Cria o questionário já com a contagem denormalizada
    const qnRef = await db.collection('questionnaires').add({
      name,
      description: '',
      year: YEAR,
      questions_count: questions.length,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Cria as perguntas na subcoleção
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      await qnRef.collection('questions').add({
        points: Number(q.points),
        text: q.question,
        order: i + 1,
        options: q.options.map((opt, idx) => ({
          text: opt.text,
          isCorrect: !!opt.correct,
          position: idx
        })),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    console.log(`✔ ${name}: ${questions.length} perguntas importadas (id=${qnRef.id})`);
  }

  console.log('Importação 2026 concluída.');
}

importQuestionarios().catch(err => {
  console.error('Erro na importação 2026:', err);
  process.exit(1);
});
