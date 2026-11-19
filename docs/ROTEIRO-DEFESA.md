# REVIVA — Roteiro de defesa

**Apresentação de 8 a 10 minutos + perguntas prováveis da banca**

---

## Antes de começar — checklist

Faça isto **15 minutos antes** da defesa, não na hora:

- [ ] `docker compose up -d` e aguardar subir (ou os dois terminais, se preferir)
- [ ] Abrir `http://localhost:5173` e **conferir que carrega**
- [ ] Fazer login como aluno e **sair** (deixar na tela de login)
- [ ] Rodar `docker compose exec backend npm run seed` para zerar o progresso
- [ ] Deixar **três abas** abertas no navegador:
  1. `http://localhost:5173` — a plataforma
  2. O editor com o projeto aberto
  3. O Prisma Studio (`npm run studio`) ou o GitHub
- [ ] Aumentar a fonte do editor (Ctrl + `+` umas três vezes)
- [ ] Silenciar notificações do computador

**Se algo der errado na hora:** respire e diga *"vou reiniciar o serviço, leva um instante"*. Rode `docker compose restart`. Bancas entendem problemas técnicos; o que pesa é o nervosismo visível.

---

## O roteiro — 9 minutos

### ⏱️ 0:00–1:00 — O problema e a proposta

> "A REVIVA é uma plataforma web para o ensino de primeiros socorros voltada ao público leigo.
>
> O problema que ela ataca é este: segundo o Ministério da Saúde, em 2024 o Brasil registrou mais de 159 mil óbitos por causas externas, e a American Heart Association aponta que uma reanimação iniciada imediatamente por quem está no local pode duplicar ou triplicar as chances de sobrevivência.
>
> Só que métodos tradicionais de ensino, predominantemente teóricos, dificultam a aplicação prática. A proposta da REVIVA é colocar a **tomada de decisão** no centro: em vez de só ler um conteúdo, o usuário analisa uma situação, escolhe uma conduta e recebe uma explicação sobre a sua escolha."

**Não mostre tela ainda.** Olhe para a banca.

---

### ⏱️ 1:00–2:00 — A arquitetura

**Mostre o diagrama** (slide ou desenhe no quadro):

```
   NAVEGADOR                SERVIDOR                 BANCO
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│    React     │ Axios │   Express    │ Prisma│  PostgreSQL  │
│   porta 5173 │ ─────▶│  porta 3000  │ ─────▶│  porta 5432  │
└──────────────┘       └──────────────┘       └──────────────┘
```

> "O sistema tem três partes. O React desenha as telas no navegador. O Express é o servidor, que recebe os pedidos e aplica as regras. O PostgreSQL guarda os dados.
>
> O React nunca fala direto com o banco — ele faz requisições HTTP para a API, e a API responde em JSON. Isso é proposital: se o navegador pudesse acessar o banco, qualquer usuário poderia alterar dados."

---

### ⏱️ 2:00–3:00 — Cadastro e login

**Na tela.** Cadastre uma conta ao vivo (use um email simples, tipo `banca@teste.com`).

> "Aqui faço o cadastro. A senha não é gravada como texto no banco — ela passa pelo bcrypt, que gera um hash irreversível. Nem eu, com acesso ao banco, consigo descobrir a senha de um usuário."

**Mostre rapidamente o código** (`authController.js`):

```javascript
const senhaHash = await bcrypt.hash(senha, 10);
```

> "E no login, o sistema gera um token JWT — um crachá assinado pelo servidor. O React guarda esse token e o envia em toda requisição seguinte, para o servidor saber quem está pedindo."

---

### ⏱️ 3:00–4:00 — O painel e o progresso

**Volte à plataforma, já logada.**

> "Este é o painel. Repare no progresso: 0%, 0 de 19 atividades.
>
> Esse número não está escrito no código. Ele é calculado na hora, contando os registros no banco. Vou provar."

**Abra um módulo, abra um conteúdo, marque como concluído, volte ao painel.**

> "Marquei um conteúdo. O percentual subiu. O backend contou quantas atividades existem no módulo, quantas eu concluí, e dividiu."

**Se tiver tempo**, mostre o `progressoController.js`:

