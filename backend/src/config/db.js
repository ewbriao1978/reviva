// =============================================================================
// src/config/db.js - Conexao com o banco de dados
// =============================================================================
// Este arquivo cria UMA unica conexao com o PostgreSQL e a compartilha com todo
// o backend. Todos os controllers importam o "prisma" daqui.
//
// Por que um unico arquivo? Se cada controller criasse a sua propria conexao,
// o banco acabaria com dezenas de conexoes abertas sem necessidade.
// =============================================================================

// Carrega as variaveis do arquivo .env para dentro de process.env.
import "dotenv/config";

// O Prisma Client gerado a partir do prisma/schema.prisma.
// E atraves dele que escrevemos prisma.usuario.findMany(), prisma.modulo.create()...
import { PrismaClient } from "@prisma/client";

// O "driver adapter" do PostgreSQL. No Prisma 7 e ele quem realmente conversa
// com o banco, usando a biblioteca "pg" por baixo.
import { PrismaPg } from "@prisma/adapter-pg";

// Monta o adaptador com a URL de conexao que esta no .env.
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

// Cria o cliente do Prisma usando esse adaptador.
const prisma = new PrismaClient({ adapter });

// "export default" permite importar com o nome que quisermos nos outros
// arquivos: import prisma from "../config/db.js";
export default prisma;
