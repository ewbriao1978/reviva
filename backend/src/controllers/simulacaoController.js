// =============================================================================
// src/controllers/simulacaoController.js - O motor das simulacoes
// =============================================================================
// Esta e a funcionalidade principal da REVIVA (RF09, RF10, RF11, RF12).
//
// COMO FUNCIONA O ENCADEAMENTO
// ----------------------------
// Uma simulacao e formada por ETAPAS. Cada etapa descreve uma situacao e
// oferece ALTERNATIVAS. Cada alternativa guarda:
//   - um feedback (a explicacao mostrada depois da escolha);
//   - o campo proximaEtapaId, que diz para onde aquela escolha leva.
//
// Como cada alternativa aponta para uma etapa diferente, duas decisoes na mesma
// situacao podem levar a caminhos distintos. Todo esse encadeamento esta nos
// DADOS, nunca no codigo: por isso as perguntas e alternativas vem do banco e
// nao estao escritas no React.
//
// A etapa marcada com ehInicial = true e onde a simulacao comeca.
// A etapa marcada com ehFinal = true encerra a simulacao.
// =============================================================================

import prisma from "../config/db.js";

// -----------------------------------------------------------------------------
// Funcao auxiliar: prepara uma etapa para ser enviada ao frontend.
// -----------------------------------------------------------------------------
// ATENCAO - ponto importante de seguranca:
// os campos "correta" e "feedback" das alternativas NAO sao enviados aqui.
// Se fossem, bastaria o usuario abrir as ferramentas do navegador e ler a
// resposta da API para descobrir a alternativa certa antes de escolher.
// Eles so sao revelados depois da decisao, na funcao responder().
function prepararEtapa(etapa) {
  return {
    id: etapa.id,
    titulo: etapa.titulo,
    texto: etapa.texto,
    imagem: etapa.imagem,
    ehFinal: etapa.ehFinal,
    alternativas: etapa.alternativas.map((alternativa) => ({
      id: alternativa.id,
      texto: alternativa.texto,
      ordem: alternativa.ordem,
    })),
  };
}

// -----------------------------------------------------------------------------
// GET /api/simulacoes/modulo/:moduloId - simulacoes de um modulo (RF09)
// -----------------------------------------------------------------------------
export async function listarPorModulo(req, res) {
  try {
    const moduloId = Number(req.params.moduloId);

    if (!moduloId) {
      return res.status(400).json({ mensagem: "Id do modulo invalido." });
    }

    const simulacoes = await prisma.simulacao.findMany({
      where: { moduloId, ativa: true },
      include: {
        progresso: {
          where: { usuarioId: req.usuario.id },
          select: { concluido: true, dataConclusao: true },
        },
      },
    });

    const resposta = simulacoes.map((simulacao) => ({
      id: simulacao.id,
      titulo: simulacao.titulo,
      descricao: simulacao.descricao,
      imagem: simulacao.imagem,
      concluida: simulacao.progresso.length > 0 && simulacao.progresso[0].concluido,
    }));

    return res.json(resposta);
  } catch (error) {
    console.error("Erro ao listar simulacoes:", error);
    return res.status(500).json({ mensagem: "Erro ao buscar as simulacoes." });
  }
}

// -----------------------------------------------------------------------------
// GET /api/simulacoes - todas as simulacoes disponiveis (pagina "Simulacoes")
// -----------------------------------------------------------------------------
export async function listarSimulacoes(req, res) {
  try {
    const simulacoes = await prisma.simulacao.findMany({
      where: { ativa: true },
      include: {
        modulo: { select: { id: true, titulo: true, ordem: true } },
        progresso: {
          where: { usuarioId: req.usuario.id },
          select: { concluido: true },
        },
      },
      orderBy: { modulo: { ordem: "asc" } },
    });

    const resposta = simulacoes.map((simulacao) => ({
      id: simulacao.id,
      titulo: simulacao.titulo,
      descricao: simulacao.descricao,
      imagem: simulacao.imagem,
      modulo: simulacao.modulo,
      concluida: simulacao.progresso.length > 0 && simulacao.progresso[0].concluido,
    }));

    return res.json(resposta);
  } catch (error) {
    console.error("Erro ao listar simulacoes:", error);
    return res.status(500).json({ mensagem: "Erro ao buscar as simulacoes." });
  }
}