```javascript
return Math.round((concluidos / total) * 100);
```

---

### ⏱️ 4:00–6:30 — A simulação (o ponto alto)

**Esta é a parte mais importante. Não corra.**

> "Agora a funcionalidade principal: a simulação de tomada de decisão."

**Abra a simulação de Engasgos.**

> "O sistema apresenta uma situação: durante uma refeição, um colega leva as mãos ao pescoço, não consegue falar nem emitir som.
>
> São quatro alternativas. Vou escolher uma **inadequada** de propósito — a letra A, oferecer água."

**Escolha a A e confirme.**

> "Repare em duas coisas. Primeiro: o feedback não diz apenas 'errado' — ele explica o porquê. Segundo, e mais importante: a simulação me levou para uma etapa chamada **'A obstrução continua'**, onde a situação se agrava.
>
> Agora vou refazer e escolher a conduta adequada."

**Clique em refazer, escolha a B, confirme.**

> "Mesma situação, decisão diferente — e agora fui para outra etapa: **'Acionamento do socorro'**.
>
> Esse é o diferencial da REVIVA. A decisão tem consequência. E nada disso está escrito no código."

**Agora mostre o código** (`Simulacao.jsx`) — role o arquivo:

> "Este é o arquivo da tela de simulação. Procurem o texto da situação, ou das alternativas: não está aqui. O React só desenha o que vem da API."

**Mostre o schema** (`schema.prisma`, modelo `Alternativa`):

```prisma
model Alternativa {
  etapaId        Int
  texto          String
  feedback       String
  correta        Boolean
  proximaEtapaId Int?    // ← o encadeamento
}
```

> "O encadeamento está neste campo: `proximaEtapaId`. Cada alternativa guarda o endereço da próxima cena. Como cada uma pode apontar para uma etapa diferente, decisões diferentes levam a caminhos diferentes.
>
> Na prática, isso significa que criar uma simulação nova **não exige programar** — basta cadastrar pela área administrativa."

---

### ⏱️ 6:30–8:00 — A área administrativa e as permissões

> "O sistema tem dois perfis. Vou sair e entrar como administrador."

**Saia e entre com `admin@reviva.local`.**

> "Aparece um item novo no menu: Administração. Aqui o administrador gerencia usuários, módulos, conteúdos e as simulações — inclusive cadastrando etapas, alternativas e seus feedbacks."

**Mostre rapidamente as abas. Abra a aba Simulações e mostre a estrutura de etapas.**

> "Agora, o ponto de segurança. Esconder o menu não protege nada — quem quiser, digita o endereço direto."

**Saia, entre como aluno, e digite `/admin` na URL.**

> "Ele me devolve para o painel. Mas isso é só navegação. A proteção de verdade está no servidor."

**Mostre o `adminMiddleware.js`:**

```javascript
if (req.usuario.tipo !== "ADMIN") {
  return res.status(403).json({ mensagem: "Acesso restrito a administradores." });
}
```

> "Mesmo que alguém force a tela a aparecer, toda chamada à API volta com erro 403. A regra fica no backend porque o usuário controla o navegador, mas não controla o servidor."

---

### ⏱️ 8:00–9:00 — Fechamento

> "Para encerrar: o sistema atende os 17 requisitos funcionais previstos no TCC, com as 8 tabelas do diagrama entidade-relacionamento, autenticação, progresso real e o mecanismo de simulação.
>
> Deixo uma ressalva importante: a REVIVA é uma **ferramenta educativa**. Ela não substitui treinamento prático nem atendimento profissional — isso está escrito em todas as telas de conteúdo e simulação. O conteúdo de primeiros socorros está em validação com a orientação da área de Enfermagem.
>
> Como continuidade, pretendo completar os conteúdos dos outros quatro módulos e realizar a avaliação de usabilidade com usuários reais, conforme previsto nos objetivos específicos."

---

## Perguntas prováveis da banca

### Sobre as escolhas técnicas

**"Por que PostgreSQL, se o TCC diz MySQL?"**

> "Os dois são bancos relacionais e o modelo de dados é exatamente o mesmo — o DER não muda. A decisão foi tomada na fase de implementação, pelo melhor suporte do PostgreSQL aos recursos do Prisma 7, que é o ORM que usei. É um ajuste que preciso refletir na seção 3.3 do documento."

