// ===============================
// SERVIÇO DE ACESSO A DADOS (Firestore)
// ===============================

// Inicializa o Firebase (SDK compat) se ainda não estiver.
function initFirebase() {
  if (typeof firebase === 'undefined') {
    throw new Error('Firebase SDK não carregado. Verifique os scripts no HTML.');
  }
  if (!firebase.apps.length) {
    firebase.initializeApp(window.firebaseConfig);
  }
  return {
    db: firebase.firestore(),
    auth: firebase.auth()
  };
}

// ===============================
// LEITURA (pública, usada pelo jogo)
// ===============================

// Conta os documentos da subcoleção `questions` de um questionário.
// Usa get() puro (mesmo caminho da tela de visualização, que já funciona);
// o agregado count() do compat não era confiável e derrubava/zerava o badge.
async function countQuestions(db, questionnaireId) {
  const snapshot = await db
    .collection('questionnaires')
    .doc(questionnaireId)
    .collection('questions')
    .get();
  return snapshot.size;
}

// Lista os questionários com a contagem total de perguntas.
// Prioriza contagem ao vivo; se falhar, cai para o campo denormalizado
// `questions_count` e, ao contrário, sincroniza o campo quando a contagem
// ao vivo funciona (auto-healing de dados antigos).
async function listQuestionnaires() {
  const { db } = initFirebase();
  const snapshot = await db.collection('questionnaires').orderBy('name').get();
  return Promise.all(
    snapshot.docs.map(async doc => {
      const data = doc.data();
      let questionsCount = null;
      try {
        questionsCount = await countQuestions(db, doc.id);
      } catch (err) {
        console.error(`Falha ao contar perguntas do questionário ${doc.id}:`, err);
        if (typeof data.questions_count === 'number') {
          questionsCount = data.questions_count;
        }
      }
      if (questionsCount !== null && data.questions_count !== questionsCount) {
        doc.ref
          .update({ questions_count: questionsCount })
          .catch(() => {});
      }
      return {
        id: doc.id,
        name: data.name || 'Sem nome',
        description: data.description || '',
        year: typeof data.year === 'number' ? data.year : null,
        questions_count: questionsCount
      };
    })
  );
}

// Questionário + perguntas estruturadas (usado pela tela de visualização).
async function getQuestionnaireWithQuestions(id) {
  const [questionnaire, questions] = await Promise.all([
    getQuestionnaire(id),
    listQuestionsForAdmin(id)
  ]);
  if (!questionnaire) return null;
  return { ...questionnaire, questions };
}

// Busca um questionário pelo id (usado pelo formulário de edição).
async function getQuestionnaire(id) {
  const { db } = initFirebase();
  const doc = await db.collection('questionnaires').doc(id).get();
  if (!doc.exists) return null;
  return {
    id: doc.id,
    name: doc.data().name || '',
    description: doc.data().description || '',
    year: typeof doc.data().year === 'number' ? doc.data().year : null
  };
}

// Lista as perguntas de um questionário com todos os campos do admin
// (ordem, pontos, texto e alternativas com isCorrect).
async function listQuestionsForAdmin(questionnaireId) {
  const { db } = initFirebase();
  const snapshot = await db
    .collection('questionnaires')
    .doc(questionnaireId)
    .collection('questions')
    .orderBy('order')
    .get();

  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      points: data.points,
      text: data.text,
      order: data.order,
      options: (data.options || []).map(opt => ({
        text: opt.text,
        isCorrect: !!opt.isCorrect
      }))
    };
  });
}

// Carrega as perguntas de um questionário, retornando no formato que o jogo espera:
// { points, question, options: [{ text, correct }] }
async function loadQuestions(questionnaireId) {
  const { db } = initFirebase();
  const snapshot = await db
    .collection('questionnaires')
    .doc(questionnaireId)
    .collection('questions')
    .orderBy('order')
    .get();

  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      points: data.points,
      question: data.text,
      options: (data.options || []).map(opt => ({
        text: opt.text,
        correct: !!opt.isCorrect
      }))
    };
  });
}

// ===============================
// ESCRITA (autenticada, usada pelo painel admin)
// ===============================

// Garante que o usuário está autenticado; lança erro caso contrário.
function requireAdmin() {
  const { auth } = initFirebase();
  if (!auth.currentUser) {
    throw new Error('Operação restrita ao administrador autenticado.');
  }
  return auth.currentUser;
}

// CRUD de questionários

// Normaliza o ano de edição (`year`): aceita número inteiro entre 1900 e 2100;
// qualquer outro valor cai para o ano corrente (defesa extra — a validação
// principal fica no formulário do admin).
function normalizeYear(value) {
  const n = Number(value);
  if (Number.isInteger(n) && n >= 1900 && n <= 2100) return n;
  return new Date().getFullYear();
}

async function createQuestionnaire({ name, description = '', year }) {
  requireAdmin();
  const { db } = initFirebase();
  return db.collection('questionnaires').add({
    name,
    description,
    year: normalizeYear(year),
    questions_count: 0,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  });
}

