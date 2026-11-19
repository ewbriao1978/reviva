// =============================================================================
// src/App.jsx - Mapa de rotas da aplicacao
// =============================================================================
// Aqui definimos qual componente aparece em cada endereco do navegador.
// Quem faz esse trabalho e o REACT ROUTER DOM.
//
// Uma observacao importante para a defesa: este e um SPA (Single Page
// Application). O navegador carrega a pagina uma unica vez; ao clicar em um
// link, o React apenas TROCA o componente exibido, sem recarregar o site. Por
// isso a navegacao e instantanea.
// =============================================================================

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import RotaPrivada from "./components/RotaPrivada.jsx";

// Paginas publicas
import Login from "./pages/Login.jsx";
import Cadastro from "./pages/Cadastro.jsx";

// Paginas internas
import Dashboard from "./pages/Dashboard.jsx";
import Modulos from "./pages/Modulos.jsx";
import Modulo from "./pages/Modulo.jsx";
import Conteudo from "./pages/Conteudo.jsx";
import Simulacoes from "./pages/Simulacoes.jsx";
import Simulacao from "./pages/Simulacao.jsx";
import Progresso from "./pages/Progresso.jsx";
import Perfil from "./pages/Perfil.jsx";
import Admin from "./pages/Admin.jsx";

export default function App() {
  return (
    // O AuthProvider precisa envolver tudo, para qualquer pagina conseguir
    // saber quem esta logado.
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* --- Rotas publicas --- */}
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />

          {/* --- Rotas privadas --- */}
          {/* Cada pagina e envolvida pelo RotaPrivada, que verifica o login
              e monta o menu lateral em volta. */}
          <Route
            path="/"
            element={
              <RotaPrivada>
                <Dashboard />
              </RotaPrivada>
            }
          />

          <Route
            path="/modulos"
            element={
              <RotaPrivada>
                <Modulos />
              </RotaPrivada>
            }
          />

          {/* O ":id" e a parte variavel: /modulos/1, /modulos/2...
              A pagina le esse valor com o useParams(). */}
          <Route
            path="/modulos/:id"
            element={
              <RotaPrivada>
                <Modulo />
              </RotaPrivada>
            }
          />

          <Route
            path="/conteudos/:id"
            element={
              <RotaPrivada>
                <Conteudo />
              </RotaPrivada>
            }
          />

          <Route
            path="/simulacoes"
            element={
              <RotaPrivada>
                <Simulacoes />
              </RotaPrivada>
            }
          />

          <Route
            path="/simulacoes/:id"
            element={
              <RotaPrivada>
                <Simulacao />
              </RotaPrivada>
            }
          />

          <Route
            path="/progresso"
            element={
              <RotaPrivada>
                <Progresso />
              </RotaPrivada>
            }
          />

          <Route
            path="/perfil"
            element={
              <RotaPrivada>
                <Perfil />
              </RotaPrivada>
            }
          />

          {/* --- Rota exclusiva do administrador --- */}
          <Route
            path="/admin"
            element={
              <RotaPrivada exigeAdmin>
                <Admin />
              </RotaPrivada>
            }
          />

          {/* O "*" captura qualquer endereco que nao exista. */}
          <Route
            path="*"
            element={
              <div className="pagina-acesso">
                <div className="caixa-acesso">
                  <h1>404</h1>
                  <p className="subtitulo">Pagina nao encontrada.</p>
                </div>
              </div>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
