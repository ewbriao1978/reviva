// =============================================================================
// src/app.js - Montagem da aplicacao Express
// =============================================================================
// Este arquivo junta todas as pecas do backend:
//   - liga os middlewares gerais (CORS e leitura de JSON);
//   - conecta cada grupo de rotas ao seu endereco base;
//   - define o que fazer quando a URL nao existe ou quando algo da errado.
//
// Ele NAO liga o servidor - quem faz isso e o server.js. Essa separacao deixa
// claro o que e "configuracao da aplicacao" e o que e "colocar no ar".
// =============================================================================

import "dotenv/config";
import express from "express";
import cors from "cors";

// Importa os arquivos de rotas.
import authRoutes from "./routes/authRoutes.js";
import usuarioRoutes from "./routes/usuarioRoutes.js";
import moduloRoutes from "./routes/moduloRoutes.js";
import conteudoRoutes from "./routes/conteudoRoutes.js";
import simulacaoRoutes from "./routes/simulacaoRoutes.js";
import progressoRoutes from "./routes/progressoRoutes.js";

const app = express();

// --- Middlewares gerais (valem para TODAS as rotas) ---

// CORS: por padrao, o navegador bloqueia uma pagina de um endereco
// (http://localhost:5173, o React) de chamar outro endereco
// (http://localhost:3000, esta API). O cors libera essa comunicacao.
//
// Em vez de aceitar um endereco fixo, usamos uma funcao que libera QUALQUER
// porta do localhost. O motivo e pratico: se a porta 5173 estiver ocupada, o
// Vite sobe o frontend na 5174 sozinho - e o login pararia de funcionar com
// um erro de CORS dificil de entender.
//
// Em um sistema publicado na internet, esta funcao seria trocada pelo
// endereco real do site (ex.: https://reviva.com.br).
app.use(
  cors({
    origin: function (origem, liberar) {
      // origem vazia acontece em ferramentas como curl e Postman, que nao
      // sao navegadores e portanto nao sofrem a restricao.
      if (!origem || origem.startsWith("http://localhost:")) {
        return liberar(null, true);
      }

      return liberar(new Error("Origem nao autorizada pelo CORS."));
    },
  })
);

// Ensina o Express a ler corpos de requisicao em JSON.
// Sem esta linha, req.body chegaria vazio nos controllers.
app.use(express.json());

// --- Rota de teste ---
// Util para conferir rapidamente, pelo navegador, se a API esta no ar.
app.get("/", (req, res) => {
  res.json({
    mensagem: "API da plataforma REVIVA esta funcionando.",
    aviso:
      "Conteudo com finalidade educativa. Nao substitui treinamento pratico " +
      "nem atendimento profissional. Em emergencias ligue 192 (SAMU) ou 193 " +
      "(Bombeiros).",
  });
});

// --- Conexao dos grupos de rotas ---
// O primeiro argumento e o "prefixo". Tudo que esta em authRoutes passa a
// responder abaixo de /api/auth. Assim, o router.post("/login") daquele
// arquivo vira, na pratica, POST /api/auth/login.
app.use("/api/auth", authRoutes);
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/modulos", moduloRoutes);
app.use("/api/conteudos", conteudoRoutes);
app.use("/api/simulacoes", simulacaoRoutes);
app.use("/api/progresso", progressoRoutes);

// --- Tratamento de erros ---

// Se nenhuma rota acima combinou com a URL pedida, caimos aqui.
// 404 = nao encontrado.
app.use((req, res) => {
  res.status(404).json({
    mensagem: `Rota nao encontrada: ${req.method} ${req.originalUrl}`,
  });
});

// Middleware de erro: tem QUATRO parametros, e e assim que o Express sabe que
// ele serve para tratar erros. Pega qualquer falha que tenha escapado dos
// try/catch dos controllers, evitando que o servidor caia.
app.use((erro, req, res, next) => {
  console.error("Erro nao tratado:", erro);
  res.status(500).json({ mensagem: "Erro interno no servidor." });
});

export default app;
