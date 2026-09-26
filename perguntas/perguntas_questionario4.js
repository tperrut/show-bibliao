var questions = [
  {
    points: 10,
    question: "Qual apóstolo pregou o primeiro sermão após a descida do Espírito Santo?",
    options: [
      { text: "Pedro", correct: true },
      { text: "Judas", correct: false },
      { text: "Mateus", correct: false },
      { text: "Tomé", correct: false }
    ]
  },
  {
    points: 20,
    question: "Qual foi o pecado cometido por Ananias e Safira segundo as palavras de Pedro?",
    options: [
      { text: "Eles adulteraram", correct: false },
      { text: "Eles mentiram ao Espírito Santo", correct: true },
      { text: "Eles se rebelaram contra Pedro", correct: false },
      { text: "Eles roubaram o templo", correct: false }
    ]
  },
  {
    points: 30,
    question: "Qual era o significado do nome de Barnabé?",
    options: [
      { text: "Filho do trovão", correct: false },
      { text: "Filho da Paz", correct: false },
      { text: "Filho da Consolação", correct: true },
      { text: "NRC", correct: false }
    ]
  },
  {
    points: 40,
    question: "Que casal fabricante de tendas acolheu Paulo em Corinto?",
    options: [
      { text: "Priscila e Áquila", correct: true },
      { text: "Berenice e Barnabé", correct: false },
      { text: "Júlia e Prócoro", correct: false },
      { text: "NRC", correct: false }
    ]
  },
  {
    points: 50,
    question: "Que promessa Jesus deixou antes da sua ascensão?",
    options: [
      { text: "Que ele restauraria o Reino a Israel", correct: false },
      { text: "Que os discípulos receberiam poder do Espírito Santo e seriam testemunhas", correct: true },
      { text: "Que os discípulos se assentariam com ele no trono de Israel", correct: false },
      { text: "Que os discípulos seriam exaltados.", correct: false }
    ]
  },
  {
    points: 100,
    question: "Como era chamada a doutrina na qual a igreja perseverava?",
    options: [
      { text: "Doutrina de Balaão", correct: false },
      { text: "Doutrina dos Santos", correct: false },
      { text: "Doutrina das Testemunhas", correct: false },
      { text: "Doutrina dos Apóstolos", correct: true }
    ]
  },
  {
    points: 200,
    question: "De qual cidade partiram Paulo e Barnabé para a primeira viagem missionária oficial?",
    options: [
      { text: "Antioquia", correct: true },
      { text: "Atenas", correct: false },
      { text: "Jerusalém", correct: false },
      { text: "Betânia", correct: false }
    ]
  },
  {
    points: 300,
    question: "Quem era o judeu e sua respectiva irmã aos quais o governador Festo apresentou o caso de Paulo em Cesareia?",
    options: [
      { text: "O Rei Herodes Agripa I e sua irmã Herodias", correct: false },
      { text: "O Rei Herodes Antipas e sua irmã Salomé", correct: false },
      { text: "O Rei Herodes Agripa II e sua irmã Berenice", correct: true },
      { text: "NRC", correct: false }
    ]
  },
  {
    points: 400,
    question: "Qual alternativa não compõe a lista de decisões dos apóstolos no primeiro Concílio de Jerusalém a respeito dos convertidos?",
    options: [
      { text: "Que deviam se abster das peregrinações a Jerusalém", correct: true },
      { text: "Que deviam se abster do sangue e da carne sufocada", correct: false },
      { text: "Deviam se abster das relações sexuais ilícitas", correct: false },
      { text: "Deviam se abster das coisas sacrificadas a ídolos", correct: false }
    ]
  },
  {
    points: 500,
    question: "Por que o procônsul Gálio recusou-se a julgar a queixa dos judeus contra Paulo?",
    options: [
      { text: "Porque ele temia uma revolta popular dos gentios em Corinto caso condenasse um cidadão romano sem provas", correct: false },
      { text: "Porque ele percebeu que não se tratava de um crime, mas de uma disputa interna relativa à lei judaica", correct: true },
      { text: "Porque ele foi subornado secretamente por simpatizantes de Paulo.", correct: false },
      { text: "Porque ele era amigo pessoal de Paulo e simpatizava com o evangelho", correct: false }
    ]
  },
  {
    points: 600,
    question: "De que forma profética Ágabo previu a prisão de Paulo?",
    options: [
      { text: "Falando sobre uma visão de Paulo na prisão", correct: false },
      { text: "Amarrando as mãos e pés de Paulo com uma corda", correct: false },
      { text: "Amarrando seus próprios pés e mãos com o cinto de Paulo", correct: true },
      { text: "NRC", correct: false }
    ]
  },
  {
    points: 700,
    question: "De qual coorte Cornélio era centurião?",
    options: [
      { text: "Coorte Augusto", correct: false },
      { text: "Coorte Italiana", correct: true },
      { text: "Coorte Hispânica", correct: false },
      { text: "NRC", correct: false }
    ]
  },
  {
    points: 800,
    question: "Ao relatar a conversão dos gentios na casa de Cornélio, Pedro resgata uma promessa de Jesus para diferenciá-lo do batismo de João Batista. Qual é a essência do batismo prometido por Jesus?",
    options: [
      { text: "Um batismo ritual focado no arrependimento público nas águas", correct: false },
      { text: "Um batismo de fogo focado exclusivamente no juízo final", correct: false },
      { text: "O batismo com o Espírito Santo, marcando a regeneração interna", correct: true },
      { text: "Um batismo de arrependimento para remissão dos pecados, igual ao de João Batista", correct: false }
    ]
  },
  {
    points: 900,
    question: "Quais foram os discípulos que Paulo enviou à Macedônia, enquanto permaneceu mais tempo na Ásia?",
    options: [
      { text: "Timóteo e Erasto", correct: true },
      { text: "Demétrio e Timóteo", correct: false },
      { text: "João Marcos e Timóteo", correct: false },
      { text: "João Marcos e Epafras", correct: false }
    ]
  },
  {
    points: 1000,
    question: "Que acusações Tértulo apresentou contra Paulo?",
    options: [
      { text: "Pregar o Evangelho da ressurreição", correct: false },
      { text: "Descumprir a lei dos judeus e de Roma", correct: false },
      { text: "Ser agitador da seita dos nazarenos e profanar o Templo", correct: true },
      { text: "Combater a circuncisão e influenciar os judeus", correct: false }
    ]
  }
];
