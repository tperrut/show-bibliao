// ===============================
// SEED / IMPORTAÇÃO DAS PERGUNTAS EXISTENTES
// Uso: node scripts/importSeed.js
// Requer: credenciais de service account (Admin SDK) em ../serviceAccountKey.json
// (pasta pai do repositório — fora da raiz servida) ou GOOGLE_APPLICATION_CREDENTIALS.
// ===============================

const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

const PERGUNTAS_DIR = path.join(__dirname, '..', 'perguntas');
const SERVICE_ACCOUNT = process.env.GOOGLE_APPLICATION_CREDENTIALS ||
  path.join(__dirname, '..', '..', 'serviceAccountKey.json');

// Nomes exibidos dos questionários (mesma ordem/mapeamento do antigo availableQuestionnaires).
const QUESTIONNAIRE_MAP = {
  'perguntas_adolescentes_dificult.js': 'Adolescentes - Difícil',
  'perguntas_adolescentes_easy.js': 'Adolescentes - Fácil',
  'perguntas_embaralhadas.js': 'Embaralhadas',
  'perguntas_homens.js': 'Homens',
  'perguntas_jovens.js': 'Jovens',
  'perguntas_mulheres.js': 'Mulheres',
  'perguntas_pre_adolescentes.js': 'Pré-Adolescentes',
  'perguntas_test.js': 'Teste'
};

// Lê um arquivo de perguntas (`var questions = [...]`) e retorna o array.
function parseQuestionsFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const body = content.replace(/^\s*var\s+questions\s*=\s*/, '').replace(/;\s*$/, '');
  // eslint-disable-next-line no-new-func
  return new Function('return (' + body + ')')();
}

async function seed() {
  if (!fs.existsSync(SERVICE_ACCOUNT)) {
    throw new Error(
      `Credenciais de service account não encontradas em ${SERVICE_ACCOUNT}. ` +
      'Baixe-as no Firebase Console e coloque em ../serviceAccountKey.json (pasta pai do repositório — fora do deploy).'
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

    const questions = parseQuestionsFile(filePath);
    // Cria o questionário
    const qnRef = await db.collection('questionnaires').add({
      name,
      description: '',
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

  console.log('Seed concluído.');
}

seed().catch(err => {
  console.error('Erro no seed:', err);
  process.exit(1);
});