# Show do Biblião (V2)

Jogo de perguntas bíblicas em HTML/JS vanilla. Na V2, as perguntas passaram a ser
armazenadas no **Firebase Firestore**, com um **painel administrativo autenticado**
para cadastro/edição de perguntas e questionários.

## Arquitetura

- `index.html` — o jogo. Carrega os questionários e perguntas do Firestore.
- `admin.html` — painel de administração (login + CRUD).
- `scripts/firebaseConfig.js` — configuração pública do app Firebase.
- `scripts/firebaseService.js` — acesso a dados (leitura pública + escrita autenticada).
- `scripts/importSeed.js` — importa as perguntas antigas de `perguntas/*.js` para o Firestore.
- `firestore.rules` — regras de segurança (leitura pública, escrita restrita ao admin).

O projeto é 100% estático; o deploy é feito em qualquer host estático
(GitHub Pages / Netlify / Vercel / Firebase Hosting).

## Setup (uma vez)

1. **Criar projeto no Firebase Console** (https://console.firebase.google.com).
2. **Habilitar Authentication** > Sign-in method > Email/Password, e criar o usuário
   administrador (Users > Add user).
3. **Criar o banco Firestore** (Database > Create database, modo "Test/Production").
4. **Configurar as Security Rules** (Database > Rules): cole o conteúdo de `firestore.rules`
   e substitua `ADMIN_EMAIL` pelo email do administrador. Publicar.
5. **Preencher `scripts/firebaseConfig.js`** com os valores do projeto
   (Project settings > Your apps > Web app): `apiKey`, `authDomain`, `projectId`,
   `storageBucket`, `messagingSenderId`, `appId`.

## Importação das perguntas atuais (seed)

1. Instalar dependências: `npm install` (instala `firebase-admin`).
2. Baixar as credenciais de service account no Firebase Console
   (Project settings > Service accounts > Generate new private key).
3. Salvar o arquivo como `serviceAccountKey.json` na raiz (fora do repositório; já está
   no `.gitignore`).
4. Rodar: `npm run seed`.

O seed lê os arquivos de `perguntas/*.js` e cria um questionário para cada um, com as
perguntas e alternativas (preservando pontos e resposta correta).

## Uso do painel admin

- Acesse `admin.html`.
- Faça login com o email/senha do administrador criado no Firebase.
- Crie/renomeie/exclua questionários e adicione/edite/exclua perguntas e alternativas.
- A proteção de escrita fica nas Security Rules: apenas o admin pode criar/editar/excluir;
  qualquer visitante pode ler (necessário para o jogo funcionar sem login).

## Deploy

Suba os arquivos estáticos (HTML, CSS, JS, images, sons) para o host estático.
A configuração do Firebase (`firebaseConfig.js`) já acompanha o front (apiKey é pública
por design — a segurança real está nas Security Rules).

> **Importante:** nunca exponha o `serviceAccountKey.json` nem credenciais de service
> account no deploy ou no repositório.