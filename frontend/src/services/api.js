// =============================================================================
// src/services/api.js - Comunicacao com o backend
// =============================================================================
// O AXIOS e a biblioteca que faz as requisicoes HTTP do React para a API.
// Em vez de escrever o endereco completo em cada tela, criamos aqui uma
// "instancia" ja configurada. Nas paginas basta escrever:
//
//     api.get("/modulos")   ->  GET http://localhost:3000/api/modulos
//
// Vantagem: se a API mudar de endereco, alteramos em um unico lugar.
// =============================================================================

import axios from "axios";

const api = axios.create({
  // Endereco base do backend. Tudo que pedirmos sera somado a este inicio.
  //
  // O Vite permite configurar valores por variavel de ambiente: basta que o
  // nome comece com VITE_. Quando o projeto roda no Docker, o endereco vem do
  // docker-compose.yml; fora dele, usamos o padrao de desenvolvimento.
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
});

// -----------------------------------------------------------------------------
// INTERCEPTADOR DE REQUISICAO
// -----------------------------------------------------------------------------
// Um "interceptador" e uma funcao que roda automaticamente ANTES de cada
// requisicao sair. Usamos para anexar o token do usuario logado em todas elas,
// sem precisar lembrar disso em cada tela.
api.interceptors.request.use((config) => {
  // Le o token guardado no navegador quando o usuario fez login.
  const token = localStorage.getItem("token");

  if (token) {
    // Formato esperado pelo authMiddleware do backend: "Bearer <token>"
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// -----------------------------------------------------------------------------
// INTERCEPTADOR DE RESPOSTA
// -----------------------------------------------------------------------------
// Roda quando a resposta chega. Se o backend disser que o token expirou (401),
// limpamos os dados e mandamos o usuario para a tela de login.
api.interceptors.response.use(
  // Primeiro parametro: o que fazer quando deu certo (apenas repassar).
  (resposta) => resposta,

  // Segundo parametro: o que fazer quando deu erro.
  (erro) => {
    if (erro.response && erro.response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("usuario");

      // Evita um laco infinito caso o erro tenha acontecido na propria
      // tela de login.
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    // Repassa o erro para quem chamou poder exibir a mensagem.
    return Promise.reject(erro);
  }
);

export default api;
