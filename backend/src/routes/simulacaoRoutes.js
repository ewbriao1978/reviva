// =============================================================================
// src/routes/simulacaoRoutes.js - Enderecos das simulacoes
// =============================================================================
// A ORDEM DAS ROTAS IMPORTA MUITO neste arquivo.
// O Express testa as rotas de cima para baixo e usa a primeira que combinar.
// Como "/:id" combina com QUALQUER texto, ela precisa ficar depois das rotas
// com nomes fixos (/responder, /etapas, /alternativas) - senao o Express
// tentaria interpretar "responder" como se fosse o id de uma simulacao.
// =============================================================================

import { Router } from "express";
import {
  listarSimulacoes,
  listarPorModulo,
  iniciarSimulacao,
  responder,
  reiniciarSimulacao,
  buscarSimulacaoCompleta,
  criarSimulacao,
  excluirSimulacao,
  criarEtapa,
  excluirEtapa,
  criarAlternativa,
  atualizarAlternativa,
  excluirAlternativa,
} from "../controllers/simulacaoController.js";
import { autenticar } from "../middlewares/authMiddleware.js";
import { apenasAdmin } from "../middlewares/adminMiddleware.js";

const router = Router();

// --- Rotas com nome fixo (precisam vir primeiro) ---

// POST /api/simulacoes/responder -> processa a escolha do usuario (RF10, RF11)
router.post("/responder", autenticar, responder);

// Cadastro de etapas (somente ADMIN - RF16)
router.post("/etapas", autenticar, apenasAdmin, criarEtapa);
router.delete("/etapas/:id", autenticar, apenasAdmin, excluirEtapa);

// Cadastro de alternativas e feedbacks (somente ADMIN - RF16)
router.post("/alternativas", autenticar, apenasAdmin, criarAlternativa);
router.put("/alternativas/:id", autenticar, apenasAdmin, atualizarAlternativa);
router.delete("/alternativas/:id", autenticar, apenasAdmin, excluirAlternativa);

// GET /api/simulacoes/modulo/3 -> simulacoes do modulo 3 (RF09)
router.get("/modulo/:moduloId", autenticar, listarPorModulo);

// --- Rotas gerais ---

// GET /api/simulacoes -> todas as simulacoes disponiveis
router.get("/", autenticar, listarSimulacoes);

// POST /api/simulacoes -> cadastra uma simulacao (somente ADMIN)
router.post("/", autenticar, apenasAdmin, criarSimulacao);

// --- Rotas com :id (precisam vir por ultimo) ---

// GET /api/simulacoes/5/completa -> simulacao inteira para edicao (ADMIN)
router.get("/:id/completa", autenticar, apenasAdmin, buscarSimulacaoCompleta);

// POST /api/simulacoes/5/reiniciar -> refaz a simulacao (caso de uso "Repetir")
router.post("/:id/reiniciar", autenticar, reiniciarSimulacao);

// GET /api/simulacoes/5 -> inicia ou retoma a simulacao 5
router.get("/:id", autenticar, iniciarSimulacao);

// DELETE /api/simulacoes/5 -> exclui a simulacao (somente ADMIN)
router.delete("/:id", autenticar, apenasAdmin, excluirSimulacao);

export default router;
