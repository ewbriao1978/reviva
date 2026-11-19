// =============================================================================
// prisma/seed.js - Dados iniciais da plataforma REVIVA
// =============================================================================
// "Semear" (seed) o banco significa inserir os dados basicos para o sistema
// poder funcionar logo apos a instalacao: os modulos, alguns conteudos, uma
// simulacao completa e o usuario administrador.
//
// Execute com:  npm run seed
//
// O script pode ser rodado mais de uma vez: ele apaga os dados anteriores
// antes de inserir, para nao criar duplicatas.
//
// -----------------------------------------------------------------------------
// AVISO SOBRE O CONTEUDO DE SAUDE - LEIA ANTES DE APRESENTAR
// -----------------------------------------------------------------------------
// Os textos de primeiros socorros aqui foram TRANSCRITOS DO PROPRIO TCC, dos
// protetipos elaborados pela autora:
//   - Figura 1 (fluxograma do atendimento inicial, p. 13);
//   - Figura 4 (conteudo do modulo Engasgos, p. 25);
//   - Figura 5 (cenario e alternativas da simulacao, p. 26).
//
// Os textos de FEEDBACK das alternativas nao constavam no TCC e foram
// redigidos a partir do que a propria autora ja havia escrito nessas figuras.
//
// TODO O CONTEUDO CLINICO AINDA PRECISA DO AVAL DA ORIENTACAO DE ENFERMAGEM
// ANTES DE QUALQUER APRESENTACAO PUBLICA.
//
// Os modulos 2 a 5 e algumas secoes do modulo 1 estao marcados com
// [A VALIDAR - ENFERMAGEM]: sao espacos reservados, sem orientacao clinica,
// aguardando o material da autora.
// =============================================================================

import bcrypt from "bcryptjs";
import prisma from "../src/config/db.js";

// Texto padrao usado nos conteudos que ainda serao escritos pela autora.
const PENDENTE =
  "[A VALIDAR - ENFERMAGEM] Este conteudo ainda sera elaborado pela autora " +
  "com apoio da orientacao da area de Enfermagem, conforme o objetivo " +
  "especifico do TCC: 'Levantar conteudos basicos de primeiros socorros com " +
  "apoio da Enfermagem'. O espaco esta reservado na estrutura da plataforma.";

// Aviso educativo repetido nos pontos de encerramento.
const AVISO_EDUCATIVO =
  "Lembre-se: a REVIVA e uma ferramenta educativa. Ela nao substitui " +
  "treinamento pratico presencial nem o atendimento de profissionais de " +
  "saude. Em uma emergencia real, acione imediatamente o SAMU (192) ou os " +
  "Bombeiros (193).";

