// =============================================================================
// prisma7.config.ts - Configuracao do Prisma ORM 7
// =============================================================================
// A partir do Prisma 7, a configuracao do CLI (onde esta o schema, onde ficam
// as migrations e qual a URL do banco) sai do schema.prisma e passa para este
// arquivo. Ele e lido pelos comandos do terminal: prisma migrate, prisma
// generate, prisma studio.
//
// Este e o UNICO arquivo .ts do projeto. O Prisma 7 so reconhece a configuracao
// em TypeScript - nao existe suporte a prisma7.config.js. Ele nunca e importado
// pelo nosso codigo: quem o le e o CLI do Prisma.
// =============================================================================

// Carrega as variaveis do arquivo .env (DATABASE_URL, JWT_SECRET...).
// O Prisma NAO le o .env sozinho, por isso este import e obrigatorio.
import "dotenv/config";

import { defineConfig } from "prisma/config";

export default defineConfig({
  // Onde esta a definicao das tabelas (os models).
  schema: "prisma/schema.prisma",

  // Onde o Prisma grava o historico de alteracoes do banco.
  migrations: {
    path: "prisma/migrations",
  },

  // A URL de conexao vem do .env, nunca escrita direto aqui.
  // Assim a senha do banco nao vai parar no repositorio de codigo.
  datasource: {
    url: process.env["DATABASE_URL"],

    // Banco temporario que o Prisma usa para conferir as migrations.
    // Normalmente ele cria e apaga esse banco sozinho, e esta linha nem
    // seria necessaria. Ela existe porque, nesta maquina, o PostgreSQL 16
    // foi instalado com uma versao antiga da biblioteca de idioma (glibc) e
    // se recusa a criar bancos novos automaticamente.
    // Se a variavel nao estiver definida no .env, o Prisma volta ao
    // comportamento padrao.
    shadowDatabaseUrl: process.env["SHADOW_DATABASE_URL"],
  },
});
