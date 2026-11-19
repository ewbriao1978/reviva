// =============================================================================
// src/server.js - Inicializacao do servidor
// =============================================================================
// Este e o arquivo executado pelo comando "npm run dev".
// Sua unica tarefa e pegar a aplicacao montada no app.js e coloca-la para
// escutar requisicoes em uma porta do computador.
// =============================================================================

import "dotenv/config";
import app from "./app.js";

// Le a porta do arquivo .env. Se nao estiver definida, usa 3000.
const PORTA = process.env.PORT || 3000;

// Coloca o servidor no ar. A funcao passada como segundo argumento e executada
// assim que ele estiver pronto.
app.listen(PORTA, () => {
  console.log("=================================================");
  console.log("  API da plataforma REVIVA");
  console.log(`  Rodando em: http://localhost:${PORTA}`);
  console.log("  Para encerrar: Ctrl + C");
  console.log("=================================================");
});
