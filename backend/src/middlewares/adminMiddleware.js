// =============================================================================
// src/middlewares/adminMiddleware.js - Verifica se o usuario e administrador
// =============================================================================
// Este middleware roda SEMPRE DEPOIS do authMiddleware, porque depende do
// req.usuario que aquele preenche. Nas rotas ficam os dois em sequencia:
//
//     router.post("/", autenticar, apenasAdmin, criarModulo);
//                      ^^^^^^^^^^  ^^^^^^^^^^^
//                      1o: esta logado?   2o: e admin?
//
// E o que atende aos requisitos RF14 a RF17 (area administrativa).
// =============================================================================

export function apenasAdmin(req, res, next) {
  // Se o authMiddleware nao rodou antes, req.usuario nao existe.
  // Esta checagem evita um erro confuso caso as rotas sejam montadas errado.
  if (!req.usuario) {
    return res.status(401).json({
      mensagem: "Usuario nao autenticado.",
    });
  }

  // O tipo vem do token JWT, que foi assinado pelo servidor no login.
  // Como o usuario nao consegue alterar o token sem invalidar a assinatura,
  // ele nao tem como se promover a ADMIN por conta propria.
  if (req.usuario.tipo !== "ADMIN") {
    // 403 = autenticado, porem SEM PERMISSAO para esta acao.
    // (Diferente do 401, que significa "nao sabemos quem voce e".)
    return res.status(403).json({
      mensagem: "Acesso restrito a administradores.",
    });
  }

  return next();
}
