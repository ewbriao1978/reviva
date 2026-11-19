#!/bin/sh
# =============================================================================
# backend/docker-entrypoint.sh - Preparacao antes de ligar a API
# =============================================================================
# Roda toda vez que o container do backend inicia e cuida de deixar o banco
# pronto, para que ninguem precise rodar migrations na mao.
# =============================================================================

# "set -e" faz o script parar no primeiro erro, em vez de seguir adiante
# com o banco pela metade.
set -e

echo ""
echo "================================================="
echo "  REVIVA - preparando o banco de dados"
echo "================================================="

# 1) Aplica as migrations, criando as tabelas que ainda nao existirem.
#    Usamos "migrate deploy" (e nao "migrate dev") porque ele apenas aplica
#    as migrations ja existentes, sem fazer perguntas e sem precisar do
#    shadow database. E o comando indicado para ambientes automatizados.
echo "-> Aplicando migrations..."
npx prisma migrate deploy

# 2) Insere os dados iniciais SOMENTE se o banco estiver vazio.
#    A flag evita que o progresso dos usuarios seja apagado a cada reinicio
#    do container.
echo "-> Verificando dados iniciais..."
node prisma/seed.js --apenas-se-vazio

echo "-> Banco pronto. Iniciando a API..."
echo ""

# "exec $@" substitui este script pelo comando definido em CMD no Dockerfile
# (o "npm run dev"). O exec faz o servidor assumir o processo principal do
# container, para que ele receba corretamente o sinal de parada do Docker.
exec "$@"
