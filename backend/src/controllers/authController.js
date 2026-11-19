// =============================================================================
// src/controllers/authController.js - Cadastro e login (RF01 e RF02)
// =============================================================================
// Um CONTROLLER contem a logica de cada funcionalidade: recebe os dados da
// requisicao, conversa com o banco pelo Prisma e devolve uma resposta em JSON.
//
// Regra de ouro deste arquivo: a senha digitada pelo usuario NUNCA e gravada
// como texto. Guardamos apenas o "hash" gerado pelo bcrypt (RNF03).
// =============================================================================

import "dotenv/config";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../config/db.js";

// Funcao auxiliar: monta o token JWT de um usuario.
// Fica separada porque e usada tanto no cadastro quanto no login.
function gerarToken(usuario) {
  return jwt.sign(
    // O que fica guardado DENTRO do token (nunca coloque a senha aqui!).
    { id: usuario.id, tipo: usuario.tipo },
    // A chave secreta que assina o token. Sem ela ninguem consegue falsificar.
    process.env.JWT_SECRET,
    // Prazo de validade do token.
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

// Funcao auxiliar: devolve os dados do usuario SEM o campo senhaHash.
// Usada em todas as respostas para garantir que a senha nunca saia da API.
function usuarioSemSenha(usuario) {
  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    tipo: usuario.tipo,
    dataNascimento: usuario.dataNascimento,
    dataCadastro: usuario.dataCadastro,
  };
}

// -----------------------------------------------------------------------------
// POST /api/auth/register - cria uma conta nova (RF01)
// -----------------------------------------------------------------------------
export async function registrar(req, res) {
  try {
    // Pega os dados enviados pelo frontend no corpo da requisicao.
    const { nome, email, senha, dataNascimento } = req.body;

    // --- Validacoes basicas ---
    if (!nome || !email || !senha) {
      // 400 = o pedido veio incompleto ou mal formado.
      return res.status(400).json({
        mensagem: "Informe nome, email e senha.",
      });
    }

    if (senha.length < 6) {
      return res.status(400).json({
        mensagem: "A senha deve ter pelo menos 6 caracteres.",
      });
    }

    // Verifica se ja existe alguem com este email.
    const jaExiste = await prisma.usuario.findUnique({
      where: { email },
    });

    if (jaExiste) {
      // 409 = conflito com algo que ja existe no servidor.
      return res.status(409).json({
        mensagem: "Este email ja esta cadastrado.",
      });
    }

    // --- Criptografia da senha ---
    // O bcrypt transforma "123456" em algo como "$2b$10$N9qo8uLO...".
    // Esse processo e de mao unica: nao da para voltar ao texto original.
    const senhaHash = await bcrypt.hash(senha, 10);

    // Grava o novo usuario no PostgreSQL.
    const usuario = await prisma.usuario.create({
      data: {
        nome,
        email,
        senhaHash,
        // Converte a data so se ela tiver sido enviada (o campo e opcional).
        dataNascimento: dataNascimento ? new Date(dataNascimento) : null,
        // O tipo nao vem do frontend de proposito: qualquer pessoa que se
        // cadastra vira USUARIO comum. Admins sao criados pelo seed.
      },
    });

    // Ja devolve o token para o usuario entrar direto, sem precisar fazer login.
    const token = gerarToken(usuario);

    // 201 = recurso criado com sucesso.
    return res.status(201).json({
      mensagem: "Cadastro realizado com sucesso.",
      token,
      usuario: usuarioSemSenha(usuario),
    });
  } catch (error) {
    console.error("Erro no cadastro:", error);
    // 500 = erro inesperado no servidor.
    return res.status(500).json({ mensagem: "Erro ao realizar o cadastro." });
  }
}

// -----------------------------------------------------------------------------
// POST /api/auth/login - entra na plataforma (RF02)
// -----------------------------------------------------------------------------
export async function login(req, res) {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ mensagem: "Informe email e senha." });
    }

    // Procura o usuario pelo email.
    const usuario = await prisma.usuario.findUnique({
      where: { email },
    });

    // IMPORTANTE: a mesma mensagem serve para "email nao existe" e para
    // "senha errada". Se fossem diferentes, alguem poderia descobrir quais
    // emails estao cadastrados testando um por um.
    if (!usuario) {
      return res.status(401).json({ mensagem: "Email ou senha incorretos." });
    }

    // Compara a senha digitada com o hash guardado no banco.
    // O bcrypt refaz o calculo e verifica se o resultado bate.
    const senhaConfere = await bcrypt.compare(senha, usuario.senhaHash);

    if (!senhaConfere) {
      return res.status(401).json({ mensagem: "Email ou senha incorretos." });
    }

    const token = gerarToken(usuario);

    return res.json({
      mensagem: "Login realizado com sucesso.",
      token,
      usuario: usuarioSemSenha(usuario),
    });
  } catch (error) {
    console.error("Erro no login:", error);
    return res.status(500).json({ mensagem: "Erro ao realizar o login." });
  }
}
