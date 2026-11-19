// =============================================================================
// src/controllers/progressoController.js - Acompanhamento do progresso
// =============================================================================
// Atende os requisitos RF06, RF07, RF08, RF12 e RF13.
//
// REGRA IMPORTANTE: nenhum percentual e inventado ou fixo no codigo. Todos sao
// calculados na hora, contando os registros que existem no PostgreSQL.
//
// Como contamos o progresso de um modulo:
//   total      = quantidade de conteudos + quantidade de simulacoes do modulo
//   concluidos = conteudos marcados como concluidos + simulacoes concluidas
//   percentual = concluidos / total * 100
//
// A simulacao entra na conta porque, no prototipo do TCC (Figura 4), ela
// aparece como mais um item da lista de atividades do modulo.
// =============================================================================

import prisma from "../config/db.js";

// Funcao auxiliar: calcula a porcentagem evitando divisao por zero.
// Math.round arredonda para o inteiro mais proximo (62.5 -> 63).
function calcularPercentual(concluidos, total) {
  if (total === 0) return 0;
  return Math.round((concluidos / total) * 100);
}

// -----------------------------------------------------------------------------
// GET /api/progresso - progresso geral e por modulo (RF07, RF08, RF13)
// -----------------------------------------------------------------------------
export async function obterProgresso(req, res) {
  try {
    const usuarioId = req.usuario.id;

    // 1) Busca os modulos com seus conteudos e simulacoes, ja trazendo o
    //    progresso DESTE usuario em cada item.
    const modulos = await prisma.modulo.findMany({
      where: { ativo: true },
      orderBy: { ordem: "asc" },
      include: {
        conteudos: {
          select: {
            id: true,
            progresso: {
              where: { usuarioId },
              select: { concluido: true },
            },
          },
        },
        simulacoes: {
          where: { ativa: true },
          select: {
            id: true,
            progresso: {
              where: { usuarioId },
              select: { concluido: true },
            },
          },
        },
      },
    });

    // 2) Para cada modulo, conta quantos itens existem e quantos foram feitos.
    let totalGeral = 0;
    let concluidosGeral = 0;

    const progressoModulos = modulos.map((modulo) => {
      // Conta os conteudos concluidos.
      const conteudosConcluidos = modulo.conteudos.filter(
        (c) => c.progresso.length > 0 && c.progresso[0].concluido
      ).length;

      // Conta as simulacoes concluidas.
      const simulacoesConcluidas = modulo.simulacoes.filter(
        (s) => s.progresso.length > 0 && s.progresso[0].concluido
      ).length;

      const total = modulo.conteudos.length + modulo.simulacoes.length;
      const concluidos = conteudosConcluidos + simulacoesConcluidas;

      // Vai somando para o total geral da plataforma.
      totalGeral += total;
      concluidosGeral += concluidos;

      return {
        id: modulo.id,
        titulo: modulo.titulo,
        descricao: modulo.descricao,
        imagem: modulo.imagem,
        ordem: modulo.ordem,
        totalItens: total,
        itensConcluidos: concluidos,
        percentual: calcularPercentual(concluidos, total),
      };
    });

    // 3) Descobre onde o usuario parou, para o card "Continue de onde parou".
    //    Pegamos o conteudo acessado mais recentemente que AINDA nao foi
    //    concluido. E para isso que serve o campo ultimoAcesso (RF08).
    const ultimoConteudo = await prisma.progressoConteudo.findFirst({
      where: { usuarioId, concluido: false, ultimoAcesso: { not: null } },
      orderBy: { ultimoAcesso: "desc" },
      include: {
        conteudo: {
          select: {
            id: true,
            titulo: true,
            ordem: true,
            modulo: { select: { id: true, titulo: true } },
          },
        },
      },
    });

    // Se nao houver nada em andamento, sugerimos o primeiro modulo com itens
    // pendentes, para que o botao "Continuar" sempre leve a algum lugar util.
    let continuarDe = null;

    if (ultimoConteudo) {
      continuarDe = {
        tipo: "conteudo",
        conteudoId: ultimoConteudo.conteudo.id,
        titulo: ultimoConteudo.conteudo.titulo,
        modulo: ultimoConteudo.conteudo.modulo,
      };
    } else {
      const moduloPendente = progressoModulos.find(
        (m) => m.percentual < 100 && m.totalItens > 0
      );

      if (moduloPendente) {
        continuarDe = {
          tipo: "modulo",
          modulo: { id: moduloPendente.id, titulo: moduloPendente.titulo },
        };
      }
    }

    return res.json({
      geral: {
        totalItens: totalGeral,
        itensConcluidos: concluidosGeral,
        percentual: calcularPercentual(concluidosGeral, totalGeral),
      },
      modulos: progressoModulos,
      continuarDe,
    });
  } catch (error) {
    console.error("Erro ao obter progresso:", error);
    return res.status(500).json({ mensagem: "Erro ao calcular o progresso." });
  }
}