// -----------------------------------------------------------------------------
// GET /api/simulacoes/:id - inicia ou retoma uma simulacao (RF09)
// -----------------------------------------------------------------------------
export async function iniciarSimulacao(req, res) {
  try {
    const id = Number(req.params.id);

    if (!id) {
      return res.status(400).json({ mensagem: "Id invalido." });
    }

    const simulacao = await prisma.simulacao.findUnique({
      where: { id },
      include: {
        modulo: { select: { id: true, titulo: true } },
        etapas: {
          include: { alternativas: { orderBy: { ordem: "asc" } } },
        },
      },
    });

    if (!simulacao) {
      return res.status(404).json({ mensagem: "Simulacao nao encontrada." });
    }

    if (simulacao.etapas.length === 0) {
      return res.status(400).json({
        mensagem: "Esta simulacao ainda nao possui etapas cadastradas.",
      });
    }

    // Busca o progresso deste usuario nesta simulacao (se ja houver).
    const progresso = await prisma.progressoSimulacao.findUnique({
      where: {
        usuarioId_simulacaoId: {
          usuarioId: req.usuario.id,
          simulacaoId: id,
        },
      },
    });

    // Decide em qual etapa o usuario entra:
    //   - se ele parou no meio, volta para onde estava (etapaAtualId);
    //   - caso contrario, comeca pela etapa marcada como inicial.
    let etapaAtual = null;

    if (progresso && progresso.etapaAtualId && !progresso.concluido) {
      etapaAtual = simulacao.etapas.find((e) => e.id === progresso.etapaAtualId);
    }

    if (!etapaAtual) {
      etapaAtual = simulacao.etapas.find((e) => e.ehInicial);
    }

    // Se ninguem marcou a etapa inicial no cadastro, o motor nao sabe comecar.
    if (!etapaAtual) {
      return res.status(400).json({
        mensagem: "Esta simulacao nao possui uma etapa inicial definida.",
      });
    }

    // Cria ou atualiza o registro de progresso, marcando o inicio.
    await prisma.progressoSimulacao.upsert({
      where: {
        usuarioId_simulacaoId: {
          usuarioId: req.usuario.id,
          simulacaoId: id,
        },
      },
      update: { ultimoAcesso: new Date(), etapaAtualId: etapaAtual.id },
      create: {
        usuarioId: req.usuario.id,
        simulacaoId: id,
        etapaAtualId: etapaAtual.id,
        concluido: false,
        dataInicio: new Date(),
        ultimoAcesso: new Date(),
      },
    });

    return res.json({
      id: simulacao.id,
      titulo: simulacao.titulo,
      descricao: simulacao.descricao,
      imagem: simulacao.imagem,
      modulo: simulacao.modulo,
      totalEtapas: simulacao.etapas.length,
      concluida: progresso ? progresso.concluido : false,
      etapa: prepararEtapa(etapaAtual),
    });
  } catch (error) {
    console.error("Erro ao iniciar simulacao:", error);
    return res.status(500).json({ mensagem: "Erro ao abrir a simulacao." });
  }
}

