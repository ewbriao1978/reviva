// =============================================================================
// src/routes/conteudoRoutes.js - Enderecos dos conteudos educativos
// =============================================================================

import { Router } from "express";
import {
  listarPorModulo,
  buscarConteudo,
  criarConteudo,
  atualizarConteudo,
  excluirConteudo,
} from "../controllers/conteudoController.js";
import { autenticar } from "../middlewares/authMiddleware.js";
import { apenasAdmin } from "../middlewares/adminMiddleware.js";

const router = Router();

// Esta rota vem antes de "/:id" porque "modulo" nao e um id.
// GET /api/conteudos/modulo/3 -> conteudos do modulo 3 (RF05)
router.get("/modulo/:moduloId", autenticar, listarPorModulo);

// GET /api/conteudos/:id -> abre um conteudo para leitura
router.get("/:id", autenticar, buscarConteudo);

// --- Gerenciamento (somente ADMIN - RF15) ---
router.post("/", autenticar, apenasAdmin, criarConteudo);
router.put("/:id", autenticar, apenasAdmin, atualizarConteudo);
router.delete("/:id", autenticar, apenasAdmin, excluirConteudo);

export default router;
