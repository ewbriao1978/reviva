# REVIVA

**Plataforma Web Interativa para o Ensino de Primeiros Socorros Baseada em Simulação de Decisões**

Trabalho de Conclusão de Curso — Técnico em Informática para Internet integrado ao Ensino Médio — IFRS, Campus Rio Grande.

- **Autora:** Leandra Oliveira Machado Gonçalves
- **Orientadora:** Profª. Me. Andressa Maio da Costa
- **Coorientador:** Prof. Dr. Eduardo Wenzel Brião

---

## ⚠️ Aviso sobre o conteúdo de saúde

A REVIVA é uma **ferramenta educativa**. Ela **não substitui** treinamento prático presencial nem atendimento profissional.

Em uma emergência real, acione imediatamente o **SAMU (192)** ou os **Bombeiros (193)**.

Os textos de primeiros socorros presentes no `seed.js` foram transcritos dos protótipos do próprio TCC (Figuras 1, 4 e 5). Os trechos marcados com `[A VALIDAR - ENFERMAGEM]` são espaços reservados, ainda sem conteúdo clínico. **Todo o material precisa do aval da orientação da área de Enfermagem antes de qualquer apresentação pública.**

---

## O que a plataforma faz

- Cadastro e login com senha criptografada e token JWT
- Cinco módulos: engasgos, paradas cardiorrespiratórias, hemorragias graves, queimaduras e convulsões
- Conteúdos educativos por módulo, com marcação de conclusão
- **Simulações de tomada de decisão** com etapas encadeadas: cada alternativa tem um feedback próprio e leva a uma etapa diferente
- Progresso individual calculado a partir do banco de dados (geral e por módulo)
- Retomada dos estudos do ponto em que o usuário parou
- Área administrativa para gerenciar usuários, módulos, conteúdos, simulações, etapas e alternativas

---

## Tecnologias

| Camada | Tecnologias |
|---|---|
| Frontend | React 19, Vite, React Router DOM, Axios, CSS puro |
| Backend | Node.js, Express 5, JWT, bcryptjs, CORS |
| Banco | PostgreSQL + Prisma ORM 7.10.0 (driver adapter `@prisma/adapter-pg`) |

Todo o código está em **JavaScript** — não há TypeScript. A única exceção é o `prisma7.config.ts`, porque o CLI do Prisma 7 só reconhece a configuração nesse formato.

---

## Estrutura do projeto

```
projeto/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma        definição das 8 tabelas
│   │   ├── migrations/          histórico de alterações do banco
│   │   └── seed.js              dados iniciais
│   ├── src/
│   │   ├── config/db.js         conexão única com o PostgreSQL
│   │   ├── middlewares/         autenticação e verificação de admin
│   │   ├── controllers/         a lógica de cada funcionalidade
│   │   ├── routes/              os endereços da API
│   │   ├── app.js               montagem do Express
│   │   └── server.js            inicialização do servidor
│   ├── prisma7.config.ts
│   └── .env.example
│
└── frontend/
    └── src/
        ├── components/          peças reutilizáveis de tela
        ├── pages/               uma por tela da plataforma
        ├── services/api.js      configuração do Axios
        ├── contexts/            usuário logado
        ├── App.jsx              mapa de rotas
        └── index.css            todos os estilos
```

### O que faz cada pasta do backend

| Pasta | Responsabilidade |
|---|---|
| `routes/` | Define os endereços da API e encaminha cada requisição ao controller certo |
| `controllers/` | Contém a lógica: recebe os dados, consulta o banco via Prisma, devolve JSON |
| `config/` | Configurações compartilhadas — aqui, a conexão com o banco |
| `middlewares/` | Funções que rodam **antes** dos controllers (verificar token, verificar admin) |
| `app.js` | Liga o Express, o CORS, a leitura de JSON e as rotas |
| `server.js` | Coloca a aplicação no ar em uma porta |

---

## Como executar — duas opções

Existem dois caminhos. Escolha **um**:

| | Com Docker | Instalação manual |
|---|---|---|
| Esforço | um comando | ~15 minutos |
| Precisa instalar | só o Docker | Node.js + PostgreSQL |
| Versões | idênticas em qualquer máquina | dependem do que já está instalado |
| Indicado para | laboratório do IFRS, apresentação, outro computador | quem já tem o ambiente montado |

A opção com Docker é a recomendada quando o projeto vai rodar em outra máquina — é o que elimina o clássico "na minha casa funciona e aqui não".

---

## Opção A — Com Docker (recomendada)

### 1. Instalar o Docker

```bash
sudo apt update
sudo apt install docker.io docker-compose-v2

# Permite usar o docker sem digitar "sudo" toda vez
sudo usermod -aG docker $USER
```

Depois do `usermod`, **saia da sessão e entre de novo** (ou reinicie o computador) para a permissão valer.