// -----------------------------------------------------------------------------
// POST /api/simulacoes/responder - processa a escolha do usuario (RF10 a RF12)
// -----------------------------------------------------------------------------
// Este e o coracao do motor. Recebe o id da alternativa escolhida e devolve:
//   - o feedback daquela escolha;
//   - se a alternativa era a correta;
//   - a proxima etapa (ou nada, se a simulacao terminou).
export async function responder(req, res) {
  try {
    const { alternativaId } = req.body;

    if (!alternativaId) {
      return res.status(400).json({ mensagem: "Informe a alternativa escolhida." });
    }

    // Busca a alternativa junto com a etapa a que ela pertence e com a etapa
    // para onde ela leva (incluindo as alternativas dessa proxima etapa).
    const alternativa = await prisma.alternativa.findUnique({
      where: { id: Number(alternativaId) },
      include: {
        etapa: { select: { id: true, simulacaoId: true } },
        proximaEtapa: {
          include: { alternativas: { orderBy: { ordem: "asc" } } },
        },
      },
    });

    if (!alternativa) {
      return res.status(404).json({ mensagem: "Alternativa nao encontrada." });
    }

    const simulacaoId = alternativa.etapa.simulacaoId;
    const proximaEtapa = alternativa.proximaEtapa;

    // A simulacao termina quando:
    //   a) a alternativa nao aponta para nenhuma proxima etapa; ou
    //   b) a proxima etapa esta marcada como final.
    const terminou = !proximaEtapa || proximaEtapa.ehFinal === true;

    // Atualiza o progresso do usuario nesta simulacao.
    const dadosProgresso = {
      ultimoAcesso: new Date(),
      // Avanca o ponteiro para a proxima etapa. Se nao houver, fica na atual.
      etapaAtualId: proximaEtapa ? proximaEtapa.id : alternativa.etapa.id,
    };

    if (terminou) {
      dadosProgresso.concluido = true;
      dadosProgresso.dataConclusao = new Date();
    }

    await prisma.progressoSimulacao.upsert({
      where: {
        usuarioId_simulacaoId: {
          usuarioId: req.usuario.id,
          simulacaoId,
        },
      },
      update: dadosProgresso,
      create: {
        usuarioId: req.usuario.id,
        simulacaoId,
        dataInicio: new Date(),
        ...dadosProgresso,
      },
    });

    // Agora sim revelamos o feedback e se a escolha estava correta (RF11).
    return res.json({
      correta: alternativa.correta,
      feedback: alternativa.feedback,
      concluida: terminou,
      // Se terminou em uma etapa final, ela ainda e enviada para que o
      // frontend mostre a mensagem de encerramento.
      proximaEtapa: proximaEtapa ? prepararEtapa(proximaEtapa) : null,
    });
  } catch (error) {
    console.error("Erro ao responder simulacao:", error);
    return res.status(500).json({ mensagem: "Erro ao registrar a resposta." });
  }
}

// -----------------------------------------------------------------------------
// POST /api/simulacoes/:id/reiniciar - refaz a simulacao do zero
// -----------------------------------------------------------------------------
// Atende ao caso de uso "Repetir simulacao" (relacao <<extend>> no diagrama de
// casos de uso do TCC). Como existe a restricao @@unique(usuarioId,
// simulacaoId), nao criamos um registro novo: apenas zeramos o existente.
export async function reiniciarSimulacao(req, res) {
  try {
    const id = Number(req.params.id);

    if (!id) {
      return res.status(400).json({ mensagem: "Id invalido." });
    }

    // Procura a etapa inicial para onde o usuario vai voltar.
    const etapaInicial = await prisma.etapaSimulacao.findFirst({
      where: { simulacaoId: id, ehInicial: true },
    });

    if (!etapaInicial) {
      return res.status(400).json({
        mensagem: "Esta simulacao nao possui uma etapa inicial definida.",
      });
    }

    await prisma.progressoSimulacao.upsert({
      where: {
        usuarioId_simulacaoId: { usuarioId: req.usuario.id, simulacaoId: id },
      },
      update: {
        etapaAtualId: etapaInicial.id,
        concluido: false,
        dataConclusao: null, // apaga a conclusao anterior
        dataInicio: new Date(),
        ultimoAcesso: new Date(),
      },
      create: {
        usuarioId: req.usuario.id,
        simulacaoId: id,
        etapaAtualId: etapaInicial.id,
        concluido: false,
        dataInicio: new Date(),
        ultimoAcesso: new Date(),
      },
    });

    return res.json({ mensagem: "Simulacao reiniciada." });
  } catch (error) {
    console.error("Erro ao reiniciar simulacao:", error);
    return res.status(500).json({ mensagem: "Erro ao reiniciar a simulacao." });
  }
}

// =============================================================================
// AREA ADMINISTRATIVA (RF16) - cadastro de simulacoes, etapas e alternativas
// =============================================================================

