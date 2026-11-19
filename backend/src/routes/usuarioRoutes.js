// =============================================================================
// src/routes/usuarioRoutes.js - Enderecos de perfil e gestao de usuarios
// =============================================================================

import { Router } from "express";
import {
  verPerfil,
  atualizarPerfil,
  listarUsuarios,
  excluirUsuario,
} from "../controllers/usuarioController.js";
import { autenticar } from "../middlewares/authMiddleware.js";
import { apenasAdmin } from "../middlewares/adminMiddleware.js";

const router = Router();

// Repare na ordem dos argumentos: o Express executa da esquerda para a direita.
// Primeiro o middleware, depois o controller.

// GET /api/usuarios/perfil -> dados do proprio usuario (RF03)
router.get("/perfil", autenticar, verPerfil);

// PUT /api/usuarios/perfil -> altera os proprios dados (RF03)
router.put("/perfil", autenticar, atualizarPerfil);

// --- Rotas restritas ao administrador (RF17) ---
// Aqui sao DOIS middlewares em sequencia: esta logado? e admin?

// GET /api/usuarios -> lista todos os usuarios cadastrados
router.get("/", autenticar, apenasAdmin, listarUsuarios);

// DELETE /api/usuarios/:id -> exclui um usuario
// Os dois-pontos indicam um trecho variavel da URL: em /api/usuarios/7,
// o valor 7 chega no controller como req.params.id
router.delete("/:id", autenticar, apenasAdmin, excluirUsuario);

export default router;