Conferir:

```bash
docker --version
docker compose version
docker ps            # deve listar uma tabela vazia, sem erro de permissão
```

### 2. Subir a plataforma

```bash
git clone https://github.com/ewbriao1978/reviva.git
cd reviva
docker compose up
```

Só isso. Na primeira vez demora alguns minutos, porque o Docker baixa as imagens e instala as dependências. Nas próximas, sobe em segundos.

Quando aparecer `Rodando em: http://localhost:3000`, abra **http://localhost:5173**.

### 3. Comandos do dia a dia

```bash
docker compose up          # sobe tudo
docker compose up -d       # sobe em segundo plano
docker compose logs -f     # acompanha os logs
docker compose down        # para tudo (o banco é preservado)
docker compose down -v     # para tudo e APAGA o banco
docker compose up --build  # reconstrói após mudar o package.json
```

Para rodar um comando dentro do container do backend:

```bash
docker compose exec backend npm run seed       # recria os dados
docker compose exec backend npx prisma studio  # abre o Prisma Studio
docker compose exec db psql -U reviva reviva_db  # abre o terminal do banco
```

### O que o Docker sobe

| Container | O que é | Porta no seu computador |
|---|---|---|
| `reviva-db` | PostgreSQL 16 | 5435 |
| `reviva-backend` | API Node.js + Express | 3000 |
| `reviva-frontend` | React + Vite | 5173 |

A porta do banco é a **5435**, e não a 5432, de propósito: assim não conflita com um PostgreSQL que já esteja instalado na máquina.

As migrations e o seed rodam **automaticamente** quando o container do backend inicia (ver `backend/docker-entrypoint.sh`). O seed só insere dados se o banco estiver vazio, então reiniciar não apaga o progresso de ninguém.

### Editar o código com o Docker rodando

Os arquivos do seu computador estão ligados aos containers. Ao salvar uma alteração, ela vale na hora: o backend reinicia sozinho e o navegador recarrega. Não é preciso reconstruir nada.

---

## Opção B — Instalação manual (Ubuntu / Linux)

### 1. Verificar o Node.js

```bash
node -v    # precisa ser v18 ou superior
npm -v
```

Se não estiver instalado:

```bash
sudo apt update
sudo apt install nodejs npm
```

> Se o `npm` não for encontrado mesmo com o `node` instalado, você provavelmente usa o **nvm**. Nesse caso, rode `source ~/.nvm/nvm.sh` em cada terminal novo.

### 2. Instalar o PostgreSQL

```bash
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl status postgresql    # deve aparecer "active"
```

### 3. Criar o usuário e o banco

```bash
sudo -u postgres psql -c "CREATE USER reviva PASSWORD 'reviva123' CREATEDB;"
sudo -u postgres psql -c "CREATE DATABASE reviva_db OWNER reviva;"
```

O que cada parte faz: `CREATE USER` cria o usuário do banco; `CREATEDB` dá a ele permissão para criar bancos (necessária para as migrations); `CREATE DATABASE ... OWNER` cria o `reviva_db` pertencente a esse usuário.

Conferir:

```bash
PGPASSWORD=reviva123 psql -h localhost -U reviva -d reviva_db -c "SELECT current_database();"
```

### 4. Baixar o projeto

```bash
git clone <URL-DO-REPOSITORIO>
cd projeto
```

### 5. Configurar e preparar o backend

```bash
cd backend
npm install              # instala as dependências
cp .env.example .env     # cria o arquivo de configuração
npm run migrate          # cria as tabelas (digite "inicial" quando pedir o nome)
npm run seed             # insere módulos, conteúdos e a simulação
```

O que cada comando faz:

- `npm install` — baixa as bibliotecas e, pelo script `postinstall`, já gera o Prisma Client
- `npm run migrate` — lê o `schema.prisma`, gera o SQL e cria as tabelas; o arquivo fica salvo em `prisma/migrations/`
- `npm run seed` — popula o banco com os 5 módulos, 18 conteúdos, a simulação de Engasgos (4 etapas, 8 alternativas) e 2 usuários

### 6. Instalar o frontend

```bash
cd ../frontend
npm install
```

---

## Como executar

São necessários **dois terminais**, um para cada parte.

**Terminal 1 — backend:**

```bash
cd backend
npm run dev
```

Deve aparecer: `Rodando em: http://localhost:3000`

**Terminal 2 — frontend:**

```bash
cd frontend
npm run dev
```

Deve aparecer: `Local: http://localhost:5173`

Agora abra **http://localhost:5173** no navegador.

### Credenciais de demonstração

> Criadas pelo `seed.js`, válidas **apenas no ambiente local de desenvolvimento**. Não devem ser usadas em um sistema publicado.

