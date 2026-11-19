# =============================================================================
# frontend/Dockerfile - Receita da imagem do frontend
# =============================================================================
# Monta o ambiente do React + Vite. Mais simples que o do backend, porque
# aqui nao ha banco de dados envolvido.
# =============================================================================

FROM node:22-bookworm-slim

WORKDIR /app

# Mesma ideia do backend: copiar primeiro os arquivos de dependencias para
# aproveitar o cache do Docker nas proximas construcoes.
COPY package*.json ./

RUN npm ci

COPY . .

EXPOSE 5173

# O "--host 0.0.0.0" e indispensavel.
# Por padrao o Vite so aceita conexoes vindas da propria maquina - e, dentro
# do container, isso significa apenas o container. Sem esse parametro, o site
# nao abriria no navegador do seu computador.
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