// -----------------------------------------------------------------------------
// GET /api/simulacoes/:id/completa - simulacao inteira para edicao (ADMIN)
// -----------------------------------------------------------------------------
// Diferente da rota de jogar, esta traz TUDO, inclusive quais alternativas sao
// corretas e seus feedbacks, porque o administrador precisa ver e editar.
export async function buscarSimulacaoCompleta(req, res) {
  try {
    const id = Number(req.params.id);

    const simulacao = await prisma.simulacao.findUnique({
      where: { id },
      include: {
        modulo: { select: { id: true, titulo: true } },
        etapas: {
          include: { alternativas: { orderBy: { ordem: "asc" } } },
          orderBy: { id: "asc" },
        },
      },
    });

    if (!simulacao) {
      return res.status(404).json({ mensagem: "Simulacao nao encontrada." });
    }

    return res.json(simulacao);
  } catch (error) {
    console.error("Erro ao buscar simulacao:", error);
    return res.status(500).json({ mensagem: "Erro ao buscar a simulacao." });
  }
}

// -----------------------------------------------------------------------------
// POST /api/simulacoes - cadastra uma simulacao (ADMIN)
// -----------------------------------------------------------------------------
export async function criarSimulacao(req, res) {
  try {
    const { moduloId, titulo, descricao, imagem, ativa } = req.body;

    if (!moduloId || !titulo || !descricao) {
      return res.status(400).json({
        mensagem: "Informe moduloId, titulo e descricao.",
      });
    }

    const modulo = await prisma.modulo.findUnique({
      where: { id: Number(moduloId) },
    });

    if (!modulo) {
      return res.status(404).json({ mensagem: "Modulo nao encontrado." });
    }

    const simulacao = await prisma.simulacao.create({
      data: {
        moduloId: Number(moduloId),
        titulo,
        descricao,
        imagem: imagem || null,
        ativa: ativa ?? true,
      },
    });

    return res.status(201).json({
      mensagem: "Simulacao criada com sucesso.",
      simulacao,
    });
  } catch (error) {
    console.error("Erro ao criar simulacao:", error);
    return res.status(500).json({ mensagem: "Erro ao criar a simulacao." });
  }
}

// -----------------------------------------------------------------------------
// DELETE /api/simulacoes/:id - exclui uma simulacao (ADMIN)
// -----------------------------------------------------------------------------
export async function excluirSimulacao(req, res) {
  try {
    const id = Number(req.params.id);

    const existe = await prisma.simulacao.findUnique({ where: { id } });

    if (!existe) {
      return res.status(404).json({ mensagem: "Simulacao nao encontrada." });
    }

    // Etapas e alternativas saem junto (onDelete: Cascade).
    await prisma.simulacao.delete({ where: { id } });

    return res.json({ mensagem: "Simulacao excluida com sucesso." });
  } catch (error) {
    console.error("Erro ao excluir simulacao:", error);
    return res.status(500).json({ mensagem: "Erro ao excluir a simulacao." });
  }
}

// -----------------------------------------------------------------------------
// POST /api/simulacoes/etapas - cadastra uma etapa (ADMIN)
// -----------------------------------------------------------------------------
export async function criarEtapa(req, res) {
  try {
    const { simulacaoId, titulo, texto, imagem, ehInicial, ehFinal } = req.body;

    if (!simulacaoId || !texto) {
      return res.status(400).json({ mensagem: "Informe simulacaoId e texto." });
    }

    const simulacao = await prisma.simulacao.findUnique({
      where: { id: Number(simulacaoId) },
    });

    if (!simulacao) {
      return res.status(404).json({ mensagem: "Simulacao nao encontrada." });
    }

    // Uma simulacao so pode ter UMA etapa inicial. Se esta nova for marcada
    // como inicial, desmarcamos a anterior para o motor nao ficar em duvida
    // sobre por onde comecar.
    if (ehInicial === true) {
      await prisma.etapaSimulacao.updateMany({
        where: { simulacaoId: Number(simulacaoId), ehInicial: true },
        data: { ehInicial: false },
      });
    }

    const etapa = await prisma.etapaSimulacao.create({
      data: {
        simulacaoId: Number(simulacaoId),
        titulo: titulo || null,
        texto,
        imagem: imagem || null,
        ehInicial: ehInicial ?? false,
        ehFinal: ehFinal ?? false,
      },
    });

    return res.status(201).json({ mensagem: "Etapa criada com sucesso.", etapa });
  } catch (error) {
    console.error("Erro ao criar etapa:", error);
    return res.status(500).json({ mensagem: "Erro ao criar a etapa." });
  }
}

