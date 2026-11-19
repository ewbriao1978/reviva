// =============================================================================
// src/routes/moduloRoutes.js - Enderecos dos modulos
// =============================================================================

import { Router } from "express";
import {
  listarModulos,
  buscarModulo,
  criarModulo,
  atualizarModulo,
  excluirModulo,
  listarTodosModulos,
} from "../controllers/moduloController.js";
import { autenticar } from "../middlewares/authMiddleware.js";
import { apenasAdmin } from "../middlewares/adminMiddleware.js";

const router = Router();

// ATENCAO A ORDEM: esta rota precisa vir ANTES de "/:id".
// Se viesse depois, o Express entenderia "admin" como se fosse um id e
// chamaria buscarModulo com req.params.id = "admin".
router.get("/admin/todos", autenticar, apenasAdmin, listarTodosModulos);

// GET /api/modulos -> lista os modulos ativos (RF04)
router.get("/", autenticar, listarModulos);

// GET /api/modulos/:id -> um modulo com conteudos e simulacoes
router.get("/:id", autenticar, buscarModulo);

// --- Gerenciamento (somente ADMIN) ---
router.post("/", autenticar, apenasAdmin, criarModulo);
router.put("/:id", autenticar, apenasAdmin, atualizarModulo);
router.delete("/:id", autenticar, apenasAdmin, excluirModulo);

export default router;
