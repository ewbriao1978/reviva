# REVIVA — Documentação para a defesa

**Guia dos conceitos técnicos da plataforma, explicados com exemplos do próprio código do projeto.**

Este documento serve para você entender e conseguir explicar à banca como a REVIVA funciona por dentro. Cada conceito vem com: uma explicação simples, onde ele aparece no projeto e uma frase pronta que você pode usar na defesa.

---

## Sumário

1. [O que é frontend](#1-o-que-é-frontend)
2. [O que é backend](#2-o-que-é-backend)
3. [O que é uma API REST](#3-o-que-é-uma-api-rest)
4. [Como o React se comunica com o Express](#4-como-o-react-se-comunica-com-o-express)
5. [O que é Axios](#5-o-que-é-axios)
6. [O que é uma rota](#6-o-que-é-uma-rota)
7. [O que é um controller](#7-o-que-é-um-controller)
8. [O que é um middleware](#8-o-que-é-um-middleware)
9. [O que é o Prisma ORM](#9-o-que-é-o-prisma-orm)
10. [O que é o PostgreSQL](#10-o-que-é-o-postgresql)
11. [O que são migrations](#11-o-que-são-migrations)
12. [Como funcionam os relacionamentos do banco](#12-como-funcionam-os-relacionamentos-do-banco)
13. [Como funciona o login com JWT](#13-como-funciona-o-login-com-jwt)
14. [Como o sistema registra o progresso](#14-como-o-sistema-registra-o-progresso)
15. [Como funciona o mecanismo de simulação](#15-como-funciona-o-mecanismo-de-simulação)

---

## A visão geral — guarde esta imagem

Antes dos conceitos isolados, entenda o caminho que **todo** dado percorre na REVIVA. Se você souber explicar este desenho, já explicou metade da arquitetura:

```
   NAVEGADOR                    SERVIDOR                    BANCO
┌──────────────┐           ┌──────────────┐          ┌──────────────┐
│    React     │  Axios    │   Express    │  Prisma  │  PostgreSQL  │
│   (Vite)     │ ──JSON──▶ │              │ ──SQL──▶ │              │
│  porta 5173  │ ◀──JSON── │  porta 3000  │ ◀─────── │  porta 5432  │
└──────────────┘           └──────────────┘          └──────────────┘
    o que o                   as regras                 onde os dados
  usuário vê                 do sistema                 ficam guardados
```

**A frase para a banca:** *"A REVIVA é dividida em três partes. O React desenha as telas no navegador. O Express recebe os pedidos e aplica as regras. O PostgreSQL guarda os dados. Elas conversam por mensagens em JSON."*

---

## 1. O que é frontend

**Frontend é tudo o que roda no navegador do usuário** — as telas, os botões, as cores, os campos de formulário. É a parte que a pessoa vê e com a qual interage.

Na REVIVA, o frontend é feito com **React**, e fica inteiro na pasta `frontend/`.

Um detalhe importante: o frontend **não tem acesso ao banco de dados**. Ele não sabe nem a senha do PostgreSQL. Tudo o que ele precisa, pede ao backend. Isso é proposital — se o navegador pudesse falar direto com o banco, qualquer usuário poderia abrir as ferramentas do navegador e apagar dados.

**Onde ver no projeto:** `frontend/src/pages/` — cada arquivo é uma tela.

> **Para a banca:** *"Frontend é a parte visual, que roda no navegador. No meu projeto são as páginas em React: login, painel, módulos, conteúdos e simulação."*

---

## 2. O que é backend

**Backend é o programa que roda no servidor.** Ele não tem telas. Sua função é receber pedidos, aplicar as regras do sistema, conversar com o banco de dados e devolver respostas.

Na REVIVA, o backend é feito com **Node.js + Express**, e fica na pasta `backend/`.

É no backend que ficam as decisões importantes:

- conferir se a senha digitada está correta;
- verificar se o usuário tem permissão de administrador;
- calcular o percentual de progresso;
- decidir qual é a próxima etapa da simulação.

**Por que essas decisões não ficam no frontend?** Porque o usuário controla o navegador. Ele poderia alterar o código da página. O servidor, não — ele está sob nosso controle. Por isso toda validação que importa é refeita no backend.

> **Para a banca:** *"Backend é a parte que roda no servidor e não aparece para o usuário. É onde estão as regras do sistema e o acesso ao banco de dados."*

---

## 3. O que é uma API REST

**API** significa *Application Programming Interface* — é o conjunto de endereços que o backend oferece para o frontend usar. Pense nela como um cardápio: cada item é um pedido que você pode fazer.

**REST** é um estilo de organizar esses endereços. Ele combina duas coisas:

**a) Um endereço que identifica o recurso:**

```
/api/modulos        → os módulos
/api/modulos/3      → o módulo de número 3
/api/conteudos/12   → o conteúdo de número 12
```

**b) Um verbo HTTP que diz o que fazer com ele:**

| Verbo | Significa | Exemplo na REVIVA |
|---|---|---|
| `GET` | buscar | `GET /api/modulos` → lista os módulos |
| `POST` | criar | `POST /api/modulos` → cadastra um módulo |
| `PUT` | alterar | `PUT /api/modulos/3` → edita o módulo 3 |
| `DELETE` | excluir | `DELETE /api/modulos/3` → apaga o módulo 3 |

Repare que o **endereço é o mesmo** (`/api/modulos/3`) — o que muda é o verbo. Essa é a ideia central do REST.

As respostas vêm sempre em **JSON**, um formato de texto que tanto o JavaScript quanto as pessoas conseguem ler:

```json
{
  "id": 1,
  "titulo": "Engasgos",
  "descricao": "Técnicas de desobstrução de vias aéreas."
}
```

### Os códigos de resposta

Toda resposta traz um número que resume o que aconteceu:

| Código | Significa | Quando acontece na REVIVA |
|---|---|---|
| `200` | deu certo | login válido, lista de módulos |
| `201` | criado | cadastro realizado |
| `400` | pedido errado | senha com menos de 6 caracteres |
| `401` | não identificado | sem token ou token expirado |
| `403` | sem permissão | aluno tentando a área de admin |
| `404` | não encontrado | módulo que não existe |
| `409` | conflito | email já cadastrado |
| `500` | erro no servidor | falha inesperada |

> **Para a banca:** *"API REST é a forma como o frontend conversa com o backend. Cada endereço representa um recurso, e o verbo HTTP diz a ação: GET busca, POST cria, PUT altera, DELETE exclui. As respostas vêm em JSON com um código que indica o resultado."*

---

## 4. Como o React se comunica com o Express

Eles rodam em lugares diferentes e **só conversam por HTTP** — o mesmo protocolo que o navegador usa para abrir qualquer site.

Vamos seguir um clique de ponta a ponta. O usuário clica em "Marcar como concluído":

**Passo 1 — o React dispara o pedido** (`frontend/src/pages/Conteudo.jsx`):

```javascript
await api.post(`/progresso/conteudo/${conteudo.id}`);
```

**Passo 2 — vira uma requisição HTTP de verdade:**

```
POST http://localhost:3000/api/progresso/conteudo/12
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Passo 3 — o Express encontra a rota** (`backend/src/routes/progressoRoutes.js`):

```javascript
router.post("/conteudo/:conteudoId", autenticar, concluirConteudo);
```

**Passo 4 — o middleware confere o token** e descobre quem é o usuário.

**Passo 5 — o controller grava no banco** (`backend/src/controllers/progressoController.js`):

```javascript
await prisma.progressoConteudo.upsert({ ... });
```

**Passo 6 — a resposta volta em JSON:**

```json
{ "mensagem": "Conteudo marcado como concluido." }
```

**Passo 7 — o React atualiza a tela** e a etiqueta muda para "Concluído".

### O CORS

Existe uma regra de segurança do navegador chamada **mesma origem**: uma página carregada de `localhost:5173` não pode, por padrão, chamar `localhost:3000`. São endereços diferentes, e o navegador bloqueia.

O **CORS** (*Cross-Origin Resource Sharing*) é o mecanismo pelo qual o servidor autoriza essa chamada. No nosso `backend/src/app.js`:

```javascript
app.use(cors({ origin: function (origem, liberar) { ... } }));
```

Sem essa linha, o login não funcionaria e o navegador mostraria um erro de CORS no console.

> **Para a banca:** *"O React faz requisições HTTP para o Express usando o Axios. O Express responde em JSON e o React atualiza a tela. Como os dois rodam em endereços diferentes, o backend precisa liberar essa comunicação com o CORS."*

---

## 5. O que é Axios

**Axios é uma biblioteca que facilita fazer requisições HTTP** a partir do JavaScript. Ele é usado no frontend para conversar com a API.

Em vez de escrever o endereço completo em cada tela, criamos uma configuração única em `frontend/src/services/api.js`:

```javascript
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
});
```

A partir daí, `api.get("/modulos")` já significa `GET http://localhost:3000/api/modulos`.

### Os interceptadores — o truque mais útil do projeto

Um **interceptador** é uma função que roda automaticamente em toda requisição. Usamos dois.

**O primeiro anexa o token em tudo:**

```javascript
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

Graças a ele, **nenhuma página precisa se preocupar com o token**. Sem isso, cada uma das 11 telas teria que lembrar de anexá-lo manualmente — e bastaria esquecer em uma para aparecer um erro 401 difícil de achar.

**O segundo trata o token expirado:**

```javascript
api.interceptors.response.use(
  (resposta) => resposta,
  (erro) => {
    if (erro.response && erro.response.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(erro);
  }
);
```

Quando o token vence, o usuário é levado de volta ao login automaticamente.

> **Para a banca:** *"Axios é a biblioteca que o React usa para chamar a API. Configurei uma instância única com o endereço do backend, e um interceptador que anexa o token de login em todas as requisições automaticamente."*

---

## 6. O que é uma rota

**Uma rota liga um endereço + um verbo HTTP a uma função.** Ela é o "porteiro" que recebe o pedido e o encaminha ao lugar certo.

As rotas da REVIVA estão em `backend/src/routes/`, um arquivo por assunto.

```javascript
// backend/src/routes/moduloRoutes.js
router.get("/", autenticar, listarModulos);
router.get("/:id", autenticar, buscarModulo);
router.post("/", autenticar, apenasAdmin, criarModulo);
```

Leia a terceira linha assim: *"quando chegar um POST na raiz, execute o `autenticar`, depois o `apenasAdmin`, e só então o `criarModulo`."*

Os arquivos de rotas são ligados aos seus prefixos no `app.js`:

```javascript
app.use("/api/modulos", moduloRoutes);
```

Por isso o `router.get("/")` daquele arquivo responde, na prática, em `GET /api/modulos`.

### Os dois-pontos

`"/:id"` marca um pedaço variável do endereço. Em `/api/modulos/3`, o valor `3` chega ao controller como `req.params.id`.

### ⚠️ A ordem das rotas importa

Este é um detalhe que costuma gerar bugs confusos. O Express testa as rotas **de cima para baixo** e usa a primeira que combinar. Como `/:id` combina com qualquer texto, ela precisa ficar **depois** das rotas com nome fixo:

```javascript
// CERTO
router.post("/responder", ...);     // nome fixo primeiro
router.get("/:id", ...);            // variável depois

// ERRADO
router.get("/:id", ...);            // esta capturaria "responder"
router.post("/responder", ...);     // e esta nunca seria alcançada
```

> **Para a banca:** *"Rota é o endereço da API. Ela recebe a requisição e chama o controller certo. Organizei um arquivo de rotas para cada recurso: módulos, conteúdos, simulações, progresso, usuários e autenticação."*

---

## 7. O que é um controller

**O controller é onde está a lógica de cada funcionalidade.** Ele recebe os dados, conversa com o banco e devolve a resposta.

Ficam em `backend/src/controllers/`. A estrutura é sempre a mesma:

```javascript
export async function listarModulos(req, res) {
  try {
    const modulos = await prisma.modulo.findMany({
      where: { ativo: true },
      orderBy: { ordem: "asc" },
    });

    return res.json(modulos);
  } catch (error) {
    console.error("Erro ao listar modulos:", error);
    return res.status(500).json({ mensagem: "Erro ao buscar os modulos." });
  }
}
```

**Os dois parâmetros:**

- `req` (*request*) — o que chegou: `req.body` (dados do formulário), `req.params` (parte variável da URL), `req.usuario` (quem está logado, colocado ali pelo middleware)
- `res` (*response*) — o que devolvemos: `res.json(...)`, `res.status(404).json(...)`

**O `try/catch`** garante que, se algo der errado (o banco cair, por exemplo), o servidor responda com um erro 500 em vez de travar.

**O `async/await`** serve porque conversar com o banco demora. O `await` significa "espere a resposta antes de continuar".

> **Para a banca:** *"Controller é onde fica a lógica. Ele recebe a requisição, consulta o banco pelo Prisma e devolve a resposta em JSON. Separei um controller para cada assunto do sistema."*

---

## 8. O que é um middleware

**Middleware é uma função que roda ANTES do controller.** Ele fica no meio do caminho — daí o nome.

Ele recebe três parâmetros e decide se o pedido continua ou para:

```javascript
export function autenticar(req, res, next) {
  const cabecalho = req.headers.authorization;

  if (!cabecalho) {
    return res.status(401).json({ mensagem: "Token nao enviado." });
  }

  const token = cabecalho.split(" ")[1];

  try {
    const dados = jwt.verify(token, process.env.JWT_SECRET);

    req.usuario = { id: dados.id, tipo: dados.tipo };

    return next();   // libera a passagem
  } catch (error) {
    return res.status(401).json({ mensagem: "Token invalido ou expirado." });
  }
}
```

**A regra é simples:**

- se chamar `next()`, o pedido segue para o próximo passo;
- se responder (`res.status(...).json(...)`), o pedido **para ali** e o controller nem é executado.

### Os dois middlewares da REVIVA

| Arquivo | Função | Erro que devolve |
|---|---|---|
| `authMiddleware.js` | o usuário está logado? | `401` |
| `adminMiddleware.js` | o usuário é administrador? | `403` |

Eles podem ser usados em sequência:

```javascript
router.delete("/:id", autenticar, apenasAdmin, excluirModulo);
//                    ↑ 1º         ↑ 2º         ↑ 3º
```

**A diferença entre 401 e 403** é uma pergunta clássica de banca:

- **401** = *"não sei quem você é"* — falta o token ou ele é inválido
- **403** = *"sei quem você é, mas você não pode fazer isso"* — é um usuário comum tentando algo de administrador

### O detalhe que faz o `req.usuario` ser confiável

O middleware coloca `req.usuario` na requisição a partir do **token**, não de algo enviado pelo navegador. Como o token é assinado pelo servidor, o usuário não consegue alterá-lo sem invalidar a assinatura — ou seja, **ninguém consegue se declarar ADMIN por conta própria**.

> **Para a banca:** *"Middleware é uma função que roda antes do controller. Tenho dois: um verifica se o token é válido e identifica o usuário; outro verifica se ele é administrador. Se a verificação falhar, a requisição nem chega no controller."*

---

## 9. O que é o Prisma ORM

**ORM** significa *Object-Relational Mapping* — mapeamento objeto-relacional. É uma ferramenta que permite trabalhar com o banco de dados usando **JavaScript**, em vez de escrever SQL na mão.

Compare. Com SQL puro:

```sql
SELECT * FROM modulos WHERE ativo = true ORDER BY ordem ASC;
```

Com o Prisma:

```javascript
await prisma.modulo.findMany({
  where: { ativo: true },
  orderBy: { ordem: "asc" },
});
```

### As três vantagens

1. **O editor ajuda.** Ao digitar `prisma.modulo.`, ele sugere os campos que existem. Se você escrever `titlo` em vez de `titulo`, o erro aparece na hora.
2. **Protege contra SQL Injection.** O Prisma trata os valores separadamente do comando, então um usuário mal-intencionado não consegue injetar SQL em um campo de formulário.
3. **Controla a estrutura do banco.** É o Prisma que cria e altera as tabelas, a partir do `schema.prisma`.

### Os três arquivos do Prisma no projeto

| Arquivo | Para que serve |
|---|---|
| `prisma/schema.prisma` | descreve as 8 tabelas e seus relacionamentos |
| `prisma7.config.ts` | diz ao Prisma onde está o schema e qual a URL do banco |
| `src/config/db.js` | cria a conexão usada pelos controllers |

### Por que o `db.js` existe

```javascript
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

export default prisma;
```

Criamos a conexão **uma única vez** e todos os controllers a importam. Se cada um criasse a sua, o banco acabaria com dezenas de conexões abertas sem necessidade.

### Sobre a versão 7

O Prisma 7 trouxe duas mudanças que aparecem no projeto:

- a URL do banco saiu do `schema.prisma` e foi para o `prisma7.config.ts`, lendo a variável `DATABASE_URL` do `.env` — assim a senha nunca vai para o repositório;
- a conexão passa por um **driver adapter** (`@prisma/adapter-pg`), que usa a biblioteca `pg` por baixo.

> **Para a banca:** *"Prisma é um ORM: ele deixa eu acessar o banco escrevendo JavaScript em vez de SQL. Eu descrevo as tabelas no schema.prisma e ele gera o banco e o código de acesso."*

---

## 10. O que é o PostgreSQL

**PostgreSQL é o sistema de banco de dados** da REVIVA. É nele que ficam guardados os usuários, os módulos, os conteúdos, as simulações e o progresso de cada pessoa.

É um banco **relacional**: os dados ficam em tabelas (linhas e colunas, como numa planilha), e as tabelas se relacionam entre si.

### Por que um banco relacional é a escolha certa aqui

Os dados da REVIVA são muito conectados: um conteúdo pertence a um módulo, um progresso pertence a um usuário e a um conteúdo, uma alternativa pertence a uma etapa e aponta para outra. O banco relacional garante essas ligações automaticamente — ele **recusa** gravar um conteúdo apontando para um módulo que não existe.

### Vocabulário para a defesa

| Termo | O que é |
|---|---|
| **Tabela** | um conjunto de dados do mesmo tipo (`usuarios`, `modulos`) |
| **Coluna** | uma informação (`nome`, `email`) |
| **Linha / registro** | um item (um usuário específico) |
| **Chave primária** | o identificador único da linha (`id`) |
| **Chave estrangeira** | a coluna que aponta para outra tabela (`id_modulo`) |
| **Restrição UNIQUE** | impede valores repetidos (dois usuários com o mesmo email) |

### Observação honesta sobre o TCC

O texto do TCC menciona **MySQL** na seção 3.3. A implementação usa **PostgreSQL**. Os dois são bancos relacionais e o modelo de dados é o mesmo — a mudança não afeta o DER. Se a banca perguntar, a resposta direta é que a decisão foi tomada na fase de implementação, pelo melhor suporte do PostgreSQL aos recursos usados pelo Prisma 7, e **a seção 3.3 do documento precisa ser atualizada**.

> **Para a banca:** *"PostgreSQL é o banco de dados relacional onde tudo fica guardado. Escolhi um banco relacional porque os dados da REVIVA são muito ligados entre si, e ele garante essas relações."*

---

## 11. O que são migrations

**Uma migration é um registro de uma alteração feita no banco de dados.** É como um histórico de versões, só que das tabelas em vez do código.

### O problema que elas resolvem

Imagine criar as tabelas manualmente, digitando SQL. Agora imagine passar o projeto para outra pessoa — ela teria que repetir todos os comandos, na ordem certa, sem errar. E se você acrescentasse uma coluna depois, teria que avisar todo mundo.

Com migrations, o processo vira:

```bash
npm run migrate
```

E o banco fica exatamente igual ao seu.

### Como funciona na prática

1. Você descreve as tabelas no `schema.prisma`
2. Roda `npx prisma migrate dev --name inicial`
3. O Prisma compara o schema com o banco, gera o SQL da diferença e aplica
4. O SQL fica salvo em `prisma/migrations/20261119191630_inicial/migration.sql`

Esse arquivo **vai para o GitHub**. É ele que permite recriar o banco inteiro em qualquer computador.

Um trecho do arquivo gerado no projeto:

```sql
CREATE TABLE "usuarios" (
    "id_usuario" SERIAL NOT NULL,
    "nome" VARCHAR(100) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "senha_hash" TEXT NOT NULL,
    ...
    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id_usuario")
);
```

### Os dois comandos

| Comando | Quando usar |
|---|---|
| `prisma migrate dev` | no seu computador, ao alterar o schema |
| `prisma migrate deploy` | em produção ou no Docker: só aplica o que já existe |

O `docker-entrypoint.sh` usa o `deploy`, porque ele não faz perguntas e é seguro para rodar automaticamente.

### Migration ≠ seed

São coisas diferentes, e confundi-las é um erro comum:

- **migration** cria a **estrutura** (as tabelas vazias)
- **seed** insere os **dados** (os 5 módulos, os conteúdos, a simulação)

> **Para a banca:** *"Migrations são o histórico de alterações do banco. Eu descrevo as tabelas no schema e o Prisma gera o SQL. Esse arquivo fica versionado, então qualquer pessoa consegue recriar o banco idêntico rodando um comando."*

---

## 12. Como funcionam os relacionamentos do banco

A REVIVA tem **8 tabelas**, conforme o DER do TCC (Figura 6):

```
usuarios          modulos ──────┬───── conteudos
   │                            │           │
   │                            └── simulacoes
   │                                  │     │
   │                      etapa_simulacao   │
   │                            │  ▲        │
   │                     alternativas        │
   │                                         │
   ├──── progresso_conteudo ─────────────────┘
   └──── progresso_simulacao
```

### Tipo 1 — Um para muitos (1:N)

**Um módulo tem vários conteúdos. Cada conteúdo pertence a um só módulo.**

No banco, isso é uma coluna `id_modulo` na tabela `conteudos`, apontando para `modulos.id_modulo`. Essa coluna é a **chave estrangeira**.

```prisma
model Conteudo {
  moduloId Int    @map("id_modulo")
  modulo   Modulo @relation(fields: [moduloId], references: [id], onDelete: Cascade)
}
```

O **`onDelete: Cascade`** significa: se o módulo for excluído, seus conteúdos somem junto. É isso que permite ao administrador excluir um módulo sem erro de chave estrangeira — e atende ao requisito de "excluir módulos respeitando os relacionamentos".

O mesmo padrão aparece em: módulo→simulações, simulação→etapas, etapa→alternativas.

### Tipo 2 — Muitos para muitos (N:N)

**Um usuário conclui vários conteúdos. Um conteúdo é concluído por vários usuários.**

Esse tipo de relação **não cabe em uma coluna**. A solução é uma terceira tabela, que carrega as duas chaves estrangeiras:

```prisma
model ProgressoConteudo {
  usuarioId     Int
  conteudoId    Int
  concluido     Boolean
  dataConclusao DateTime?

  @@unique([usuarioId, conteudoId])
}
```

Repare que ela guarda **mais do que as duas chaves**: tem também `concluido` e `dataConclusao`. São atributos *da relação* — não do usuário nem do conteúdo, mas do encontro entre os dois.

**É por isso que `progresso_conteudo` não é uma "tabela a mais"** — é a forma correta de representar N:N com atributos. Essa pergunta pode aparecer na banca.

O **`@@unique([usuarioId, conteudoId])`** garante no banco que não existam dois registros do mesmo usuário para o mesmo conteúdo. Sem ele, marcar duas vezes criaria duplicatas e o progresso passaria de 100%.

### Tipo 3 — Auto-relacionamento (o coração da simulação)

A tabela `alternativas` tem **duas** chaves estrangeiras para a **mesma** tabela:

```prisma
model Alternativa {
  etapaId        Int   @map("id_etapa")           // onde a alternativa aparece
  proximaEtapaId Int?  @map("id_proxima_etapa")   // para onde ela leva

  etapa        EtapaSimulacao  @relation("AlternativasDaEtapa", ...)
  proximaEtapa EtapaSimulacao? @relation("ProximaEtapa", ...)
}
```

Como são duas ligações entre as mesmas tabelas, o Prisma exige que cada uma tenha um **nome** (`"AlternativasDaEtapa"` e `"ProximaEtapa"`), senão não saberia qual é qual.

**É esse campo que faz a simulação funcionar.** Cada alternativa carrega o endereço da próxima cena — e, como cada uma pode apontar para uma etapa diferente, decisões diferentes levam a caminhos diferentes.

O `proximaEtapaId` é **opcional** (`Int?`). Quando está vazio, significa "a simulação termina aqui".

### Ajustes feitos em relação ao DER do TCC

Vale conhecer, porque a banca pode comparar o documento com o sistema:

| Ajuste | Motivo |
|---|---|
| campo `tipo` em `usuarios` | o DER não tinha como distinguir o administrador, mas os requisitos RF14 a RF17 preveem esse ator |
| `ativo` / `ativa` em módulos e simulações | permite ocultar sem apagar o progresso |
| `titulo` em `etapa_simulacao` | o protótipo da Figura 5 mostra um título acima da situação |
| `UNIQUE` em `progresso_simulacao` | sem ele, repetir a simulação criaria registros duplicados |

**Nenhuma tabela foi criada ou removida.** As 8 do DER foram preservadas.

> **Para a banca:** *"Tenho três tipos de relação. 1:N, como módulo e conteúdos, que é uma chave estrangeira. N:N, como usuário e conteúdos concluídos, que exige uma tabela intermediária. E um auto-relacionamento nas alternativas, que apontam para a próxima etapa — é ele que permite o encadeamento das simulações."*

---

## 13. Como funciona o login com JWT

**JWT** significa *JSON Web Token*. É um texto que o servidor entrega ao usuário no login e que funciona como um **crachá**: a cada pedido, o usuário o apresenta para provar quem é.

### A primeira parte: guardar a senha

A senha **nunca** é gravada como texto. Usamos o **bcrypt**:

```javascript
const senhaHash = await bcrypt.hash(senha, 10);
```

Isso transforma `"aluno123"` em algo como `$2b$10$N9qo8uLOickgx2ZMRZoMy...`.

O processo é **de mão única**: não existe função que devolva a senha original a partir do hash. Nem quem tiver acesso ao banco consegue descobri-la.

**Como conferimos no login, então?** Refazendo o cálculo:

```javascript
const senhaConfere = await bcrypt.compare(senha, usuario.senhaHash);
```

O bcrypt aplica o mesmo processo na senha digitada e compara os resultados.

### A segunda parte: gerar o token

```javascript
jwt.sign(
  { id: usuario.id, tipo: usuario.tipo },   // o conteúdo
  process.env.JWT_SECRET,                    // a chave que assina
  { expiresIn: "7d" }                        // a validade
);
```

O token tem três partes separadas por pontos:

```
eyJhbGciOiJIUzI1NiIs.eyJpZCI6MiwidGlwbyI6IlVTVUFSSU8ifQ.UT2tETShDgFd
└─── cabeçalho ───┘ └────── dados ──────┘ └─── assinatura ───┘
```

### ⚠️ O detalhe que a banca pode perguntar

**O conteúdo do token NÃO é secreto.** Qualquer pessoa consegue lê-lo — basta colar em um site como o jwt.io. Por isso **nunca** colocamos a senha lá dentro, só o id e o tipo.

**O que o token garante não é sigilo, é autenticidade.** A assinatura é feita com a `JWT_SECRET`, que só o servidor conhece. Se alguém alterar o conteúdo — trocar `"tipo": "USUARIO"` por `"tipo": "ADMIN"` — a assinatura deixa de bater e o `jwt.verify` rejeita.

### O ciclo completo

```
1. Usuário digita email e senha
2. Backend busca o usuário e compara com bcrypt
3. Se bater, gera o token e devolve
4. React guarda o token no localStorage
5. Axios anexa o token em toda requisição seguinte
6. authMiddleware verifica a assinatura e preenche req.usuario
7. O controller já sabe quem está pedindo
```

### Sobre o localStorage

O token fica no `localStorage` do navegador, para o usuário continuar logado ao recarregar a página.

**A limitação, que é honesto reconhecer:** um script malicioso injetado na página conseguiria ler esse valor — é o ataque conhecido como **XSS**. A alternativa mais segura seria um cookie `httpOnly`, que o JavaScript da página não consegue acessar.

Para um MVP acadêmico rodando localmente, o `localStorage` é aceitável e muito mais simples. **Saber explicar essa limitação vale mais do que escondê-la** — mostra que a escolha foi consciente.

### Dois cuidados implementados

**1. A mesma mensagem para email inexistente e senha errada:**

```javascript
return res.status(401).json({ mensagem: "Email ou senha incorretos." });
```

Se fossem diferentes, alguém poderia descobrir quais emails estão cadastrados testando um por um.

**2. A senha nunca sai do banco.** As consultas usam `select` com a lista de campos públicos, e `senhaHash` não está nela.

> **Para a banca:** *"No cadastro, a senha é convertida em hash pelo bcrypt, que é irreversível. No login, comparo o hash e gero um token JWT assinado com uma chave secreta. O React guarda o token e o envia em toda requisição. Se alguém tentar alterar o token, a assinatura não bate e ele é rejeitado."*

---

## 14. Como o sistema registra o progresso

### A regra de ouro

**Nenhum percentual é fixo no código.** Todos são calculados na hora, contando os registros que existem no PostgreSQL. Se você apagar uma linha no banco, o percentual na tela muda.

### O que conta como atividade

Cada módulo tem: **conteúdos + simulações**. Ambos entram na conta, porque no protótipo do TCC (Figura 4) a simulação aparece como mais um item da lista do módulo.

```
Módulo Engasgos = 6 conteúdos + 1 simulação = 7 atividades
```

### A conta

```javascript
function calcularPercentual(concluidos, total) {
  if (total === 0) return 0;
  return Math.round((concluidos / total) * 100);
}
```

O `if (total === 0)` evita divisão por zero — um módulo recém-criado, ainda sem conteúdos, mostraria `NaN` na tela sem essa linha.

### Onde o progresso é gravado

Quando o usuário marca um conteúdo como concluído:

```javascript
await prisma.progressoConteudo.upsert({
  where: { usuarioId_conteudoId: { usuarioId, conteudoId } },
  update: { concluido: true, dataConclusao: new Date() },
  create: { usuarioId, conteudoId, concluido: true, dataConclusao: new Date() },
});
```

**O `upsert`** é "update + insert": atualiza se já existir, cria se não existir. Ele só funciona por causa do `@@unique([usuarioId, conteudoId])` definido no schema — é esse índice único que o Prisma usa para localizar a linha.

### O "Continue de onde parou" (RF08)

Essa funcionalidade depende de um campo que nem sempre é percebido: o `ultimoAcesso`.

**Toda vez que o usuário abre um conteúdo**, o `conteudoController.js` registra o horário:

```javascript
await prisma.progressoConteudo.upsert({
  where: { usuarioId_conteudoId: { usuarioId, conteudoId: id } },
  update: { ultimoAcesso: new Date() },
  create: { usuarioId, conteudoId: id, concluido: false, ultimoAcesso: new Date() },
});
```

Depois, o painel busca o conteúdo **mais recente que ainda não foi concluído**:

```javascript
const ultimoConteudo = await prisma.progressoConteudo.findFirst({
  where: { usuarioId, concluido: false, ultimoAcesso: { not: null } },
  orderBy: { ultimoAcesso: "desc" },
});
```

É assim que o card "Continue de onde parou" sabe o que sugerir.

### Teste que comprova o cálculo real

```
Estado inicial:  0 de 19 atividades  →   0%
Após 2 conteúdos + 1 simulação:
                 3 de 19 atividades  →  16%
Módulo Engasgos: 3 de 7              →  43%
```

Os valores batem: 3÷19 = 15,8% → 16%, e 3÷7 = 42,8% → 43%.

> **Para a banca:** *"O progresso é calculado em tempo real a partir do banco. Conto quantos conteúdos e simulações o usuário concluiu e divido pelo total do módulo. Não existe valor fixo no código — se eu apagar um registro no banco, o percentual muda na tela."*

---

## 15. Como funciona o mecanismo de simulação

Esta é a funcionalidade principal da REVIVA e, provavelmente, o que a banca vai querer ver funcionando.

### A ideia central

**O encadeamento está nos dados, não no código.**

Isso significa que o arquivo `Simulacao.jsx` **não contém nenhum texto** de situação, alternativa ou feedback. Ele apenas desenha o que vem do banco. Para criar uma simulação nova, ninguém precisa programar — basta cadastrar pela área administrativa.

### As três tabelas envolvidas

```
simulacoes
    │
    ├── etapa_simulacao  (cada "cena" apresentada)
    │        │
    │        └── alternativas  (as escolhas)
    │                 │
    │                 └── proximaEtapaId ──┐
    │                                      │
    └──────────────────────────────────────┘
              (aponta de volta para uma etapa)
```

### Os campos que comandam o motor

| Campo | Função |
|---|---|
| `ehInicial` | marca por onde a simulação começa |
| `ehFinal` | marca a etapa que encerra a simulação |
| `proximaEtapaId` | diz para onde cada alternativa leva |
| `correta` | indica a alternativa adequada |
| `feedback` | a explicação mostrada após a escolha |

**Por que `ehInicial` e `ehFinal` em vez de um número de ordem?** Porque a simulação não é uma lista linear — é uma árvore de decisões. "Ordem" não faria sentido quando os caminhos se ramificam. Esses dois campos vêm do DER do próprio TCC.

### O fluxo passo a passo

**1. O usuário abre a simulação** → `GET /api/simulacoes/1`

O backend procura onde ele está:

```javascript
// Se parou no meio, volta para onde estava
if (progresso && progresso.etapaAtualId && !progresso.concluido) {
  etapaAtual = simulacao.etapas.find((e) => e.id === progresso.etapaAtualId);
}

// Senão, começa pela etapa inicial
if (!etapaAtual) {
  etapaAtual = simulacao.etapas.find((e) => e.ehInicial);
}
```

**2. A etapa é enviada — mas sem a resposta**

Este é um cuidado importante:

```javascript
function prepararEtapa(etapa) {
  return {
    id: etapa.id,
    titulo: etapa.titulo,
    texto: etapa.texto,
    alternativas: etapa.alternativas.map((alternativa) => ({
      id: alternativa.id,
      texto: alternativa.texto,
      ordem: alternativa.ordem,
      // "correta" e "feedback" NÃO são enviados aqui
    })),
  };
}
```

**Por quê?** Se fossem enviados, bastaria o usuário abrir as ferramentas do navegador (F12), olhar a resposta da API e ver qual é a certa antes de escolher. Eles só são revelados **depois** da decisão.

**3. O usuário escolhe e confirma** → `POST /api/simulacoes/responder`

**4. O backend processa a decisão:**

```javascript
const proximaEtapa = alternativa.proximaEtapa;

// A simulação termina quando não há próxima etapa,
// ou quando a próxima está marcada como final.
const terminou = !proximaEtapa || proximaEtapa.ehFinal === true;

if (terminou) {
  dadosProgresso.concluido = true;
  dadosProgresso.dataConclusao = new Date();
}
```

**5. A resposta traz o feedback e o caminho:**

```json
{
  "correta": true,
  "feedback": "Decisao adequada. Os sinais descritos...",
  "concluida": false,
  "proximaEtapa": { "titulo": "Acionamento do socorro", ... }
}
```

**6. O ciclo recomeça** até chegar à etapa final.

### A ramificação — demonstre isto na defesa

A simulação de Engasgos tem **4 etapas** e **8 alternativas**. O mapa:

```
                 ETAPA 1 — "Refeição com Colega"
                  (4 alternativas, A a D)
                            │
         ┌──────────────────┴──────────────────┐
         │                                     │
    A, C, D (inadequadas)              B (Heimlich, correta)
         │                                     │
         ▼                                     │
  ETAPA 2 — "A obstrução continua"             │
   (a situação se agrava)                      │
         │                                     │
         └──────────────┬──────────────────────┘
                        ▼
         ETAPA 3 — "Acionamento do socorro"
                        │
                        ▼
         ETAPA 4 — "Encerramento"  (ehFinal = true)
                   → registra a conclusão
```

**O teste que prova o funcionamento:**

```
Alternativa 1 (errada)  → correta: false → leva a "A obstrução continua"
Alternativa 2 (correta) → correta: true  → leva a "Acionamento do socorro"
```

Mesma situação, duas decisões, **dois caminhos diferentes** — e nada disso está escrito em JavaScript. Está tudo no banco.

### Repetir a simulação

O diagrama de casos de uso do TCC prevê "Repetir simulação" (a relação `<<extend>>`). Como existe a restrição `UNIQUE` em `progresso_simulacao`, **não criamos um registro novo** — apenas zeramos o existente:

```javascript
await prisma.progressoSimulacao.upsert({
  update: {
    etapaAtualId: etapaInicial.id,
    concluido: false,
    dataConclusao: null,
  },
  ...
});
```

> **Para a banca:** *"A simulação funciona como uma árvore de decisões guardada no banco. Cada etapa tem alternativas, e cada alternativa tem um feedback e aponta para a próxima etapa. Como cada uma pode levar a uma etapa diferente, decisões diferentes têm consequências diferentes. Nada disso está escrito no código — o React só desenha o que vem da API."*

---

## Aviso sobre o conteúdo de saúde

A REVIVA é uma **ferramenta educativa**. Não substitui treinamento prático presencial nem atendimento profissional.

Os textos de primeiros socorros no `seed.js` foram transcritos dos protótipos do próprio TCC (Figuras 1, 4 e 5). Os trechos marcados com `[A VALIDAR - ENFERMAGEM]` são espaços reservados, sem conteúdo clínico.

**Todo o material precisa do aval da orientação da área de Enfermagem antes da apresentação pública.**

Em emergências reais: **SAMU 192** · **Bombeiros 193**
