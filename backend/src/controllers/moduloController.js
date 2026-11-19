// =============================================================================
// src/controllers/moduloController.js - Os cinco modulos da plataforma
// =============================================================================
// Atende o RF04 (disponibilizar os modulos) para o usuario comum e parte do
// RF15 (o administrador gerencia os modulos e seus conteudos).
// =============================================================================

import prisma from "../config/db.js";

// -----------------------------------------------------------------------------
// GET /api/modulos - lista os modulos ativos (RF04)
// -----------------------------------------------------------------------------
export async function listarModulos(req, res) {
  try {
    const modulos = await prisma.modulo.findMany({
      where: { ativo: true }, // modulos desativados pelo admin nao aparecem
      orderBy: { ordem: "asc" }, // respeita a sequencia definida no cadastro
      include: {
        // _count pede ao Prisma a QUANTIDADE de registros relacionados,
        // sem trazer todos eles. E bem mais leve do que carregar a lista
        // inteira so para contar.
        _count: {
          select: { conteudos: true, simulacoes: true },
        },
      },
    });

    return res.json(modulos);
  } catch (error) {
    console.error("Erro ao listar modulos:", error);
    return res.status(500).json({ mensagem: "Erro ao buscar os modulos." });
  }
}

// -----------------------------------------------------------------------------
// GET /api/modulos/:id - um modulo com seus conteudos e simulacoes
// -----------------------------------------------------------------------------
export async function buscarModulo(req, res) {
  try {
    const id = Number(req.params.id);

    if (!id) {
      return res.status(400).json({ mensagem: "Id invalido." });
    }

    const modulo = await prisma.modulo.findUnique({
      where: { id },
      include: {
        // include traz os dados das tabelas relacionadas na mesma consulta.
        conteudos: {
          orderBy: { ordem: "asc" },
          // select limita quais colunas vem. Evitamos trazer o campo "texto"
          // inteiro aqui, que pode ser grande e so e necessario ao abrir o
          // conteudo especifico.
          select: { id: true, titulo: true, ordem: true, imagem: true },
        },
        simulacoes: {
          where: { ativa: true },
          select: { id: true, titulo: true, descricao: true, imagem: true },
        },
      },
    });

    if (!modulo) {
      return res.status(404).json({ mensagem: "Modulo nao encontrado." });
    }

    return res.json(modulo);
  } catch (error) {
    console.error("Erro ao buscar modulo:", error);
    return res.status(500).json({ mensagem: "Erro ao buscar o modulo." });
  }
}

// -----------------------------------------------------------------------------
// POST /api/modulos - cadastra um modulo (somente ADMIN)
// -----------------------------------------------------------------------------
export async function criarModulo(req, res) {
  try {
    const { titulo, descricao, imagem, ordem, ativo } = req.body;

    if (!titulo || !descricao) {
      return res.status(400).json({ mensagem: "Informe titulo e descricao." });
    }

    const modulo = await prisma.modulo.create({
      data: {
        titulo,
        descricao,
        imagem: imagem || null,
        // Se o admin nao informar a ordem, usamos 0 como padrao.
        ordem: Number(ordem) || 0,
        // O "??" só usa o valor da direita se o da esquerda for null/undefined.
        // Com "||" o valor false viraria true por engano.
        ativo: ativo ?? true,
      },
    });

    return res.status(201).json({
      mensagem: "Modulo criado com sucesso.",
      modulo,
    });
  } catch (error) {
    console.error("Erro ao criar modulo:", error);
    return res.status(500).json({ mensagem: "Erro ao criar o modulo." });
  }
}

// -----------------------------------------------------------------------------
// PUT /api/modulos/:id - edita um modulo (somente ADMIN)
// -----------------------------------------------------------------------------
export async function atualizarModulo(req, res) {
  try {
    const id = Number(req.params.id);
    const { titulo, descricao, imagem, ordem, ativo } = req.body;

    if (!id) {
      return res.status(400).json({ mensagem: "Id invalido." });
    }

    const existe = await prisma.modulo.findUnique({ where: { id } });

    if (!existe) {
      return res.status(404).json({ mensagem: "Modulo nao encontrado." });
    }

    // Monta so os campos enviados, para nao apagar o que nao foi informado.
    const dados = {};
    if (titulo !== undefined) dados.titulo = titulo;
    if (descricao !== undefined) dados.descricao = descricao;
    if (imagem !== undefined) dados.imagem = imagem;
    if (ordem !== undefined) dados.ordem = Number(ordem);
    if (ativo !== undefined) dados.ativo = ativo;

    const modulo = await prisma.modulo.update({ where: { id }, data: dados });

    return res.json({ mensagem: "Modulo atualizado com sucesso.", modulo });
  } catch (error) {
    console.error("Erro ao atualizar modulo:", error);
    return res.status(500).json({ mensagem: "Erro ao atualizar o modulo." });
  }
}

// -----------------------------------------------------------------------------
// DELETE /api/modulos/:id - exclui um modulo (somente ADMIN)
// -----------------------------------------------------------------------------
export async function excluirModulo(req, res) {
  try {
    const id = Number(req.params.id);

    if (!id) {
      return res.status(400).json({ mensagem: "Id invalido." });
    }

    const modulo = await prisma.modulo.findUnique({
      where: { id },
      include: { _count: { select: { conteudos: true, simulacoes: true } } },
    });

    if (!modulo) {
      return res.status(404).json({ mensagem: "Modulo nao encontrado." });
    }

    // Graças ao onDelete: Cascade definido no schema.prisma, excluir o modulo
    // remove em cadeia seus conteudos, simulacoes, etapas e alternativas -
    // sem erro de chave estrangeira. Avisamos quantos itens serao afetados.
    await prisma.modulo.delete({ where: { id } });

    return res.json({
      mensagem: "Modulo excluido com sucesso.",
      itensRemovidos: {
        conteudos: modulo._count.conteudos,
        simulacoes: modulo._count.simulacoes,
      },
    });
  } catch (error) {
    console.error("Erro ao excluir modulo:", error);
    return res.status(500).json({ mensagem: "Erro ao excluir o modulo." });
  }
}

// -----------------------------------------------------------------------------
// GET /api/modulos/admin/todos - lista TODOS os modulos, inclusive inativos
// -----------------------------------------------------------------------------
// A listagem publica esconde os modulos desativados. O admin precisa ve-los
// para poder reativa-los, por isso esta rota separada.
export async function listarTodosModulos(req, res) {
  try {
    const modulos = await prisma.modulo.findMany({
      orderBy: { ordem: "asc" },
      include: { _count: { select: { conteudos: true, simulacoes: true } } },
    });

    return res.json(modulos);
  } catch (error) {
    console.error("Erro ao listar modulos:", error);
    return res.status(500).json({ mensagem: "Erro ao buscar os modulos." });
  }
}
