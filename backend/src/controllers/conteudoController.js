// =============================================================================
// src/controllers/conteudoController.js - Conteudos educativos dos modulos
// =============================================================================
// Atende o RF05 (apresentar os conteudos de cada modulo) e o RF15 (o
// administrador gerencia os conteudos educativos).
// =============================================================================

import prisma from "../config/db.js";

// -----------------------------------------------------------------------------
// GET /api/conteudos/modulo/:moduloId - conteudos de um modulo (RF05)
// -----------------------------------------------------------------------------
export async function listarPorModulo(req, res) {
  try {
    const moduloId = Number(req.params.moduloId);

    if (!moduloId) {
      return res.status(400).json({ mensagem: "Id do modulo invalido." });
    }

    const conteudos = await prisma.conteudo.findMany({
      where: { moduloId },
      orderBy: { ordem: "asc" },
      // Inclui o progresso APENAS do usuario que fez o pedido, para a tela
      // poder mostrar quais conteudos ele ja concluiu.
      include: {
        progresso: {
          where: { usuarioId: req.usuario.id },
          select: { concluido: true, dataConclusao: true },
        },
      },
    });

    // O Prisma devolve "progresso" como uma lista (porque a relacao e 1:N).
    // Como filtramos por um unico usuario, a lista tem 0 ou 1 item.
    // Aqui transformamos isso em um simples true/false, bem mais facil de usar
    // no React.
    const resposta = conteudos.map((conteudo) => ({
      id: conteudo.id,
      titulo: conteudo.titulo,
      ordem: conteudo.ordem,
      imagem: conteudo.imagem,
      concluido: conteudo.progresso.length > 0 && conteudo.progresso[0].concluido,
    }));

    return res.json(resposta);
  } catch (error) {
    console.error("Erro ao listar conteudos:", error);
    return res.status(500).json({ mensagem: "Erro ao buscar os conteudos." });
  }
}

// -----------------------------------------------------------------------------
// GET /api/conteudos/:id - abre um conteudo para leitura (RF05)
// -----------------------------------------------------------------------------
export async function buscarConteudo(req, res) {
  try {
    const id = Number(req.params.id);

    if (!id) {
      return res.status(400).json({ mensagem: "Id invalido." });
    }

    const conteudo = await prisma.conteudo.findUnique({
      where: { id },
      include: {
        modulo: { select: { id: true, titulo: true } },
        progresso: {
          where: { usuarioId: req.usuario.id },
          select: { concluido: true },
        },
      },
    });

    if (!conteudo) {
      return res.status(404).json({ mensagem: "Conteudo nao encontrado." });
    }

    // Registra que o usuario ABRIU este conteudo agora.
    // E isso que alimenta o card "Continue de onde parou" do painel (RF08).
    //
    // O upsert resolve dois casos de uma vez:
    //   - se ja existe um registro de progresso, atualiza o ultimoAcesso;
    //   - se nao existe, cria um novo (ainda nao concluido).
    // Ele depende do @@unique([usuarioId, conteudoId]) do schema.
    await prisma.progressoConteudo.upsert({
      where: {
        usuarioId_conteudoId: {
          usuarioId: req.usuario.id,
          conteudoId: id,
        },
      },
      update: { ultimoAcesso: new Date() },
      create: {
        usuarioId: req.usuario.id,
        conteudoId: id,
        concluido: false,
        ultimoAcesso: new Date(),
      },
    });

    return res.json({
      id: conteudo.id,
      titulo: conteudo.titulo,
      texto: conteudo.texto,
      imagem: conteudo.imagem,
      ordem: conteudo.ordem,
      modulo: conteudo.modulo,
      concluido: conteudo.progresso.length > 0 && conteudo.progresso[0].concluido,
    });
  } catch (error) {
    console.error("Erro ao buscar conteudo:", error);
    return res.status(500).json({ mensagem: "Erro ao buscar o conteudo." });
  }
}

// -----------------------------------------------------------------------------
// POST /api/conteudos - cadastra um conteudo (somente ADMIN)
// -----------------------------------------------------------------------------
export async function criarConteudo(req, res) {
  try {
    const { moduloId, titulo, texto, imagem, ordem } = req.body;

    if (!moduloId || !titulo || !texto) {
      return res.status(400).json({
        mensagem: "Informe moduloId, titulo e texto.",
      });
    }

    // Confere se o modulo existe antes de criar o conteudo.
    // Sem isso, o banco devolveria um erro de chave estrangeira pouco claro.
    const modulo = await prisma.modulo.findUnique({
      where: { id: Number(moduloId) },
    });

    if (!modulo) {
      return res.status(404).json({ mensagem: "Modulo nao encontrado." });
    }

    const conteudo = await prisma.conteudo.create({
      data: {
        moduloId: Number(moduloId),
        titulo,
        texto,
        imagem: imagem || null,
        ordem: Number(ordem) || 0,
      },
    });

    return res.status(201).json({
      mensagem: "Conteudo criado com sucesso.",
      conteudo,
    });
  } catch (error) {
    console.error("Erro ao criar conteudo:", error);
    return res.status(500).json({ mensagem: "Erro ao criar o conteudo." });
  }
}

// -----------------------------------------------------------------------------
// PUT /api/conteudos/:id - edita um conteudo (somente ADMIN)
// -----------------------------------------------------------------------------
export async function atualizarConteudo(req, res) {
  try {
    const id = Number(req.params.id);
    const { titulo, texto, imagem, ordem } = req.body;

    if (!id) {
      return res.status(400).json({ mensagem: "Id invalido." });
    }

    const existe = await prisma.conteudo.findUnique({ where: { id } });

    if (!existe) {
      return res.status(404).json({ mensagem: "Conteudo nao encontrado." });
    }

    const dados = {};
    if (titulo !== undefined) dados.titulo = titulo;
    if (texto !== undefined) dados.texto = texto;
    if (imagem !== undefined) dados.imagem = imagem;
    if (ordem !== undefined) dados.ordem = Number(ordem);

    const conteudo = await prisma.conteudo.update({ where: { id }, data: dados });

    return res.json({ mensagem: "Conteudo atualizado com sucesso.", conteudo });
  } catch (error) {
    console.error("Erro ao atualizar conteudo:", error);
    return res.status(500).json({ mensagem: "Erro ao atualizar o conteudo." });
  }
}

// -----------------------------------------------------------------------------
// DELETE /api/conteudos/:id - exclui um conteudo (somente ADMIN)
// -----------------------------------------------------------------------------
export async function excluirConteudo(req, res) {
  try {
    const id = Number(req.params.id);

    if (!id) {
      return res.status(400).json({ mensagem: "Id invalido." });
    }

    const existe = await prisma.conteudo.findUnique({ where: { id } });

    if (!existe) {
      return res.status(404).json({ mensagem: "Conteudo nao encontrado." });
    }

    // Os registros em progresso_conteudo saem junto (onDelete: Cascade).
    await prisma.conteudo.delete({ where: { id } });

    return res.json({ mensagem: "Conteudo excluido com sucesso." });
  } catch (error) {
    console.error("Erro ao excluir conteudo:", error);
    return res.status(500).json({ mensagem: "Erro ao excluir o conteudo." });
  }
}
