// =============================================================================
// src/routes/authRoutes.js - Enderecos de cadastro e login
// =============================================================================
// Uma ROTA liga um endereco (URL) + um metodo HTTP a uma funcao do controller.
// Este arquivo nao contem regra de negocio: ele so diz "quando chegar um POST
// em /register, chame a funcao registrar".
//
// Estas sao as unicas rotas PUBLICAS do sistema - nao exigem token, porque
// quem ainda vai se cadastrar ou fazer login obviamente nao tem um.
// =============================================================================

import { Router } from "express";
import { registrar, login } from "../controllers/authController.js";

const router = Router();

// POST /api/auth/register -> cria uma conta nova (RF01)
router.post("/register", registrar);

// POST /api/auth/login -> entra na plataforma (RF02)
router.post("/login", login);

export default router;