// -----------------------------------------------------------------------------
// POST /api/progresso/conteudo/:conteudoId - marca conteudo concluido (RF06)
// -----------------------------------------------------------------------------
export async function concluirConteudo(req, res) {
  try {
    const conteudoId = Number(req.params.conteudoId);

    if (!conteudoId) {
      return res.status(400).json({ mensagem: "Id do conteudo invalido." });
    }

    const conteudo = await prisma.conteudo.findUnique({
      where: { id: conteudoId },
    });

    if (!conteudo) {
      return res.status(404).json({ mensagem: "Conteudo nao encontrado." });
    }

    // upsert = "atualiza se existir, cria se nao existir".
    // Funciona por causa da restricao @@unique([usuarioId, conteudoId]) do
    // schema: ela garante que nunca havera dois registros para o mesmo par.
    const progresso = await prisma.progressoConteudo.upsert({
      where: {
        usuarioId_conteudoId: {
          usuarioId: req.usuario.id,
          conteudoId,
        },
      },
      update: {
        concluido: true,
        dataConclusao: new Date(),
        ultimoAcesso: new Date(),
      },
      create: {
        usuarioId: req.usuario.id,
        conteudoId,
        concluido: true,
        dataConclusao: new Date(),
        ultimoAcesso: new Date(),
      },
    });

    return res.json({
      mensagem: "Conteudo marcado como concluido.",
      progresso,
    });
  } catch (error) {
    console.error("Erro ao concluir conteudo:", error);
    return res.status(500).json({ mensagem: "Erro ao registrar a conclusao." });
  }
}

// -----------------------------------------------------------------------------
// DELETE /api/progresso/conteudo/:conteudoId - desmarca um conteudo
// -----------------------------------------------------------------------------
// Permite ao usuario corrigir um clique errado.
export async function desmarcarConteudo(req, res) {
  try {
    const conteudoId = Number(req.params.conteudoId);

    if (!conteudoId) {
      return res.status(400).json({ mensagem: "Id do conteudo invalido." });
    }

    await prisma.progressoConteudo.updateMany({
      where: { usuarioId: req.usuario.id, conteudoId },
      data: { concluido: false, dataConclusao: null },
    });

    return res.json({ mensagem: "Conteudo desmarcado." });
  } catch (error) {
    console.error("Erro ao desmarcar conteudo:", error);
    return res.status(500).json({ mensagem: "Erro ao desmarcar o conteudo." });
  }
}

// -----------------------------------------------------------------------------
// POST /api/progresso/simulacao/:simulacaoId - registra simulacao feita (RF12)
// -----------------------------------------------------------------------------
// Normalmente o proprio motor da simulacao ja marca a conclusao ao chegar na
// etapa final. Esta rota existe para atender explicitamente ao RF12 e para o
// caso de o frontend precisar confirmar a conclusao.
export async function concluirSimulacao(req, res) {
  try {
    const simulacaoId = Number(req.params.simulacaoId);

    if (!simulacaoId) {
      return res.status(400).json({ mensagem: "Id da simulacao invalido." });
    }

    const simulacao = await prisma.simulacao.findUnique({
      where: { id: simulacaoId },
    });

    if (!simulacao) {
      return res.status(404).json({ mensagem: "Simulacao nao encontrada." });
    }

    const progresso = await prisma.progressoSimulacao.upsert({
      where: {
        usuarioId_simulacaoId: {
          usuarioId: req.usuario.id,
          simulacaoId,
        },
      },
      update: {
        concluido: true,
        dataConclusao: new Date(),
        ultimoAcesso: new Date(),
      },
      create: {
        usuarioId: req.usuario.id,
        simulacaoId,
        concluido: true,
        dataInicio: new Date(),
        dataConclusao: new Date(),
        ultimoAcesso: new Date(),
      },
    });

    return res.json({
      mensagem: "Simulacao registrada como concluida.",
      progresso,
    });
  } catch (error) {
    console.error("Erro ao concluir simulacao:", error);
    return res.status(500).json({ mensagem: "Erro ao registrar a conclusao." });
  }
}
