# 🎮 Show do Biblião (V2)

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-https://show--bibliao--imw.netlify.app-00C7B7?style=for-the-badge)](https://show-bibliao-imw.netlify.app/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)]()
[![Stack](https://img.shields.io/badge/Stack-HTML%2FCSS%2FJS_Vanilla-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)]()
[![Backend](https://img.shields.io/badge/Backend-Firebase_Firestore-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)]()
[![Auth](https://img.shields.io/badge/Auth-Firebase_Auth-EA4335?style=for-the-badge&logo=firebase&logoColor=white)]()
[![Deploy](https://img.shields.io/badge/Deploy-Netlify-00C7B7?style=for-the-badge&logo=netlify&logoColor=white)]()

---

## 📖 Sobre o Projeto

**Show do Biblião** é um jogo de perguntas bíblicas inspirado no formato *"Show do Milhão"*, construído 100% em **HTML, CSS e JavaScript vanilla** (sem frameworks, sem build step). O backend utiliza **Firebase** (Firestore para dados + Authentication para o painel administrativo).

> 🎯 **Objetivo**: Oferecer uma experiência divertida e educativa de quiz bíblico para grupos, classes e eventos de igrejas.

---

## 🏗️ Arquitetura

```
show-biblao/
├── index.html                 # 🎮 Jogo principal
├── admin.html                 # 🛠️ Painel administrativo
├── scripts/
│   ├── importSeed.js          # 🌱 Seed de perguntas (Node.js)
│   ├── shared/                # 📦 Compartilhados (game + admin)
│   │   ├── firebaseConfig.js  # Config pública do Firebase Web SDK
│   │   ├── firebaseService.js # Camada de acesso ao Firestore
│   │   ├── escapeHtml.js      # Utilitário de sanitização
│   │   ├── gameRules.js       # Regras centrais (pontos, níveis, 15 perguntas)
│   │   ├── authGate.js        # Guard de sessão admin
│   │   └── gameHistory.js     # Core: montagem/validação de registros
│   ├── game/                  # 🎮 Scripts do jogo
│   │   ├── main.js            # Bootstrap + orquestração
│   │   ├── state.js           # Estado da partida
│   │   ├── screens.js         # Criação de telas dinâmicas
│   │   ├── progress.js        # Trilha de progresso (stepper 1-15)
│   │   ├── perguntas.js       # Fallback local (questionário padrão)
│   │   ├── modal.js           # Sistema de modais
│   │   ├── jokers.js          # Recursos: Pastores, Classe, Cartas, Pulo
│   │   ├── grading.js         # Correção e feedback
│   │   └── visual.js          # Efeitos visuais (confete, banners)
│   └── admin/                 # 🛠️ Scripts do painel
│       ├── adminApp.js        # Bootstrap + hash routing
│       ├── shared.js          # Helpers ($, showMessage, ícones)
│       ├── auth.js            # Login/logout + sessão
│       ├── questionnaires.js  # CRUD de questionários
│       ├── questionnaireForm.js
│       ├── questionnaireDetail.js
│       ├── questions.js       # Listagem de perguntas
│       ├── questionForm.js    # CRUD de perguntas
│       └── gameHistory.js     # UI: histórico de partidas
├── styles/
│   ├── main.css               # Estilos globais + jogo
│   └── admin.css              # Estilos do painel
├── images/                    # Assets visuais
├── sons/                      # Efeitos sonoros
├── perguntas/                 # Arquivos legados (seed source)
├── tests/
│   └── firestoreRules.test.js # Testes das Security Rules
├── firestore.rules            # Regras de segurança (leitura pública, escrita admin)
├── firebase.json              # Config Firebase CLI (emulador + deploy rules)
├── .firebaserc                # Projeto Firebase alvo
└── package.json               # Scripts npm
```

---

## 🛠️ Tecnologias

| Camada | Tecnologia | Versão/Nota |
|--------|------------|-------------|
| **Frontend** | HTML5, CSS3, JavaScript (ES6+) | Vanilla, sem bundler |
| **Backend (BaaS)** | Firebase Firestore | NoSQL, tempo real |
| **Autenticação** | Firebase Authentication | Email/Password |
| **Segurança** | Firebase Security Rules | Testadas no emulador |
| **Seed/Admin SDK** | Node.js + firebase-admin | Apenas local |
| **Testes de Rules** | @firebase/rules-unit-testing | Java 17+ necessário |
| **Deploy** | Netlify (recomendado) | Qualquer host estático |

---

## 🚀 Como Rodar o Projeto

### Pré-requisitos
- **Node.js 18+** (para `npm install`, seed e testes)
- **Java 17+** (para `npm run test:rules` — emulador Firestore)
- Conta no [Firebase Console](https://console.firebase.google.com)

### 1️⃣ Clone e instale dependências
```bash
git clone https://github.com/seu-usuario/show-biblao.git
cd show-biblao
npm install
```

### 2️⃣ Configure o Firebase (uma vez)

| Passo | Ação | Onde |
|-------|------|------|
| 1 | Criar projeto | [Firebase Console](https://console.firebase.google.com) |
| 2 | Habilitar **Authentication** → Email/Password | Console > Auth > Sign-in method |
| 3 | Criar usuário **admin** | Console > Auth > Users > Add user |
| 4 | Criar **Firestore Database** | Console > Firestore > Create database |
| 5 | Copiar config **Web App** | Console > Project Settings > Your apps > `</>` |

### 3️⃣ Preencha `scripts/shared/firebaseConfig.js`
```js
// scripts/shared/firebaseConfig.js
window.firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "SEU_PROJETO.firebaseapp.com",
  projectId: "SEU_PROJETO",
  storageBucket: "SEU_PROJETO.firebasestorage.app",
  messagingSenderId: "SEU_SENDER_ID",
  appId: "1:SEU_SENDER_ID:web:SEU_APP_ID",
  measurementId: "G-SEU_MEASUREMENT_ID"
};
```

### 4️⃣ Publique as Security Rules
```bash
# Opção A: Via CLI (recomendado)
npm install -g firebase-tools   # se não tiver
firebase login
npm run deploy:rules

# Opção B: Via Console
# Cole o conteúdo de firestore.rules em Console > Firestore > Rules > Publicar
```

### 5️⃣ Rode localmente
```bash
npm start
# Abre em http://localhost:3000 (via npx serve)
```

---

## 🌱 Importação de Perguntas (Seed)

> **⚠️ Só necessário na primeira vez** (ou para repopular o banco).

```bash
# 1. Baixe a Service Account Key no Console
#    Project Settings > Service Accounts > Generate new private key

# 2. Salve FORA do repo (pasta pai):
#    ../serviceAccountKey.json   ← NUNCA commite este arquivo!

# 3. Rode o seed
npm run seed
```

**O que acontece:**
- Lê arquivos legados em `perguntas/*.js`
- Cria um questionário para cada arquivo no Firestore
- Preserva pontos, alternativas e resposta correta
- **serviceAccountKey.json** fica apenas na sua máquina (Admin SDK)

---

## 🧪 Testes das Security Rules

```bash
npm run test:rules
```
- Sobe emulador Firestore local
- Roda **23 testes** (leitura/escrita de `questionnaires`, `questions`, `gameHistory`)
- Perfis testados: **anon**, **admin (allowlist)**, **outros usuários**
- Desliga emulador ao final
- Requer **Java 17+** instalado

---

## 📋 Scripts NPM Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm start` | Sobe servidor local (`npx serve .`) |
| `npm run seed` | Importa perguntas legadas para o Firestore |
| `npm run deploy:rules` | Publica `firestore.rules` no projeto Firebase |
| `npm run test:rules` | Roda testes das Security Rules no emulador |

---

## 🛠️ Painel Administrativo

**Acesso:** `admin.html` (ou link "Administração" no menu do jogo)

### Funcionalidades
- 🔐 **Login** com email/senha do admin criado no Firebase
- 📋 **Questionários**: Criar, visualizar, editar, excluir
- ❓ **Perguntas**: CRUD completo por questionário (ordem 1–15, pontos automáticos)
- 📊 **Histórico**: Listagem e detalhe de partidas salvas (com evidência da pergunta decisiva)
- 🔒 **Segurança**: Escrita restrita à allowlist de e-mails via `firestore.rules`; leitura pública

### Regras de Negócio
- Questionário só fica **jogável** com **exatas 15 perguntas** (`QUESTIONS_TARGET = 15`)
- Pontos por ordem vêm de `POINTS_LADDER` (10 → 1000)
- Níveis: **Fácil (1–5)** → **Médio (6–10)** → **Difícil (11–15)**

---

## 🚀 Deploy

O projeto é **100% estático** — deploy em qualquer host:

| Plataforma | Como fazer |
|------------|------------|
| **Netlify** (recomendado) | Conecte o repo → Build: *vazio* → Publish: `.` (raiz) |
| **Vercel** | Import Project → Framework: *Other* → Output: `.` |
| **GitHub Pages** | Settings > Pages > Deploy from branch (root) |
| **Firebase Hosting** | `firebase init hosting` → Public: `.` → `firebase deploy` |

> **⚠️ IMPORTANTE**: Nunca exponha `serviceAccountKey.json` no deploy, no repo ou em pasta servida por HTTP. Ele fica **apenas** na sua máquina (`../serviceAccountKey.json`).

---

## 📁 Estrutura de Dados (Firestore)

```
questionnaires (collection)
  └── {questionnaireId} (doc)
        ├── name: string
        ├── description: string
        ├── year: number
        ├── questions_count: number (denormalizado)
        ├── createdAt: timestamp
        ├── updatedAt: timestamp
        └── questions (subcollection)
              └── {questionId} (doc)
                    ├── order: number (1-15)
                    ├── points: number
                    ├── text: string
                    ├── options: array[{ text, isCorrect, position }]
                    ├── createdAt: timestamp
                    └── updatedAt: timestamp

gameHistory (collection)
  └── {recordId} (doc)
        ├── version: number
        ├── questionnaireId: string
        ├── questionnaireName: string
        ├── playerName: string
        ├── className: string
        ├── score: number
        ├── outcome: 'win' | 'lose'
        ├── answeredCount: number
        ├── jokersUsed: object
        ├── rounds: array[...]
        ├── decisiveRoundIndex: number
        ├── playedAt: timestamp
        ├── savedByEmail: string
        └── createdAt: timestamp
```

---

## 🔒 Segurança

- **Leitura pública**: Qualquer um joga sem login (`firestore.rules`)
- **Escrita restrita**: Apenas e-mails na **allowlist** (`adminEmails`) podem criar/editar/excluir
- **Admin SDK**: Só roda local no seed (`serviceAccountKey.json` **não** vai para o navegador)
- **apiKey no firebaseConfig.js**: É **pública por design** — a segurança real está nas Rules

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch: `git checkout -b feature/nova-funcionalidade`
3. Commit seguindo o padrão do repo (pt-BR, minúsculas, passado):
   ```bash
   git commit -m "adiciona validação de questionário incompleto no modal

   Agente: opencode
   Modelo: opencode/nemotron-3-ultra-free
   ```
4. Push e abra um PR

---

## 📄 Licença

MIT License — sinta-se livre para usar, modificar e distribuir.

---

## 🙏 Agradecimentos

- Igreja Metodista Wesleyana (inspiração e conteúdo)
- Comunidade Firebase pela documentação e emulador local
- Todos que testaram e deram feedback nas partidas!

---

<div align="center">

**Feito com ❤️ para a comunidade**

[🌐 Jogar Agora](https://show-bibliao-imw.netlify.app/) · [🐛 Reportar Bug](https://github.com/seu-usuario/show-biblao/issues) · [💡 Sugerir Melhoria](https://github.com/seu-usuario/show-biblao/issues)

</div>