*(Reconhecer a divergência é melhor do que tentar contornar. A banca valoriza honestidade metodológica.)*

**"Por que React, se o TCC menciona HTML, CSS e JavaScript?"**

> "O React é uma biblioteca JavaScript — a base continua sendo HTML, CSS e JavaScript. Ele organiza a interface em componentes reutilizáveis, como o cartão de módulo e a barra de progresso, que aparecem em várias telas. Sem isso, eu repetiria o mesmo código em cada página."

**"Por que usar um ORM em vez de SQL puro?"**

> "Três motivos. O Prisma protege contra SQL Injection, porque trata os valores separadamente do comando. O editor avisa se eu digitar um campo que não existe. E ele controla a estrutura do banco pelas migrations, permitindo recriar o banco idêntico em qualquer computador."

**"O que acontece se o banco cair?"**

> "Todos os controllers têm try/catch. O servidor responde com erro 500 e uma mensagem, em vez de travar. O frontend mostra o aviso ao usuário."

### Sobre segurança

**"A senha fica segura?"**

> "Ela nunca é gravada como texto. O bcrypt gera um hash irreversível — não existe função que devolva a senha original. No login, o bcrypt refaz o cálculo e compara. E as consultas de usuário usam `select` com os campos públicos, então o hash nem sai do banco nas respostas da API."

**"E se alguém alterar o token para virar administrador?"**

> "Não funciona. O token é assinado com uma chave secreta que só o servidor conhece. Se o conteúdo for alterado, a assinatura deixa de bater e o `jwt.verify` rejeita com erro 401."

**"Guardar o token no localStorage é seguro?"**

> "É a opção mais simples, e por isso escolhi para o MVP. A limitação é que um script malicioso injetado na página conseguiria lê-lo — o ataque XSS. A alternativa mais segura seria um cookie httpOnly, que o JavaScript da página não acessa. Para um projeto acadêmico rodando localmente, o risco é aceitável, mas é uma melhoria para uma versão em produção."

*(Esta resposta impressiona: mostra que você conhece a limitação da sua própria escolha.)*

**"Um usuário consegue ver a resposta certa antes de escolher?"**

> "Não. Quando a API envia uma etapa, os campos `correta` e `feedback` são removidos — só vão o id e o texto de cada alternativa. Eles só são revelados depois, na requisição que registra a escolha. Se não fosse assim, bastaria abrir o F12 e ler a resposta da API."

### Sobre o banco de dados

**"Por que `progresso_conteudo` existe? Não dá para guardar isso no usuário?"**

> "Não, porque é uma relação muitos-para-muitos: um usuário conclui vários conteúdos e um conteúdo é concluído por vários usuários. Isso não cabe em uma coluna. A tabela intermediária guarda as duas chaves estrangeiras mais os dados da própria relação — se concluiu e quando."

**"O que é esse `proximaEtapaId`?"**

> "É uma chave estrangeira que aponta para outra etapa da mesma simulação. É um auto-relacionamento: a tabela `alternativas` tem duas ligações para `etapa_simulacao` — uma diz onde a alternativa aparece, outra diz para onde ela leva. É isso que permite o encadeamento com consequências diferentes."

**"Por que `ehInicial` e `ehFinal` em vez de um campo de ordem?"**

> "Porque a simulação não é uma sequência linear, é uma árvore de decisões. 'Ordem' não faria sentido quando os caminhos se ramificam. Esses dois campos estão no DER do próprio TCC."

**"O que acontece se o administrador excluir um módulo que tem conteúdos?"**

> "Os conteúdos são excluídos junto, por causa da regra `onDelete: Cascade` definida no schema. Sem ela, o banco recusaria a operação por erro de chave estrangeira. O painel ainda avisa quantos itens serão removidos antes de confirmar."

### Sobre o progresso

**"Como garanto que o progresso é real e não um número inventado?"**

> "Posso demonstrar: se eu apagar um registro da tabela `progresso_conteudo` pelo Prisma Studio e recarregar o painel, o percentual diminui. O cálculo é feito a cada requisição, contando as linhas do banco."

