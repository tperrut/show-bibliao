// Testes de regras do Firestore com emulador local.
// Roda com `npm run test:rules` (node:test + @firebase/rules-unit-testing).
// Exige Java instalado: o emulador do Firestore roda numa JVM.

const { readFileSync } = require('node:fs');
const { test, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} = require('@firebase/rules-unit-testing');

// Prefixo demo- garante que nada aqui toca o projeto de produção.
const PROJECT_ID = 'demo-show-biblao';

let testEnv;

before(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      rules: readFileSync('firestore.rules', 'utf8'),
      host: '127.0.0.1',
      port: 8081,
    },
  });
});

after(async () => {
  await testEnv.cleanup();
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

// Contextos: "admin" está na allowlist do firestore.rules; "aluno", não.
const dbAdmin = () =>
  testEnv.authenticatedContext('admin-uid', { email: 'thi.perrut@gmail.com' }).firestore();
const dbAluno = () =>
  testEnv.authenticatedContext('aluno-uid', { email: 'aluno@escola.com' }).firestore();
const dbAnon = () => testEnv.unauthenticatedContext().firestore();

// Registro de partida válido — espelha hasHistoryFields() e as validações
// de forma do firestore.rules (score, rounds, outcome, nome e classe).
function registroValido(overrides = {}) {
  return {
    version: 1,
    questionnaireId: 'q1',
    questionnaireName: 'Questionário Teste',
    playerName: 'Aluno Teste',
    className: 'Turma A',
    score: 1000,
    outcome: 'win',
    answeredCount: 15,
    jokersUsed: { pastores: false, classe: false, cartas: false, pulos: 0 },
    rounds: [],
    decisiveRoundIndex: 14,
    playedAt: '2026-09-29T12:00:00.000Z',
    savedByEmail: 'thi.perrut@gmail.com',
    createdAt: '2026-09-29T12:00:00.000Z',
    ...overrides,
  };
}

// ---------------------------------------------------------------- questionnaires

test('questionnaires: leitura pública sem login', async () => {
  await assertSucceeds(dbAnon().doc('questionnaires/q1').get());
});

test('questionnaires: escrita negada sem login', async () => {
  await assertFails(dbAnon().doc('questionnaires/q1').set({ title: 'Novo' }));
});

test('questionnaires: escrita negada para e-mail fora da allowlist', async () => {
  await assertFails(dbAluno().doc('questionnaires/q1').set({ title: 'Novo' }));
});

test('questionnaires: escrita permitida para admin', async () => {
  await assertSucceeds(dbAdmin().doc('questionnaires/q1').set({ title: 'Novo' }));
});

test('questions (subcoleção): leitura pública e escrita restrita ao admin', async () => {
  await assertSucceeds(dbAdmin().doc('questionnaires/q1/questions/p1').set({ text: 'Pergunta' }));
  await assertSucceeds(dbAnon().doc('questionnaires/q1/questions/p1').get());
  await assertFails(dbAluno().doc('questionnaires/q1/questions/p1').set({ text: 'Invasão' }));
});

// ---------------------------------------------------------------- gameHistory

test('gameHistory: leitura negada sem login', async () => {
  await assertFails(dbAnon().collection('gameHistory').get());
});

test('gameHistory: leitura negada para e-mail fora da allowlist', async () => {
  await assertFails(dbAluno().collection('gameHistory').get());
});

test('gameHistory: leitura permitida para admin', async () => {
  await assertSucceeds(dbAdmin().collection('gameHistory').get());
});

test('gameHistory: gravação de registro válido permitida para admin', async () => {
  await assertSucceeds(dbAdmin().doc('gameHistory/r1').set(registroValido()));
});

test('gameHistory: gravação negada sem login', async () => {
  await assertFails(dbAnon().doc('gameHistory/r1').set(registroValido()));
});

test('gameHistory: gravação negada para e-mail fora da allowlist', async () => {
  await assertFails(dbAluno().doc('gameHistory/r1').set(registroValido()));
});

test('gameHistory: gravação negada sem os campos obrigatórios', async () => {
  await assertFails(dbAdmin().doc('gameHistory/r1').set({ version: 1, score: 100 }));
});

test('gameHistory: score acima de 1000 é rejeitado', async () => {
  await assertFails(dbAdmin().doc('gameHistory/r1').set(registroValido({ score: 1001 })));
});

test('gameHistory: score fracionário é rejeitado', async () => {
  await assertFails(dbAdmin().doc('gameHistory/r1').set(registroValido({ score: 999.5 })));
});

test('gameHistory: mais de 15 rounds é rejeitado', async () => {
  const rounds = Array.from({ length: 16 }, (_, i) => ({ order: i + 1 }));
  await assertFails(dbAdmin().doc('gameHistory/r1').set(registroValido({ rounds })));
});

test('gameHistory: outcome fora de win/lose é rejeitado', async () => {
  await assertFails(dbAdmin().doc('gameHistory/r1').set(registroValido({ outcome: 'draw' })));
});

test('gameHistory: nome de jogador vazio é rejeitado', async () => {
  await assertFails(dbAdmin().doc('gameHistory/r1').set(registroValido({ playerName: '' })));
});

test('gameHistory: nome de jogador acima de 60 caracteres é rejeitado', async () => {
  await assertFails(dbAdmin().doc('gameHistory/r1').set(registroValido({ playerName: 'x'.repeat(61) })));
});

test('gameHistory: classe acima de 60 caracteres é rejeitada', async () => {
  await assertFails(dbAdmin().doc('gameHistory/r1').set(registroValido({ className: 'x'.repeat(61) })));
});

test('gameHistory: update e delete permitidos para admin', async () => {
  const ref = dbAdmin().doc('gameHistory/r1');
  await ref.set(registroValido());
  await assertSucceeds(ref.update({ score: 500 }));
  await assertSucceeds(ref.delete());
});

test('gameHistory: update negado para e-mail fora da allowlist', async () => {
  await dbAdmin().doc('gameHistory/r1').set(registroValido());
  await assertFails(dbAluno().doc('gameHistory/r1').update({ score: 1 }));
});

test('gameHistory: delete negado sem login', async () => {
  await dbAdmin().doc('gameHistory/r1').set(registroValido());
  await assertFails(dbAnon().doc('gameHistory/r1').delete());
});
