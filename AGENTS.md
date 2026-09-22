# AGENTS.md

Diretrizes de trabalho para colaboradores humanos e agentes de IA neste repositório.

## Resumo do projeto

**Show do Biblião** — jogo de perguntas bíblicas estilo "Show do Milhão", 100% estático (HTML/CSS/JS vanilla, sem framework e sem build), com backend no **Firebase** (Firestore para dados e Authentication para o painel).

- `index.html` — jogo (tela inicial, regras, modal "Escolher Questionários" carregado do Firestore).
- `admin.html` — painel administrativo (SPA com roteamento por hash): login, CRUD de questionários e perguntas.
- `scripts/firebaseService.js` — camada de acesso a dados (toda a CRUD com Firestore).
- `scripts/admin/*` — módulos do painel (listagem, formulários de questionário/pergunta, visualização).
- `scripts/adminApp.js` — bootstrap e roteamento do painel.
- `firestore.rules` — leitura pública; escrita restrita à allowlist de e-mails admin.
- Modelo NoSQL: coleção `questionnaires` com subcoleção `questions` (cada pergunta é um documento próprio, permitindo cadastro incremental). Campo denormalizado `questions_count`.
- `QUESTIONS_TARGET = 15` (`scripts/gameRules.js`, fonte única com `POINTS_LADDER`/`LEVEL_BOUNDS`) — todo questionário completo tem exatamente 15 perguntas; o modal do jogo só libera questionários 15/15.

### Scripts npm

- `npm start` — servidor local (`npx serve .`).
- `npm seed` — importa as perguntas legadas (`perguntas/*.js`) para o Firestore.
- **Não existe script de build e não há pasta `dist/`** — o projeto é implantado direto da raiz. Não recriar sem pedido explícito.

## Comunicação e idioma

- **Todo o material deste projeto é escrito 100% em pt-BR**: código-fonte (nomes de variáveis/funções em inglês são aceitos, mas comentários, strings de UI e mensagens em pt-BR), documentação (README, AGENTS.md, especificações), mensagens de commit e comentários em PRs/issues.
- Nunca misturar outros idiomas no conteúdo produzido para o repositório.

## Commits e versionamento

- **Nunca faça commit sozinho, sem autorização.** Commits só acontecem mediante pedido explícito do usuário na conversa.
- Antes de commitar: mostrar o que será alterado (`git status` / `git diff`) e aguardar a autorização.
- Mensagens de commit em pt-BR, descritivas, no estilo histórico do repositório (minúsculas, passado, contando o que mudou).
- Não fazer `push`, `amend`, `rebase` ou força-push sem autorização explícita.
- Nunca commitar segredos: `serviceAccountKey.json` e `node_modules/` já estão no `.gitignore` — manter assim.

### Template de mensagem de commit

Quando o commit for feito por um agente de IA, a mensagem **deve** registrar no corpo qual agente e qual modelo atuaram:

```
<descrição no estilo do histórico: minúsculas, passado, o que mudou>

Agente: <nome do agente, ex.: opencode>
Modelo: <id completo do modelo, ex.: opencode/mimo-v2.6>
```

- **1ª linha:** obrigatória; mesma regra do histórico (pt-BR, minúsculas, sem ponto final).
- **Corpo:** linha em branco após a 1ª linha, depois os trailers `Agente:` e `Modelo:` (nesta ordem, uma por linha).
- **Commits 100% manuais** (sem agente): manter só a 1ª linha, sem os trailers.
- Preencher `Agente`/`Modelo` com os valores reais da sessão que fez o commit — nunca inventar ou copiar de outro commit.

## Convenções de código

- Sem framework, sem bundler: scripts carregados via `<script>` clássico (sem módulos ES), ordem de carga importa.
- Estilo seguir o existente: funções globais nomeadas em `camelCase`, helpers `$`/`escapeHtml`/`showMessage` em `scripts/admin/shared.js`.
- Comentários no código em pt-BR.
- Validar sintaxe após alterar JS: `node --check <arquivo>` em todos os arquivos tocados.
- Regra de domínio: questionário só é considerado completo e jogável com 15 perguntas — preservar essa validação no admin e no modal do jogo.
- Não introduzir dependências novas sem autorização (hoje: apenas `firebase-admin` para o seed).