// -----------------------------------------------------------------------------
// DELETE /api/simulacoes/etapas/:id - exclui uma etapa (ADMIN)
// -----------------------------------------------------------------------------
export async function excluirEtapa(req, res) {
  try {
    const id = Number(req.params.id);

    const existe = await prisma.etapaSimulacao.findUnique({ where: { id } });

    if (!existe) {
      return res.status(404).json({ mensagem: "Etapa nao encontrada." });
    }

    // As alternativas DESTA etapa saem junto (Cascade). Ja as alternativas de
    // outras etapas que apontavam para ca ficam com proximaEtapaId vazio
    // (SetNull), o que faz a simulacao terminar naquele ponto em vez de quebrar.
    await prisma.etapaSimulacao.delete({ where: { id } });

    return res.json({ mensagem: "Etapa excluida com sucesso." });
  } catch (error) {
    console.error("Erro ao excluir etapa:", error);
    return res.status(500).json({ mensagem: "Erro ao excluir a etapa." });
  }
}

// -----------------------------------------------------------------------------
// POST /api/simulacoes/alternativas - cadastra uma alternativa (ADMIN)
// -----------------------------------------------------------------------------
export async function criarAlternativa(req, res) {
  try {
    const { etapaId, texto, feedback, correta, proximaEtapaId, ordem } = req.body;

    if (!etapaId || !texto || !feedback) {
      return res.status(400).json({
        mensagem: "Informe etapaId, texto e feedback.",
      });
    }

    const etapa = await prisma.etapaSimulacao.findUnique({
      where: { id: Number(etapaId) },
    });

    if (!etapa) {
      return res.status(404).json({ mensagem: "Etapa nao encontrada." });
    }

    const alternativa = await prisma.alternativa.create({
      data: {
        etapaId: Number(etapaId),
        texto,
        feedback,
        correta: correta ?? false,
        // Se nao informar, a alternativa encerra a simulacao.
        proximaEtapaId: proximaEtapaId ? Number(proximaEtapaId) : null,
        ordem: Number(ordem) || 0,
      },
    });

    return res.status(201).json({
      mensagem: "Alternativa criada com sucesso.",
      alternativa,
    });
  } catch (error) {
    console.error("Erro ao criar alternativa:", error);
    return res.status(500).json({ mensagem: "Erro ao criar a alternativa." });
  }
}

// -----------------------------------------------------------------------------
// PUT /api/simulacoes/alternativas/:id - edita uma alternativa (ADMIN)
// -----------------------------------------------------------------------------
export async function atualizarAlternativa(req, res) {
  try {
    const id = Number(req.params.id);
    const { texto, feedback, correta, proximaEtapaId, ordem } = req.body;

    const existe = await prisma.alternativa.findUnique({ where: { id } });

    if (!existe) {
      return res.status(404).json({ mensagem: "Alternativa nao encontrada." });
    }

    const dados = {};
    if (texto !== undefined) dados.texto = texto;
    if (feedback !== undefined) dados.feedback = feedback;
    if (correta !== undefined) dados.correta = correta;
    if (ordem !== undefined) dados.ordem = Number(ordem);
    if (proximaEtapaId !== undefined) {
      dados.proximaEtapaId = proximaEtapaId ? Number(proximaEtapaId) : null;
    }

    const alternativa = await prisma.alternativa.update({
      where: { id },
      data: dados,
    });

    return res.json({
      mensagem: "Alternativa atualizada com sucesso.",
      alternativa,
    });
  } catch (error) {
    console.error("Erro ao atualizar alternativa:", error);
    return res.status(500).json({ mensagem: "Erro ao atualizar a alternativa." });
  }
}

// -----------------------------------------------------------------------------
// DELETE /api/simulacoes/alternativas/:id - exclui uma alternativa (ADMIN)
// -----------------------------------------------------------------------------
export async function excluirAlternativa(req, res) {
  try {
    const id = Number(req.params.id);

    const existe = await prisma.alternativa.findUnique({ where: { id } });

    if (!existe) {
      return res.status(404).json({ mensagem: "Alternativa nao encontrada." });
    }

    await prisma.alternativa.delete({ where: { id } });

    return res.json({ mensagem: "Alternativa excluida com sucesso." });
  } catch (error) {
    console.error("Erro ao excluir alternativa:", error);
    return res.status(500).json({ mensagem: "Erro ao excluir a alternativa." });
  }
}
