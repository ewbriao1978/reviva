# =============================================================================
# backend/Dockerfile - Receita da imagem do backend
# =============================================================================
# Um Dockerfile descreve, passo a passo, como montar o ambiente onde a
# aplicacao vai rodar. Cada instrucao cria uma camada da imagem.
# =============================================================================

# Partimos de uma imagem oficial do Node.js 22 em Debian "slim" (enxuta).
# A versao fica fixa para que todos usem exatamente a mesma.
FROM node:22-bookworm-slim

# O Prisma precisa do OpenSSL para conversar com o banco de forma segura.
# A imagem slim nao o traz, entao instalamos.
# O "rm -rf /var/lib/apt/lists/*" no final apaga o cache e deixa a imagem menor.
RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

# Define a pasta onde os proximos comandos serao executados dentro do container.
WORKDIR /app

# Copiamos PRIMEIRO apenas os arquivos de dependencias.
# Motivo: o Docker guarda cada passo em cache. Enquanto o package.json nao
# mudar, ele reaproveita o "npm install" anterior - o que torna as proximas
# construcoes muito mais rapidas.
COPY package*.json ./

# O schema precisa existir antes do install, porque o script "postinstall"
# roda o "prisma generate", que o le.
COPY prisma ./prisma
COPY prisma7.config.ts ./

# "npm ci" instala exatamente as versoes travadas no package-lock.json.
# E o comando indicado para ambientes automatizados, por ser reproduzivel.
RUN npm ci

# Agora sim copiamos o restante do codigo.
COPY . .

# Script que prepara o banco antes de ligar o servidor.
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Porta que a aplicacao usa. E apenas uma documentacao da imagem: quem
# realmente publica a porta e o docker-compose.yml.
EXPOSE 3000

# Comando executado quando o container inicia.
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["npm", "run", "dev"]