| Perfil | Email | Senha |
|---|---|---|
| Administrador | `admin@reviva.local` | `admin123` |
| Aluno | `aluno@reviva.local` | `aluno123` |

### Outros comandos úteis

```bash
npm run studio    # abre o Prisma Studio: visualiza as tabelas no navegador
npm run seed      # recria os dados iniciais (apaga o progresso existente)
```

---

## As oito tabelas do banco

Seguem o Diagrama Entidade-Relacionamento do TCC (Figura 6).

| Tabela | Guarda |
|---|---|
| `usuarios` | contas de acesso (senha sempre em hash bcrypt) |
| `modulos` | os cinco temas |
| `conteudos` | o material de leitura de cada módulo |
| `progresso_conteudo` | quais conteúdos cada usuário concluiu |
| `simulacoes` | a atividade de decisão de cada módulo |
| `etapa_simulacao` | cada cena apresentada dentro de uma simulação |
| `alternativas` | as opções de escolha e seus feedbacks |
| `progresso_simulacao` | o andamento de cada usuário em cada simulação |

### Como os relacionamentos funcionam

**Um para muitos (1:N).** Um módulo tem vários conteúdos, e cada conteúdo pertence a um só módulo. No banco isso é a coluna `id_modulo` na tabela `conteudos`. O mesmo padrão vale para módulo→simulações, simulação→etapas e etapa→alternativas.

**Muitos para muitos (N:N).** Um usuário conclui vários conteúdos e um conteúdo é concluído por vários usuários. A tabela `progresso_conteudo` resolve isso: ela carrega as duas chaves estrangeiras mais os dados próprios da relação (`concluido`, `data_conclusao`).

**Auto-relacionamento — o coração da simulação.** A tabela `alternativas` tem **duas** ligações para `etapa_simulacao`: `id_etapa` (onde a alternativa aparece) e `id_proxima_etapa` (para onde a escolha leva). É isso que permite que decisões diferentes tenham consequências diferentes — o encadeamento está nos **dados**, não no código.

### Ajustes feitos em relação ao DER do TCC

1. **`tipo` em `usuarios`** — o DER não tinha como distinguir o administrador, mas os requisitos RF14 a RF17 preveem esse ator. Sem o campo, metade dos requisitos seria inimplementável.
2. **`ativo` / `ativa`** em `modulos` e `simulacoes` — permitem ocultar um item sem apagar o progresso dos usuários.
3. **`titulo` em `etapa_simulacao`** — o protótipo da Figura 5 mostra um título acima da situação.
4. **Restrição `UNIQUE`** em `progresso_simulacao` (usuário + simulação) — sem ela, repetir uma simulação criaria registros duplicados e o progresso passaria de 100%.

Nenhuma tabela foi criada ou removida.

---

## A API

Todas as respostas são em JSON. Exceto `/api/auth/*`, todas exigem o cabeçalho `Authorization: Bearer <token>`.

| Método | Rota | Função |
|---|---|---|
| POST | `/api/auth/register` | cadastro |
| POST | `/api/auth/login` | login |
| GET/PUT | `/api/usuarios/perfil` | ver e alterar o próprio perfil |
| GET | `/api/usuarios` | listar usuários (**admin**) |
| DELETE | `/api/usuarios/:id` | excluir usuário (**admin**) |
| GET | `/api/modulos` | listar módulos ativos |
| GET | `/api/modulos/:id` | um módulo com conteúdos e simulações |
| POST/PUT/DELETE | `/api/modulos` | gerenciar módulos (**admin**) |
| GET | `/api/conteudos/modulo/:moduloId` | conteúdos de um módulo |
| GET | `/api/conteudos/:id` | abrir um conteúdo |
| POST/PUT/DELETE | `/api/conteudos` | gerenciar conteúdos (**admin**) |
| GET | `/api/simulacoes` | todas as simulações |
| GET | `/api/simulacoes/:id` | iniciar ou retomar uma simulação |
| POST | `/api/simulacoes/responder` | enviar a escolha e receber o feedback |
| POST | `/api/simulacoes/:id/reiniciar` | refazer a simulação |
| POST | `/api/simulacoes/etapas` | cadastrar etapa (**admin**) |
| POST/PUT/DELETE | `/api/simulacoes/alternativas` | cadastrar alternativas (**admin**) |
| GET | `/api/progresso` | progresso geral e por módulo |
| POST | `/api/progresso/conteudo/:id` | marcar conteúdo concluído |
| POST | `/api/progresso/simulacao/:id` | registrar simulação concluída |

Códigos de resposta usados: `200` sucesso · `201` criado · `400` dados inválidos · `401` sem token ou token inválido · `403` sem permissão · `404` não encontrado · `409` conflito (email duplicado) · `500` erro no servidor.

---

## Decisões de implementação

