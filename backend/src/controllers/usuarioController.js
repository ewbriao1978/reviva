// =============================================================================
// src/controllers/usuarioController.js - Perfil do usuario e gestao de usuarios
// =============================================================================
// Atende o RF03 (visualizar e alterar o proprio perfil) e o RF17 (o
// administrador gerencia os usuarios cadastrados).
// =============================================================================

import bcrypt from "bcryptjs";
import prisma from "../config/db.js";

// Lista de campos devolvidos nas consultas de usuario.
// Repare que senhaHash NAO esta aqui: assim o Prisma nem traz a senha do banco,
// e nao ha risco de ela escapar em alguma resposta (RNF04).
const camposPublicos = {
  id: true,
  nome: true,
  email: true,
  tipo: true,
  dataNascimento: true,
  dataCadastro: true,
};

// -----------------------------------------------------------------------------
// GET /api/usuarios/perfil - dados do usuario logado (RF03)
// -----------------------------------------------------------------------------
export async function verPerfil(req, res) {
  try {
    // req.usuario.id foi colocado ali pelo authMiddleware, a partir do token.
    // Por isso o usuario so consegue ver o proprio perfil.
    const usuario = await prisma.usuario.findUnique({
      where: { id: req.usuario.id },
      select: camposPublicos,
    });

    if (!usuario) {
      return res.status(404).json({ mensagem: "Usuario nao encontrado." });
    }

    return res.json(usuario);
  } catch (error) {
    console.error("Erro ao buscar perfil:", error);
    return res.status(500).json({ mensagem: "Erro ao buscar o perfil." });
  }
}

// -----------------------------------------------------------------------------
// PUT /api/usuarios/perfil - altera os proprios dados (RF03)
// -----------------------------------------------------------------------------
export async function atualizarPerfil(req, res) {
  try {
    const { nome, email, senha, dataNascimento } = req.body;

    // Monta um objeto apenas com os campos que o usuario realmente enviou.
    // Assim, quem quiser mudar so o nome nao precisa reenviar tudo.
    const dados = {};

    if (nome) dados.nome = nome;
    if (dataNascimento) dados.dataNascimento = new Date(dataNascimento);

    // Se o email mudou, precisamos conferir se ja nao pertence a outra pessoa.
    if (email) {
      const outro = await prisma.usuario.findUnique({ where: { email } });

      if (outro && outro.id !== req.usuario.id) {
        return res.status(409).json({
          mensagem: "Este email ja esta sendo usado por outro usuario.",
        });
      }

      dados.email = email;
    }

    // Se mandou senha nova, gera um hash novo (nunca grava o texto puro).
    if (senha) {
      if (senha.length < 6) {
        return res.status(400).json({
          mensagem: "A senha deve ter pelo menos 6 caracteres.",
        });
      }
      dados.senhaHash = await bcrypt.hash(senha, 10);
    }

    // Se nada foi enviado, nao ha o que atualizar.
    if (Object.keys(dados).length === 0) {
      return res.status(400).json({ mensagem: "Nenhum dado para atualizar." });
    }

    const usuario = await prisma.usuario.update({
      where: { id: req.usuario.id },
      data: dados,
      select: camposPublicos,
    });

    return res.json({
      mensagem: "Perfil atualizado com sucesso.",
      usuario,
    });
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
    return res.status(500).json({ mensagem: "Erro ao atualizar o perfil." });
  }
}

// -----------------------------------------------------------------------------
// GET /api/usuarios - lista todos os usuarios (RF17 - somente ADMIN)
// -----------------------------------------------------------------------------
export async function listarUsuarios(req, res) {
  try {
    const usuarios = await prisma.usuario.findMany({
      select: camposPublicos,
      orderBy: { dataCadastro: "desc" }, // os mais recentes primeiro
    });

    return res.json(usuarios);
  } catch (error) {
    console.error("Erro ao listar usuarios:", error);
    return res.status(500).json({ mensagem: "Erro ao listar os usuarios." });
  }
}

// -----------------------------------------------------------------------------
// DELETE /api/usuarios/:id - exclui um usuario (RF17 - somente ADMIN)
// -----------------------------------------------------------------------------
export async function excluirUsuario(req, res) {
  try {
    // Os parametros da URL chegam sempre como texto, por isso o Number().
    const id = Number(req.params.id);

    if (!id) {
      return res.status(400).json({ mensagem: "Id invalido." });
    }

    // Trava de seguranca: um admin nao pode excluir a propria conta e ficar
    // com o sistema sem administrador.
    if (id === req.usuario.id) {
      return res.status(400).json({
        mensagem: "Voce nao pode excluir a sua propria conta.",
      });
    }

    const usuario = await prisma.usuario.findUnique({ where: { id } });

    if (!usuario) {
      return res.status(404).json({ mensagem: "Usuario nao encontrado." });
    }

    // Por causa do onDelete: Cascade no schema.prisma, os registros de
    // progresso deste usuario sao removidos automaticamente junto.
    await prisma.usuario.delete({ where: { id } });

    return res.json({ mensagem: "Usuario excluido com sucesso." });
  } catch (error) {
    console.error("Erro ao excluir usuario:", error);
    return res.status(500).json({ mensagem: "Erro ao excluir o usuario." });
  }
}
