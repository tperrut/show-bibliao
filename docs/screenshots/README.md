# Screenshots para Documentação

Esta pasta contém screenshots automatizados do **Show do Biblião** para uso no README e documentação.

## Como gerar

```bash
# Inicie o servidor local (em outro terminal)
npm start

# Execute os testes de screenshot
npm run screenshots
```

## Screenshots disponíveis

### Jogo (index.html)
| Arquivo | Descrição |
|---------|-----------|
| `01-welcome-desktop.png` | Tela inicial - Desktop (1280x720) |
| `01-welcome-tablet.png` | Tela inicial - Tablet (768x1024) |
| `01-welcome-mobile.png` | Tela inicial - Mobile (375x667) |
| `02-rules-modal-desktop.png` | Modal de Regras - Desktop |
| `02-rules-modal-tablet.png` | Modal de Regras - Tablet |
| `02-rules-modal-mobile.png` | Modal de Regras - Mobile |
| `03-questionnaires-modal-desktop.png` | Modal Escolher Questionários - Desktop |
| `03-questionnaires-modal-tablet.png` | Modal Escolher Questionários - Tablet |
| `03-questionnaires-modal-mobile.png` | Modal Escolher Questionários - Mobile |

> **Nota:** As telas de jogo (`04-game-first-question` e `05-game-final`) só são geradas quando existe pelo menos um questionário completo (15/15 perguntas) no Firestore.

### Painel Admin (admin.html)
| Arquivo | Descrição |
|---------|-----------|
| `admin-01-login-desktop.png` | Tela de Login |
| `admin-02-questionnaires-list-desktop.png` | Lista de Questionários |
| `admin-03-questionnaire-form-desktop.png` | Formulário de Questionário |
| `admin-04-question-form-desktop.png` | Formulário de Pergunta |
| `admin-05-questionnaire-detail-desktop.png` | Visualização de Questionário |
| `admin-06-game-history-desktop.png` | Histórico de Jogadas |

## Uso no README

```markdown
### Tela Inicial
![Tela Inicial - Desktop](docs/screenshots/01-welcome-desktop.png)

### Regras do Jogo
![Regras - Desktop](docs/screenshots/02-rules-modal-desktop.png)

### Escolher Questionários
![Questionários - Desktop](docs/screenshots/03-questionnaires-modal-desktop.png)

### Painel Admin
![Admin Login](docs/screenshots/admin-01-login-desktop.png)
![Admin Questionários](docs/screenshots/admin-02-questionnaires-list-desktop.png)
```

## Viewports testadas

- **Desktop**: 1280x720
- **Tablet**: 768x1024
- **Mobile**: 375x667

## Requisitos

- Servidor local rodando (`npm start` na porta 3000)
- Playwright instalado (`npm install -D @playwright/test`)
- Navegador Chromium instalado (`npx playwright install chromium`)