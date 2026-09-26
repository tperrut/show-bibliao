// ===============================
// BACKFILL: preenche o campo `year` nos questionários legados
// Uso: npm run backfill:year -- <ano> [--apply]
//   dry-run (padrão): apenas lista o que mudaria, sem gravar nada
//   --apply: grava o ano nos documentos que ainda não têm `year`
// Idempotente: só toca em documentos sem `year` — rodar de novo é seguro.
// Requer: credenciais de service account (Admin SDK) em ../../serviceAccountKey.json
// (pasta pai do repositório — fora da raiz servida) ou GOOGLE_APPLICATION_CREDENTIALS.
// ===============================

const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

const SERVICE_ACCOUNT = process.env.GOOGLE_APPLICATION_CREDENTIALS ||
  path.join(__dirname, '..', '..', 'serviceAccountKey.json');

// Encerra com mensagem de uso, sem ler nem gravar dados.
function usageError(motivo) {
  console.error(`Erro: ${motivo}`);
  console.error('');
  console.error('Uso: npm run backfill:year -- <ano> [--apply]');
  console.error('  <ano>    ano da edição, entre 1900 e 2100 (ex.: 2025)');
  console.error('  --apply  grava as alterações (sem a flag, é dry-run)');
  process.exit(1);
}

// Interpreta os argumentos de CLI: ano obrigatório + flag opcional --apply.
function parseArgs(argv) {
  const apply = argv.includes('--apply');
  const yearArg = argv.find(arg => !arg.startsWith('--'));
  if (!yearArg) usageError('o ano é obrigatório.');
  if (!/^\d{4}$/.test(yearArg)) usageError(`ano inválido: "${yearArg}" (use 4 dígitos, ex.: 2025).`);
  const year = Number(yearArg);
  if (year < 1900 || year > 2100) usageError(`ano fora do intervalo 1900–2100: ${year}.`);
  return { year, apply };
}

async function backfill() {
  const { year, apply } = parseArgs(process.argv.slice(2));

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

  const snapshot = await db.collection('questionnaires').get();
  // Idempotência: só considera documentos que ainda não têm um `year` numérico.
  const pendentes = snapshot.docs.filter(doc => typeof doc.data().year !== 'number');

  console.log(apply ? 'Modo APPLY — gravando.' : 'Modo DRY-RUN — nada será gravado.');
  console.log(`Questionários: ${snapshot.size} | sem year: ${pendentes.length}`);

  if (!pendentes.length) {
    console.log('Nada a fazer.');
    return;
  }

  pendentes.forEach(doc => {
    const nome = doc.data().name || '(sem nome)';
    console.log(`  ${apply ? '→' : '~'} ${doc.id} | ${nome} | year: ${year}`);
  });

  if (!apply) {
    console.log('Dry-run: rode novamente com --apply para gravar.');
    return;
  }

  // Escritas em lotes de até 500 (limite de batch do Firestore).
  for (let i = 0; i < pendentes.length; i += 500) {
    const lote = db.batch();
    pendentes.slice(i, i + 500).forEach(doc => {
      lote.update(doc.ref, { year });
    });
    await lote.commit();
  }

  console.log(`✔ ${pendentes.length} questionário(s) atualizado(s) com year: ${year}.`);
}

backfill().catch(err => {
  console.error('Erro no backfill:', err);
  process.exit(1);
});