*(Se houver tempo e a banca topar, **faça** essa demonstração. É muito convincente.)*

**"Se o usuário marcar o mesmo conteúdo duas vezes, o progresso passa de 100%?"**

> "Não. Existe uma restrição `UNIQUE` no banco para o par usuário + conteúdo. O código usa `upsert`, que atualiza o registro existente em vez de criar outro."

### Sobre o conteúdo de saúde

**"Quem validou esse conteúdo de primeiros socorros?"**

> "Os textos vieram dos protótipos que elaborei no TCC, baseados em Global First Aid Reference Centre e Guedes. A validação com a orientação da área de Enfermagem está em andamento — é um dos objetivos específicos do trabalho. Por isso os módulos ainda não validados estão marcados no sistema, e todas as telas trazem o aviso de que a plataforma não substitui treinamento prático nem atendimento profissional."

**"E se um usuário aplicar errado o que aprendeu aqui?"**

> "É exatamente por isso que o aviso aparece em todas as telas de conteúdo e simulação, e os telefones de emergência ficam fixos no menu. A REVIVA é proposta como ferramenta complementar — a própria IFRC, que é referência na área, destaca que recursos digitais não substituem a prática presencial."

### Sobre o desenvolvimento

**"Quanto do código você entende?"**

> "Posso explicar qualquer arquivo. Quer escolher um?"

*(Se fizerem isso, respire e vá devagar. Comece pelo comentário no topo do arquivo — todos têm um explicando a responsabilidade dele.)*

**"O que foi mais difícil?"**

> Resposta sugerida: o encadeamento das simulações. Entender que o caminho precisava estar nos dados, e não no código, mudou a forma como modelei as tabelas. Foi o que permitiu que novas simulações sejam cadastradas sem programar.

**"O que você faria diferente?"**

> Sugestões honestas: trocar o localStorage por cookie httpOnly; adicionar testes automatizados; permitir o upload de imagens pela área administrativa, já que o banco tem o campo mas o cadastro ainda espera uma URL.

**"Por que Docker?"**

> "Para o projeto rodar igual em qualquer computador. Sem ele, cada pessoa instalaria Node e PostgreSQL em versões diferentes, e apareceriam erros que não acontecem na minha máquina. Com `docker compose up`, as versões são sempre as mesmas — e as migrations e os dados iniciais são aplicados automaticamente."

---

## Erros a evitar

| Não faça | Faça |
|---|---|
| Ler slides de costas para a banca | Olhar para eles, usar o slide como apoio |
| Dizer "eu só segui um tutorial" | Explicar **por que** cada escolha foi feita |
| Esconder limitações | Apontá-las antes que perguntem |
| Correr na simulação | É o ponto alto; dê tempo à banca de entender |
| Dizer "não sei" e parar | "Não testei esse caso, mas pelo que implementei, aconteceria X" |
| Mostrar código por 5 minutos | Código só para comprovar o que você acabou de afirmar |

---

## As três frases que você precisa saber de cor

**1. A arquitetura:**
> "React no navegador, Express no servidor, PostgreSQL no banco. Conversam por requisições HTTP com respostas em JSON."

**2. O diferencial:**
> "O encadeamento das simulações está nos dados, não no código. Cada alternativa guarda para qual etapa ela leva — por isso decisões diferentes têm consequências diferentes, e criar uma simulação nova não exige programar."

**3. A ressalva:**
> "É uma ferramenta educativa. Não substitui treinamento prático nem atendimento profissional."

---

## Números para ter na ponta da língua

| | |
|---|---|
| Requisitos funcionais atendidos | 17 (RF01 a RF17) |
| Tabelas no banco | 8 |
| Módulos | 5 |
| Etapas da simulação de Engasgos | 4 |
| Alternativas cadastradas | 8 |
| Telas do frontend | 11 |
| Endpoints da API | 24 |
| Óbitos por causas externas no Brasil em 2024 | 159.534 |
| Internações por causas externas no SUS em 2024 | mais de 1,5 milhão |

---

**Boa defesa. Você construiu algo que funciona de verdade — mostre isso com calma.**
