// =============================================================================
// src/components/MenuLateral.jsx - Menu de navegacao
// =============================================================================
// Reproduz o menu lateral dos prototipos do TCC (Figuras 3, 4 e 5), com os
// itens Inicio, Modulos, Simulacoes, Meu Progresso e Meu Perfil, mais a caixa
// com os telefones de emergencia.
//
// O item "Administracao" so aparece para quem tem perfil ADMIN.
// =============================================================================

import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";

export default function MenuLateral() {
  const { ehAdmin, sair } = useAuth();
  const navegar = useNavigate();

  // O NavLink e um link que sabe se a pagina atual e a dele. A funcao abaixo
  // recebe { isActive } e devolve as classes de CSS adequadas.
  function classeDoItem({ isActive }) {
    return isActive ? "menu-item ativo" : "menu-item";
  }

  function fazerLogout() {
    sair(); // limpa o token do localStorage
    navegar("/login");
  }

  return (
    <nav className="menu-lateral">
      <div className="menu-logo">REVIVA</div>

      <NavLink to="/" className={classeDoItem} end>
        Inicio
      </NavLink>

      <NavLink to="/modulos" className={classeDoItem}>
        Modulos
      </NavLink>

      <NavLink to="/simulacoes" className={classeDoItem}>
        Simulacoes
      </NavLink>

      <NavLink to="/progresso" className={classeDoItem}>
        Meu Progresso
      </NavLink>

      <NavLink to="/perfil" className={classeDoItem}>
        Meu Perfil
      </NavLink>

      {/* Renderizacao condicional: este bloco so e criado se ehAdmin for true.
          Isso melhora a navegacao, mas NAO e a protecao de verdade - quem
          protege e o backend, com o adminMiddleware. */}
      {ehAdmin && (
        <NavLink to="/admin" className={classeDoItem}>
          Administracao
        </NavLink>
      )}

      <button className="menu-item" onClick={fazerLogout} style={{ border: "none", background: "none", cursor: "pointer", font: "inherit", textAlign: "left" }}>
        Sair
      </button>

      {/* Caixa de emergencia, presente em todos os prototipos do TCC. */}
      <div className="menu-emergencia">
        <strong>Precisa de ajuda agora?</strong>
        192 SAMU
        <br />
        193 Bombeiros
      </div>
    </nav>
  );
}
