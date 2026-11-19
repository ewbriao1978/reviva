// =============================================================================
// src/middlewares/authMiddleware.js - Verifica se o usuario esta logado
// =============================================================================
// Um MIDDLEWARE e uma funcao que roda ANTES do controller. Ele recebe tres
// parametros:
//   req  -> a requisicao que chegou do frontend
//   res  -> a resposta que vamos devolver
//   next -> funcao que libera a passagem para o proximo passo
//
// Se o middleware chamar next(), a requisicao segue para o controller.
// Se ele responder (res.status(...).json(...)), a requisicao para por aqui.
//
// Este middleware protege as rotas privadas: sem um token valido, o pedido nem
// chega no controller.
// =============================================================================

import "dotenv/config";
import jwt from "jsonwebtoken";

export function autenticar(req, res, next) {
  // O frontend envia o token no cabecalho Authorization, no formato:
  // "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  const cabecalho = req.headers.authorization;

  if (!cabecalho) {
    return res.status(401).json({
      mensagem: "Token nao enviado. Faca login para continuar.",
    });
  }

  // Separa a palavra "Bearer" do token em si.
  const partes = cabecalho.split(" ");

  if (partes.length !== 2 || partes[0] !== "Bearer") {
    return res.status(401).json({
      mensagem: "Formato do token invalido.",
    });
  }

  const token = partes[1];

  try {
    // Confere se o token foi mesmo assinado por nos e se ainda nao expirou.
    // Se algo estiver errado, o jwt.verify lanca um erro e caimos no catch.
    const dados = jwt.verify(token, process.env.JWT_SECRET);

    // Guarda os dados do usuario na requisicao. A partir daqui, qualquer
    // controller consegue saber QUEM fez o pedido lendo req.usuario.
    req.usuario = {
      id: dados.id,
      tipo: dados.tipo,
    };

    // Libera a passagem para o proximo middleware ou para o controller.
    return next();
  } catch (error) {
    // 401 = nao autenticado (o token e invalido ou expirou)
    return res.status(401).json({
      mensagem: "Token invalido ou expirado. Faca login novamente.",
    });
  }
}