async function updateQuestionnaire(id, { name, description = '', year }) {
  requireAdmin();
  const { db } = initFirebase();
  return db.collection('questionnaires').doc(id).update({
    name,
    description,
    year: normalizeYear(year),
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  });
}

async function deleteQuestionnaire(id) {
  requireAdmin();
  const { db } = initFirebase();
  // Exclui as perguntas (subcoleção) antes do questionário.
  const questionsSnap = await db
    .collection('questionnaires')
    .doc(id)
    .collection('questions')
    .get();
  const batch = db.batch();
  const ref = db.collection('questionnaires').doc(id);
  questionsSnap.docs.forEach(doc => batch.delete(doc.ref));
  batch.delete(ref);
  return batch.commit();
}

// CRUD de perguntas (com alternativas aninhadas em options)
async function createQuestion(questionnaireId, { points, text, order, options }) {
  requireAdmin();
  const { db } = initFirebase();
  const ref = await db
    .collection('questionnaires')
    .doc(questionnaireId)
    .collection('questions')
    .add({
      points: Number(points),
      text,
      order: Number(order),
      options: options.map((opt, i) => ({
        text: opt.text,
        isCorrect: !!opt.isCorrect,
        position: i
      })),
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
  await db
    .collection('questionnaires')
    .doc(questionnaireId)
    .update({
      questions_count: firebase.firestore.FieldValue.increment(1),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    })
    .catch(() => {});
  return ref;
}

async function updateQuestion(questionnaireId, questionId, { points, text, order, options }) {
  requireAdmin();
  const { db } = initFirebase();
  return db
    .collection('questionnaires')
    .doc(questionnaireId)
    .collection('questions')
    .doc(questionId)
    .update({
      points: Number(points),
      text,
      order: Number(order),
      options: options.map((opt, i) => ({
        text: opt.text,
        isCorrect: !!opt.isCorrect,
        position: i
      })),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
}

async function deleteQuestion(questionnaireId, questionId) {
  requireAdmin();
  const { db } = initFirebase();
  await db
    .collection('questionnaires')
    .doc(questionnaireId)
    .collection('questions')
    .doc(questionId)
    .delete();
  await db
    .collection('questionnaires')
    .doc(questionnaireId)
    .update({
      questions_count: firebase.firestore.FieldValue.increment(-1),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    })
    .catch(() => {});
}

// ===============================
// HISTÓRICO DE JOGADAS
// ===============================
// saveGameRecord é a única escrita e é chamada pelo jogo (index.html), que
// precisa de uma sessão de admin. As leituras (listGameRecords/getGameRecord)
// e a exclusão são exclusivas do painel — o jogo nunca relê o que grava.

// Grava um registro de partida. createdAt é carimbado pelo servidor.
async function saveGameRecord(record) {
  requireAdmin();
  const { db } = initFirebase();
  return db.collection('gameHistory').add({
    ...record,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });
}

// Normaliza um documento da coleção para o formato consumido pelo painel.
function mapGameRecord(doc) {
  const data = doc.data();
  const rounds = Array.isArray(data.rounds) ? data.rounds : [];
  return {
    id: doc.id,
    version: Number(data.version) || 1,
    questionnaireId: data.questionnaireId || null,
    questionnaireName: data.questionnaireName || '',
    playerName: data.playerName || '',
    className: data.className || '',
    score: Number(data.score) || 0,
    outcome: data.outcome === 'win' ? 'win' : 'lose',
    answeredCount: rounds.length,
    jokersUsed: data.jokersUsed || {},
    rounds,
    decisiveRoundIndex: Number.isInteger(data.decisiveRoundIndex) ? data.decisiveRoundIndex : null,
    playedAt: data.playedAt || '',
    savedByEmail: data.savedByEmail || '',
    createdAt: data.createdAt || null
  };
}

// Lista os registros, do mais recente para o mais antigo (uso do painel).
async function listGameRecords() {
  const { db } = initFirebase();
  const snapshot = await db.collection('gameHistory').orderBy('createdAt', 'desc').get();
  return snapshot.docs.map(mapGameRecord);
}

// Busca um registro pelo id (tela de detalhe do painel).
async function getGameRecord(id) {
  const { db } = initFirebase();
  const doc = await db.collection('gameHistory').doc(id).get();
  if (!doc.exists) return null;
  return mapGameRecord(doc);
}

// Exclui um registro (painel). O jogo nunca exclui.
async function deleteGameRecord(id) {
  requireAdmin();
  const { db } = initFirebase();
  return db.collection('gameHistory').doc(id).delete();
}

// Auth helpers
async function loginAdmin(email, password) {
  const { auth } = initFirebase();
  return auth.signInWithEmailAndPassword(email, password);
}

function onAuthStateChange(callback) {
  const { auth } = initFirebase();
  return auth.onAuthStateChanged(callback);
}

async function logoutAdmin() {
  const { auth } = initFirebase();
  return auth.signOut();
}

async function sendPasswordResetEmail(email) {
  const { auth } = initFirebase();
  return auth.sendPasswordResetEmail(email);
}