-- CreateEnum
CREATE TYPE "TipoUsuario" AS ENUM ('USUARIO', 'ADMIN');

-- CreateTable
CREATE TABLE "usuarios" (
    "id_usuario" SERIAL NOT NULL,
    "nome" VARCHAR(100) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "senha_hash" TEXT NOT NULL,
    "data_nascimento" DATE,
    "tipo" "TipoUsuario" NOT NULL DEFAULT 'USUARIO',
    "data_cadastro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id_usuario")
);

-- CreateTable
CREATE TABLE "modulos" (
    "id_modulo" SERIAL NOT NULL,
    "titulo" VARCHAR(150) NOT NULL,
    "descricao" TEXT NOT NULL,
    "imagem" VARCHAR(255),
    "ordem" INTEGER NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "modulos_pkey" PRIMARY KEY ("id_modulo")
);

-- CreateTable
CREATE TABLE "conteudos" (
    "id_conteudo" SERIAL NOT NULL,
    "id_modulo" INTEGER NOT NULL,
    "titulo" VARCHAR(150) NOT NULL,
    "texto" TEXT NOT NULL,
    "imagem" VARCHAR(255),
    "ordem" INTEGER NOT NULL,

    CONSTRAINT "conteudos_pkey" PRIMARY KEY ("id_conteudo")
);

-- CreateTable
CREATE TABLE "progresso_conteudo" (
    "id_progresso_conteudo" SERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "id_conteudo" INTEGER NOT NULL,
    "concluido" BOOLEAN NOT NULL DEFAULT false,
    "ultimo_acesso" TIMESTAMP(3),
    "data_conclusao" TIMESTAMP(3),

    CONSTRAINT "progresso_conteudo_pkey" PRIMARY KEY ("id_progresso_conteudo")
);

-- CreateTable
CREATE TABLE "simulacoes" (
    "id_simulacao" SERIAL NOT NULL,
    "id_modulo" INTEGER NOT NULL,
    "titulo" VARCHAR(150) NOT NULL,
    "descricao" TEXT NOT NULL,
    "imagem" VARCHAR(255),
    "ativa" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "simulacoes_pkey" PRIMARY KEY ("id_simulacao")
);

-- CreateTable
CREATE TABLE "etapa_simulacao" (
    "id_etapa" SERIAL NOT NULL,
    "id_simulacao" INTEGER NOT NULL,
    "titulo" VARCHAR(150),
    "texto" TEXT NOT NULL,
    "imagem" VARCHAR(255),
    "eh_inicial" BOOLEAN NOT NULL DEFAULT false,
    "eh_final" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "etapa_simulacao_pkey" PRIMARY KEY ("id_etapa")
);

-- CreateTable
CREATE TABLE "alternativas" (
    "id_alternativa" SERIAL NOT NULL,
    "id_etapa" INTEGER NOT NULL,
    "texto" TEXT NOT NULL,
    "feedback" TEXT NOT NULL,
    "correta" BOOLEAN NOT NULL DEFAULT false,
    "id_proxima_etapa" INTEGER,
    "ordem" INTEGER NOT NULL,

    CONSTRAINT "alternativas_pkey" PRIMARY KEY ("id_alternativa")
);

-- CreateTable
CREATE TABLE "progresso_simulacao" (
    "id_progresso_simulacao" SERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "id_simulacao" INTEGER NOT NULL,
    "id_etapa_atual" INTEGER,
    "concluido" BOOLEAN NOT NULL DEFAULT false,
    "data_inicio" TIMESTAMP(3),
    "ultimo_acesso" TIMESTAMP(3),
    "data_conclusao" TIMESTAMP(3),

    CONSTRAINT "progresso_simulacao_pkey" PRIMARY KEY ("id_progresso_simulacao")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "progresso_conteudo_id_usuario_id_conteudo_key" ON "progresso_conteudo"("id_usuario", "id_conteudo");

-- CreateIndex
CREATE UNIQUE INDEX "progresso_simulacao_id_usuario_id_simulacao_key" ON "progresso_simulacao"("id_usuario", "id_simulacao");

-- AddForeignKey
ALTER TABLE "conteudos" ADD CONSTRAINT "conteudos_id_modulo_fkey" FOREIGN KEY ("id_modulo") REFERENCES "modulos"("id_modulo") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progresso_conteudo" ADD CONSTRAINT "progresso_conteudo_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuarios"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progresso_conteudo" ADD CONSTRAINT "progresso_conteudo_id_conteudo_fkey" FOREIGN KEY ("id_conteudo") REFERENCES "conteudos"("id_conteudo") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "simulacoes" ADD CONSTRAINT "simulacoes_id_modulo_fkey" FOREIGN KEY ("id_modulo") REFERENCES "modulos"("id_modulo") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "etapa_simulacao" ADD CONSTRAINT "etapa_simulacao_id_simulacao_fkey" FOREIGN KEY ("id_simulacao") REFERENCES "simulacoes"("id_simulacao") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alternativas" ADD CONSTRAINT "alternativas_id_etapa_fkey" FOREIGN KEY ("id_etapa") REFERENCES "etapa_simulacao"("id_etapa") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alternativas" ADD CONSTRAINT "alternativas_id_proxima_etapa_fkey" FOREIGN KEY ("id_proxima_etapa") REFERENCES "etapa_simulacao"("id_etapa") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progresso_simulacao" ADD CONSTRAINT "progresso_simulacao_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuarios"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progresso_simulacao" ADD CONSTRAINT "progresso_simulacao_id_simulacao_fkey" FOREIGN KEY ("id_simulacao") REFERENCES "simulacoes"("id_simulacao") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progresso_simulacao" ADD CONSTRAINT "progresso_simulacao_id_etapa_atual_fkey" FOREIGN KEY ("id_etapa_atual") REFERENCES "etapa_simulacao"("id_etapa") ON DELETE SET NULL ON UPDATE CASCADE;
