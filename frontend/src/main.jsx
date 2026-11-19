// =============================================================================
// src/main.jsx - Ponto de entrada da aplicacao React
// =============================================================================
// Este e o primeiro arquivo JavaScript executado pelo navegador. Sua tarefa e
// pegar o componente App e desenha-lo dentro da div de id "root" que existe no
// index.html.
// =============================================================================

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App.jsx";
import "./index.css"; // carrega os estilos da plataforma

// document.getElementById busca a div no index.html.
createRoot(document.getElementById("root")).render(
  // O StrictMode e uma ajuda do React durante o desenvolvimento: ele avisa
  // sobre praticas problematicas no console. Nao afeta a versao final.
  <StrictMode>
    <App />
  </StrictMode>
);