**As alternativas chegam ao navegador sem a resposta.** Ao abrir uma simulação, a API envia apenas o texto das alternativas — os campos `correta` e `feedback` ficam de fora. Sem esse cuidado, bastaria abrir as ferramentas do navegador para ver qual é a certa. Eles só são revelados em `POST /api/simulacoes/responder`, depois da escolha.

**O token fica no `localStorage`.** É a opção mais simples e por isso foi escolhida no MVP. A limitação é que um script malicioso injetado na página conseguiria lê-lo (ataque XSS). Em um sistema em produção, a alternativa mais segura seria um cookie `httpOnly`, que o JavaScript da página não consegue acessar.

**A proteção do frontend é só de navegação.** Esconder o menu "Administração" e bloquear a URL melhora a experiência, mas quem realmente protege é o `adminMiddleware` do backend. Mesmo que alguém force o endereço `/admin`, as chamadas à API voltam com erro 403.

**A senha nunca sai do banco.** As consultas de usuário usam `select` com a lista de campos públicos, e o campo `senhaHash` não está nela.

---

## Problemas conhecidos

> Os problemas abaixo são da **instalação manual**. Com Docker nenhum deles acontece: o container do PostgreSQL nasce limpo e as versões são sempre as mesmas.

### `template database "template1" has a collation version mismatch`

Acontece quando o sistema operacional foi atualizado depois da instalação do PostgreSQL (a biblioteca de idioma, a glibc, mudou de versão). O PostgreSQL passa a recusar a criação de bancos novos.

**Solução:**

```bash
sudo -u postgres psql -c "ALTER DATABASE template1 REFRESH COLLATION VERSION;"
```

**Alternativa sem `sudo`** — criar o banco a partir do `template0`, que não tem essa divergência:

```bash
PGPASSWORD=reviva123 createdb -h localhost -U reviva -T template0 reviva_db
```

Se o erro aparecer no `npm run migrate`, é porque o Prisma cria um banco temporário para validar as migrations. Nesse caso, crie-o manualmente e mantenha a linha `SHADOW_DATABASE_URL` no `.env`:

```bash
PGPASSWORD=reviva123 createdb -h localhost -U reviva -T template0 reviva_shadow
```

### `Failed to load resource` / erro de CORS

O Vite usa a porta 5174 quando a 5173 já está ocupada. O CORS do backend aceita qualquer porta do `localhost`, então isso não deve mais ocorrer — mas se ocorrer, feche as outras instâncias do Vite e reinicie.

### `does not provide an export named 'PrismaClient'`

O Prisma Client ainda não foi gerado. Rode:

```bash
cd backend && npx prisma generate
```

---

## Roteiro de testes manuais

| # | Ação | Resultado esperado |
|---|---|---|
| 1 | Cadastrar uma conta nova | Entra direto na plataforma |
| 2 | Cadastrar com o mesmo email | Mensagem "Este email já está cadastrado" |
| 3 | Cadastrar com senha de 3 caracteres | Mensagem sobre o mínimo de 6 caracteres |
| 4 | Login com senha errada | "Email ou senha incorretos" |
| 5 | Login correto | Vai para o painel com o nome do usuário |
| 6 | Ver o painel | Progresso em 0% e os cinco módulos |
| 7 | Abrir o módulo Engasgos | Lista com 6 conteúdos e 1 simulação |
| 8 | Abrir um conteúdo | Texto aparece com o sumário ao lado |
| 9 | Marcar como concluído | Etiqueta muda para "Concluído" |
| 10 | Voltar ao painel | Percentual aumentou |
| 11 | Iniciar a simulação | Situação "Refeição com Colega" com 4 alternativas |
| 12 | Escolher a alternativa A | Feedback explicando; vai para "A obstrução continua" |
| 13 | Refazer e escolher a B | Feedback positivo; vai para "Acionamento do socorro" |
| 14 | Concluir a simulação | Chega ao encerramento e o progresso sobe |
| 15 | Clicar em "Refazer simulação" | Volta à primeira situação |
| 16 | Ver "Meu Progresso" | Percentuais por módulo conferem |
| 17 | Sair da conta | Volta ao login |
| 18 | Entrar como `aluno` e digitar `/admin` na URL | Redireciona para o painel |
| 19 | Entrar como `admin` | Aparece o item "Administração" no menu |
| 20 | Cadastrar um módulo pelo painel admin | Aparece na lista e no menu de módulos |
| 21 | Excluir esse módulo | Avisa quantos conteúdos serão removidos junto |

Os testes 12 e 13 são os mais importantes da defesa: mostram que decisões diferentes levam a caminhos diferentes, e que isso vem do banco de dados.

---

## Licença e uso

Projeto acadêmico, desenvolvido como Trabalho de Conclusão de Curso. O conteúdo educativo de primeiros socorros depende de validação da área de Enfermagem antes de qualquer uso público.