async function main() {
  console.log("Iniciando a insercao dos dados...\n");

  // ---------------------------------------------------------------------------
  // 1) LIMPEZA
  // ---------------------------------------------------------------------------
  // A ordem importa: apagamos primeiro as tabelas "filhas" (as que possuem
  // chave estrangeira) e depois as "pais". Se fizessemos ao contrario, o
  // PostgreSQL recusaria a operacao.
  console.log("Limpando dados anteriores...");

  await prisma.progressoSimulacao.deleteMany();
  await prisma.progressoConteudo.deleteMany();
  await prisma.alternativa.deleteMany();
  await prisma.etapaSimulacao.deleteMany();
  await prisma.simulacao.deleteMany();
  await prisma.conteudo.deleteMany();
  await prisma.modulo.deleteMany();
  await prisma.usuario.deleteMany();

  // ---------------------------------------------------------------------------
  // 2) USUARIOS DE DEMONSTRACAO
  // ---------------------------------------------------------------------------
  console.log("Criando usuarios...");

  // A senha NUNCA vai para o banco em texto puro. O bcrypt.hash transforma
  // "admin123" em um hash irreversivel.
  const senhaAdmin = await bcrypt.hash("admin123", 10);
  const senhaAluno = await bcrypt.hash("aluno123", 10);

  const admin = await prisma.usuario.create({
    data: {
      nome: "Administrador REVIVA",
      email: "admin@reviva.local",
      senhaHash: senhaAdmin,
      tipo: "ADMIN",
    },
  });

  await prisma.usuario.create({
    data: {
      nome: "Aluno de Demonstracao",
      email: "aluno@reviva.local",
      senhaHash: senhaAluno,
      tipo: "USUARIO",
    },
  });

  // ---------------------------------------------------------------------------
  // 3) OS CINCO MODULOS
  // ---------------------------------------------------------------------------
  // Sao os cinco temas definidos no TCC.
  console.log("Criando os cinco modulos...");

  const engasgos = await prisma.modulo.create({
    data: {
      titulo: "Engasgos",
      descricao: "Tecnicas de desobstrucao de vias aereas.",
      ordem: 1,
      ativo: true,
    },
  });

  const parada = await prisma.modulo.create({
    data: {
      titulo: "Paradas cardiorrespiratorias",
      descricao: "RCP e uso do DEA em situacoes reais.",
      ordem: 2,
      ativo: true,
    },
  });

  const hemorragias = await prisma.modulo.create({
    data: {
      titulo: "Hemorragias graves",
      descricao: "Controle de sangramentos e primeiros socorros.",
      ordem: 3,
      ativo: true,
    },
  });

  const queimaduras = await prisma.modulo.create({
    data: {
      titulo: "Queimaduras",
      descricao: "Classificacao e primeiros cuidados urgentes.",
      ordem: 4,
      ativo: true,
    },
  });

  const convulsoes = await prisma.modulo.create({
    data: {
      titulo: "Convulsoes",
      descricao: "Como agir e proteger durante uma crise ativa.",
      ordem: 5,
      ativo: true,
    },
  });

  // ---------------------------------------------------------------------------
  // 4) CONTEUDOS DO MODULO 1 - ENGASGOS
  // ---------------------------------------------------------------------------
  // A lista de topicos segue exatamente o prototipo da Figura 4 do TCC.
  console.log("Criando conteudos do modulo Engasgos...");

  await prisma.conteudo.createMany({
    data: [
      {
        moduloId: engasgos.id,
        ordem: 1,
        titulo: "Introducao",
        // Texto baseado na Figura 1 do TCC (fluxograma do atendimento inicial),
        // elaborado pela autora com base em Global First Aid Reference Centre
        // (2023) e Guedes (2019).
        texto:
          "Antes de qualquer atendimento, e importante seguir uma sequencia " +
          "que torna a ajuda mais segura. O TCC resume esse processo em seis " +
          "passos:\n\n" +
          "1. Identificar a emergencia - reconhecer o evento e a necessidade " +
          "de ajuda.\n" +
          "2. Avaliar a seguranca da cena - verificar riscos para a vitima, " +
          "para quem socorre e para as demais pessoas.\n" +
          "3. Avaliar a vitima - verificar rapidamente o seu estado.\n" +
          "4. Acionar o servico de emergencia - ligar para o SAMU (192) ou " +
          "para os Bombeiros (193).\n" +
          "5. Prestar os primeiros socorros - agir conforme a sua " +
          "capacitacao.\n" +
          "6. Receber o atendimento especializado - aguardar a equipe e dar " +
          "continuidade ao atendimento.\n\n" +
          "Fonte: Figura 1 do TCC, elaborada pela autora com base em Global " +
          "First Aid Reference Centre (2023) e Guedes (2019).\n\n" +
          AVISO_EDUCATIVO,
      },
      {
        moduloId: engasgos.id,
        ordem: 2,
        titulo: "Reconhecimento da situacao",
        // Texto TRANSCRITO do prototipo da Figura 4 do TCC (p. 25).
        texto:
          "Saber identificar rapidamente se uma pessoa esta engasgando e " +
          "crucial para salvar vidas. O engasgo ocorre quando um objeto " +
          "estranho bloqueia a via aerea de forma parcial ou total, " +
          "impossibilitando a respiracao correta.\n\n" +
          "SINAIS COMUNS DE OBSTRUCAO\n\n" +
          "- Sinal universal do engasgo: a pessoa leva as maos ao pescoco de " +
          "forma desesperada.\n" +
          "- Tosse fraca ou incapacidade total de tossir: o fluxo de ar esta " +
          "severamente comprometido.\n" +
          "- Mudanca de cor na pele: labios e unhas comecam a ficar azulados " +
          "ou acinzentados (cianose).\n" +
          "- Chiados ou sons agudos: tentativas intensas de inspirar com " +
          "passagem de ar limitada.\n\n" +
          "LEMBRE-SE\n\n" +
          "Se a vitima conseguir tossir de forma eficaz ou falar, incentive-a " +
          "a continuar tossindo. Nao de tapas nas costas enquanto ele estiver " +
          "tossindo ativamente de pe, pois isso pode deslocar o objeto e " +
          "piorar a obstrucao.\n\n" +
          "Fonte: texto do prototipo da Figura 4 do TCC, elaborado pela autora.",
      },
      {
        moduloId: engasgos.id,
        ordem: 3,
        titulo: "Cuidados iniciais",
        texto: PENDENTE,
      },
      {
        moduloId: engasgos.id,
        ordem: 4,
        titulo: "O que evitar",
        texto: PENDENTE,
      },
      {
        moduloId: engasgos.id,
        ordem: 5,
        titulo: "Quando buscar ajuda",
        texto:
          "O acionamento do servico especializado e um dos passos do " +
          "fluxograma apresentado no TCC e deve anteceder qualquer " +
          "intervencao que ultrapasse a capacidade de quem presta o " +
          "atendimento.\n\n" +
          "TELEFONES DE EMERGENCIA\n\n" +
          "- SAMU: 192\n" +
          "- Corpo de Bombeiros: 193\n\n" +
          "Sempre que houver mais de uma pessoa no local, uma delas pode " +
          "acionar o socorro enquanto a outra permanece com a vitima.\n\n" +
          "Fonte: Figura 1 do TCC.\n\n" +
          AVISO_EDUCATIVO,
      },
      {
        moduloId: engasgos.id,
        ordem: 6,
        titulo: "Conclusao",
        texto:
          "Neste modulo voce conheceu os sinais que ajudam a reconhecer um " +
          "engasgo e a sequencia recomendada para o atendimento inicial.\n\n" +
          "O proximo passo e a simulacao, na qual voce vai analisar uma " +
          "situacao, escolher uma conduta e receber uma explicacao sobre a " +
          "sua decisao.\n\n" +
          AVISO_EDUCATIVO,
      },
    ],
  });

  // ---------------------------------------------------------------------------
  // 5) CONTEUDOS DOS DEMAIS MODULOS (espacos reservados)
  // ---------------------------------------------------------------------------
  console.log("Criando conteudos dos demais modulos...");

  // Os quatro modulos restantes recebem a mesma estrutura de topicos, com os
  // textos aguardando elaboracao. Assim a navegacao e o calculo de progresso
  // ja funcionam por completo na demonstracao.
  const outrosModulos = [parada, hemorragias, queimaduras, convulsoes];

  for (const modulo of outrosModulos) {
    await prisma.conteudo.createMany({
      data: [
        {
          moduloId: modulo.id,
          ordem: 1,
          titulo: "Introducao",
          texto: PENDENTE,
        },
        {
          moduloId: modulo.id,
          ordem: 2,
          titulo: "Reconhecimento da situacao",
          texto: PENDENTE,
        },
        {
          moduloId: modulo.id,
          ordem: 3,
          titulo: "Cuidados iniciais",
          texto: PENDENTE,
        },
      ],
    });
  }

  // ---------------------------------------------------------------------------
  // 6) A SIMULACAO COMPLETA DO MODULO ENGASGOS
  // ---------------------------------------------------------------------------
  // Esta e a parte mais importante do seed: uma simulacao de verdade, com
  // etapas encadeadas e caminhos diferentes conforme a decisao do usuario.
  console.log("Criando a simulacao de Engasgos...");

  const simulacao = await prisma.simulacao.create({
    data: {
      moduloId: engasgos.id,
      titulo: "Simulacao: Engasgos",
      descricao:
        "Analise a situacao apresentada e escolha a alternativa que " +
        "considerar mais adequada. Conteudo educativo - requer validacao da " +
        "orientacao de Enfermagem.",
      ativa: true,
    },
  });

  // --- As etapas ---
  // Criamos primeiro TODAS as etapas e so depois as alternativas. O motivo:
  // uma alternativa precisa do id da proxima etapa, que so existe depois que
  // aquela etapa foi criada.

  // Etapa 1 - o cenario do prototipo da Figura 5 do TCC.
  const etapa1 = await prisma.etapaSimulacao.create({
    data: {
      simulacaoId: simulacao.id,
      titulo: "Refeicao com Colega",
      texto:
        "Durante uma refeicao, o seu colega de mesa de repente para de " +
        "comer, leva as maos ao pescoco e demonstra grande dificuldade para " +
        "respirar. Ele tenta tossir de forma debilitada, mas nenhum som e " +
        "emitido e ele nao consegue responder se voce perguntar o que houve. " +
        "O rosto dele comeca a apresentar sinais de vermelhidao.",
      ehInicial: true, // <- por aqui a simulacao comeca
      ehFinal: false,
    },
  });

  // Etapa 2 - para onde vao as decisoes inadequadas (a situacao se agrava).
  const etapa2 = await prisma.etapaSimulacao.create({
    data: {
      simulacaoId: simulacao.id,
      titulo: "A obstrucao continua",
      texto:
        "O tempo passa e a situacao nao melhora. A pessoa continua sem " +
        "conseguir falar nem emitir som, e os labios comecam a ficar " +
        "azulados - um dos sinais de obstrucao estudados no modulo.\n\n" +
        "Voce precisa decidir novamente.",
      ehInicial: false,
      ehFinal: false,
    },
  });

  // Etapa 3 - o acionamento do socorro, passo 4 do fluxograma da Figura 1.
  const etapa3 = await prisma.etapaSimulacao.create({
    data: {
      simulacaoId: simulacao.id,
      titulo: "Acionamento do socorro",
      texto:
        "Outras pessoas no local perceberam a situacao e perguntam como " +
        "podem ajudar. Segundo o fluxograma de atendimento inicial, acionar " +
        "o servico de emergencia e um dos passos do atendimento.\n\n" +
        "Qual a melhor forma de organizar o socorro neste momento?",
      ehInicial: false,
      ehFinal: false,
    },
  });

  // Etapa 4 - o encerramento. Marcada como final: ao chegar aqui, o sistema
  // registra a simulacao como concluida.
  const etapa4 = await prisma.etapaSimulacao.create({
    data: {
      simulacaoId: simulacao.id,
      titulo: "Encerramento da simulacao",
      texto:
        "A equipe do SAMU chega ao local e assume o atendimento.\n\n" +
        "Nesta simulacao voce exercitou os passos do atendimento inicial: " +
        "reconhecer a situacao, avaliar a vitima, acionar o servico de " +
        "emergencia e agir dentro dos limites da sua capacitacao.\n\n" +
        AVISO_EDUCATIVO,
      ehInicial: false,
      ehFinal: true, // <- chegando aqui, a simulacao termina
    },
  });

  // --- As alternativas da Etapa 1 ---
  // Os textos das quatro alternativas sao os do prototipo da Figura 5 do TCC.
  // Repare no campo proximaEtapaId: ele e quem encadeia a simulacao e faz
  // decisoes diferentes levarem a caminhos diferentes.
  console.log("Criando alternativas...");

  await prisma.alternativa.createMany({
    data: [
      {
        etapaId: etapa1.id,
        ordem: 1,
        texto:
          "Oferecer um copo d'agua imediatamente para ajudar a empurrar o " +
          "alimento que esta obstruindo a passagem.",
        correta: false,
        feedback:
          "Nao foi a conduta mais adequada. A pessoa nao consegue emitir " +
          "som nem responder, o que indica obstrucao grave da via aerea. " +
          "Oferecer liquido a alguem que nao consegue respirar nem falar nao " +
          "resolve a obstrucao e atrasa o atendimento.",
        proximaEtapaId: etapa2.id, // leva ao agravamento
      },
      {
        etapaId: etapa1.id,
        ordem: 2,
        texto:
          "Posicionar-se por tras da pessoa e realizar compressoes " +
          "abdominais rapidas (Manobra de Heimlich).",
        correta: true, // alternativa indicada como correta no prototipo do TCC
        feedback:
          "Decisao adequada. Os sinais descritos - maos ao pescoco, " +
          "incapacidade de emitir som e de responder - correspondem ao " +
          "quadro de obstrucao grave apresentado no modulo. Nessa situacao, " +
          "a vitima nao consegue tossir de forma eficaz e precisa de " +
          "intervencao imediata.",
        proximaEtapaId: etapa3.id, // avanca para o acionamento do socorro
      },
      {
        etapaId: etapa1.id,
        ordem: 3,
        texto:
          "Deitar a pessoa de costas no chao e aplicar tapas fortes na " +
          "regiao do peito.",
        correta: false,
        feedback:
          "Nao foi a conduta mais adequada. O modulo alerta que golpes " +
          "aplicados de forma inadequada podem deslocar o objeto e piorar a " +
          "obstrucao. Alem disso, deitar a vitima nesse momento dificulta o " +
          "atendimento.",
        proximaEtapaId: etapa2.id,
      },
      {
        etapaId: etapa1.id,
        ordem: 4,
        texto:
          "Apenas sugerir que ela tente se acalmar e aguardar alguns minutos " +
          "para ver se o engasgo passa sozinho.",
        correta: false,
        feedback:
          "Nao foi a conduta mais adequada. Aguardar sem agir faz perder " +
          "tempo justamente quando a vitima ja apresenta sinais de obstrucao " +
          "grave. O fluxograma do atendimento inicial orienta avaliar a " +
          "vitima e acionar o socorro, nao aguardar passivamente.",
        proximaEtapaId: etapa2.id,
      },
    ],
  });

  // --- As alternativas da Etapa 2 ---
  // Repare que as duas levam a Etapa 3: mesmo errando, o usuario continua
  // aprendendo e segue na simulacao.
  await prisma.alternativa.createMany({
    data: [
      {
        etapaId: etapa2.id,
        ordem: 1,
        texto:
          "Posicionar-se por tras da pessoa e realizar compressoes " +
          "abdominais rapidas (Manobra de Heimlich).",
        correta: true,
        feedback:
          "Decisao adequada. Diante da piora dos sinais, manter a espera nao " +
          "era uma opcao segura.",
        proximaEtapaId: etapa3.id,
      },
      {
        etapaId: etapa2.id,
        ordem: 2,
        texto: "Continuar aguardando para ver se a situacao se resolve sozinha.",
        correta: false,
        feedback:
          "Nao foi a conduta mais adequada. Os sinais descritos indicam " +
          "agravamento do quadro, e nao melhora. Continuar aguardando apenas " +
          "faz perder tempo.",
        proximaEtapaId: etapa3.id,
      },
    ],
  });

  // --- As alternativas da Etapa 3 ---
  // Ambas levam a etapa final, que encerra a simulacao.
  await prisma.alternativa.createMany({
    data: [
      {
        etapaId: etapa3.id,
        ordem: 1,
        texto:
          "Pedir que outra pessoa ligue imediatamente para o SAMU (192) " +
          "enquanto voce permanece com a vitima.",
        correta: true,
        feedback:
          "Decisao adequada. Quando ha mais de uma pessoa no local, uma pode " +
          "acionar o socorro enquanto a outra permanece com a vitima, sem " +
          "interromper o atendimento.",
        proximaEtapaId: etapa4.id,
      },
      {
        etapaId: etapa3.id,
        ordem: 2,
        texto:
          "Interromper o que esta fazendo, afastar-se da vitima e ligar voce " +
          "mesmo para o servico de emergencia.",
        correta: false,
        feedback:
          "Havia uma opcao melhor. Como outras pessoas estavam disponiveis, " +
          "uma delas poderia acionar o socorro, evitando a interrupcao do " +
          "atendimento. Acionar o SAMU continua sendo essencial - a questao " +
          "aqui e quem faz o que.",
        proximaEtapaId: etapa4.id,
      },
    ],
  });

  // A Etapa 4 nao recebe alternativas: ela so apresenta o encerramento.

  // ---------------------------------------------------------------------------
  // 7) SIMULACOES DOS DEMAIS MODULOS (espacos reservados)
  // ---------------------------------------------------------------------------
  // Criadas como INATIVAS (ativa: false) para nao aparecerem na plataforma
  // enquanto nao tiverem etapas e conteudo validado.
  console.log("Criando espacos reservados para as demais simulacoes...");

  for (const modulo of outrosModulos) {
    await prisma.simulacao.create({
      data: {
        moduloId: modulo.id,
        titulo: `Simulacao: ${modulo.titulo}`,
        descricao: PENDENTE,
        ativa: false,
      },
    });
  }

  // ---------------------------------------------------------------------------
  // RESUMO
  // ---------------------------------------------------------------------------
  const totalModulos = await prisma.modulo.count();
  const totalConteudos = await prisma.conteudo.count();
  const totalEtapas = await prisma.etapaSimulacao.count();
  const totalAlternativas = await prisma.alternativa.count();

  console.log("\n=================================================");
  console.log("  Dados inseridos com sucesso!");
  console.log("=================================================");
  console.log(`  Modulos:      ${totalModulos}`);
  console.log(`  Conteudos:    ${totalConteudos}`);
  console.log(`  Etapas:       ${totalEtapas}`);
  console.log(`  Alternativas: ${totalAlternativas}`);
  console.log("-------------------------------------------------");
  console.log("  ACESSOS DE DEMONSTRACAO (apenas ambiente local)");
  console.log("  Admin: admin@reviva.local / admin123");
  console.log("  Aluno: aluno@reviva.local / aluno123");
  console.log("=================================================\n");
  console.log(`  (administrador criado com id ${admin.id})`);
}

// Executa a funcao principal e trata eventuais erros.
main()
  .catch((erro) => {
    console.error("Erro ao inserir os dados:", erro);
    process.exit(1); // encerra indicando falha
  })
  .finally(async () => {
    // Fecha a conexao com o banco para o script poder terminar.
    await prisma.$disconnect();
  });
