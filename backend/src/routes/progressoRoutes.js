// =============================================================================
// src/routes/progressoRoutes.js - Enderecos do acompanhamento de progresso
// =============================================================================

import { Router } from "express";
import {
  obterProgresso,
  concluirConteudo,
  desmarcarConteudo,
  concluirSimulacao,
} from "../controllers/progressoController.js";
import { autenticar } from "../middlewares/authMiddleware.js";

const router = Router();

// Todas as rotas daqui sao privadas: o progresso e sempre o do usuario logado,
// identificado pelo token (req.usuario.id). Nao existe como pedir o progresso
// de outra pessoa.

// GET /api/progresso -> progresso geral e por modulo (RF07, RF13)
router.get("/", autenticar, obterProgresso);

// POST /api/progresso/conteudo/12 -> marca o conteudo 12 como concluido (RF06)
router.post("/conteudo/:conteudoId", autenticar, concluirConteudo);

// DELETE /api/progresso/conteudo/12 -> desmarca o conteudo 12
router.delete("/conteudo/:conteudoId", autenticar, desmarcarConteudo);

// POST /api/progresso/simulacao/3 -> registra a simulacao 3 como feita (RF12)
router.post("/simulacao/:simulacaoId", autenticar, concluirSimulacao);

export default router;
