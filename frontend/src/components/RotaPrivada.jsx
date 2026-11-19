// =============================================================================
// src/components/RotaPrivada.jsx - Protecao das paginas internas
// =============================================================================
// Envolve as paginas que exigem login. Se nao houver usuario logado, redireciona
// para a tela de login. Se a pagina exigir ADMIN e o usuario nao for, manda de
// volta para o painel.
//
// IMPORTANTE PARA A DEFESA:
// Esta protecao e apenas de NAVEGACAO - ela evita que a tela apareca. A
// seguranca real esta no backend: mesmo que alguem force a URL /admin, as
// requisicoes a API continuariam sendo recusadas com erro 403 pelo
// adminMiddleware. Nunca confie apenas na validacao do frontend.
// =============================================================================

import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import MenuLateral from "./MenuLateral.jsx";

export default function RotaPrivada({ children, exigeAdmin = false }) {
  const { estaLogado, ehAdmin } = useAuth();

  // Sem login: vai para a tela de login.
  // "replace" troca a pagina no historico, para o botao Voltar do navegador
  // nao trazer o usuario de volta para a tela protegida.
  if (!estaLogado) {
    return <Navigate to="/login" replace />;
  }

  // Logado, mas sem permissao de administrador.
  if (exigeAdmin && !ehAdmin) {
    return <Navigate to="/" replace />;
  }

  // Tudo certo: monta o layout com o menu e a pagina pedida.
  return (
    <div className="layout">
      <MenuLateral />
      <main className="conteudo-principal">{children}</main>
    </div>
  );
}
