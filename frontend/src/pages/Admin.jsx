// =============================================================================
// src/pages/Admin.jsx - Area administrativa (RF14 a RF17)
// =============================================================================
// Painel simples, organizado em abas, para demonstrar o gerenciamento dos
// dados e a separacao de permissoes:
//   - Usuarios:   listar e excluir (RF17)
//   - Modulos:    cadastrar, editar e excluir (RF15)
//   - Conteudos:  cadastrar e excluir (RF15)
//   - Simulacoes: cadastrar simulacoes, etapas e alternativas (RF16)
//
// Esta tela so e alcancavel por quem tem perfil ADMIN - a verificacao ocorre
// no RotaPrivada (navegacao) e, de verdade, no adminMiddleware do backend.
// =============================================================================

import { useEffect, useState } from "react";
import api from "../services/api.js";
import Botao from "../components/Botao.jsx";

export default function Admin() {
  // Controla qual aba esta aberta.
  const [aba, setAba] = useState("usuarios");

  return (
    <div>
      <h1>Administracao</h1>
      <p style={{ color: "var(--texto-suave)", marginBottom: "1.5rem" }}>
        Gerenciamento dos dados da plataforma.
      </p>

      <div className="abas">
        <button
          className={`aba ${aba === "usuarios" ? "ativa" : ""}`}
          onClick={() => setAba("usuarios")}
        >
          Usuarios
        </button>
        <button
          className={`aba ${aba === "modulos" ? "ativa" : ""}`}
          onClick={() => setAba("modulos")}
        >
          Modulos
        </button>
        <button
          className={`aba ${aba === "conteudos" ? "ativa" : ""}`}
          onClick={() => setAba("conteudos")}
        >
          Conteudos
        </button>
        <button
          className={`aba ${aba === "simulacoes" ? "ativa" : ""}`}
          onClick={() => setAba("simulacoes")}
        >
          Simulacoes
        </button>
      </div>

      {/* Mostra apenas a aba escolhida. */}
      {aba === "usuarios" && <AbaUsuarios />}
      {aba === "modulos" && <AbaModulos />}
      {aba === "conteudos" && <AbaConteudos />}
      {aba === "simulacoes" && <AbaSimulacoes />}
    </div>
  );
}

// =============================================================================
// ABA 1 - USUARIOS (RF17)
// =============================================================================
function AbaUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [erro, setErro] = useState("");

  async function carregar() {
    try {
      const resposta = await api.get("/usuarios");
      setUsuarios(resposta.data);
    } catch (erroDaApi) {
      setErro(erroDaApi.response?.data?.mensagem || "Erro ao carregar usuarios.");
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  async function excluir(id, nome) {
    // confirm() abre a caixa de confirmacao do proprio navegador.
    if (!window.confirm(`Excluir o usuario "${nome}"? Esta acao nao pode ser desfeita.`)) {
      return;
    }

    try {
      await api.delete(`/usuarios/${id}`);
      carregar(); // recarrega a lista
    } catch (erroDaApi) {
      setErro(erroDaApi.response?.data?.mensagem || "Erro ao excluir.");
    }
  }

  return (
    <div className="card">
      <h2>Usuarios cadastrados ({usuarios.length})</h2>
      {erro && <div className="mensagem-erro">{erro}</div>}

      <div className="tabela-rolavel">
        <table className="tabela">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Email</th>
              <th>Tipo</th>
              <th>Cadastro</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((usuario) => (
              <tr key={usuario.id}>
                <td>{usuario.nome}</td>
                <td>{usuario.email}</td>
                <td>
                  <span className="etiqueta etiqueta-pendente">{usuario.tipo}</span>
                </td>
                <td>
                  {/* toLocaleDateString formata a data no padrao brasileiro. */}
                  {new Date(usuario.dataCadastro).toLocaleDateString("pt-BR")}
                </td>
                <td>
                  <Botao
                    tipo="secundario"
                    onClick={() => excluir(usuario.id, usuario.nome)}
                  >
                    Excluir
                  </Botao>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// =============================================================================
// ABA 2 - MODULOS (RF15)
// =============================================================================
function AbaModulos() {
  const [modulos, setModulos] = useState([]);
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [ordem, setOrdem] = useState("");
  const [editandoId, setEditandoId] = useState(null);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  async function carregar() {
    try {
      const resposta = await api.get("/modulos/admin/todos");
      setModulos(resposta.data);
    } catch (erroDaApi) {
      setErro(erroDaApi.response?.data?.mensagem || "Erro ao carregar modulos.");
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  function limparFormulario() {
    setTitulo("");
    setDescricao("");
    setOrdem("");
    setEditandoId(null);
  }

  async function salvar(evento) {
    evento.preventDefault();
    setMensagem("");
    setErro("");

    try {
      const dados = { titulo, descricao, ordem: Number(ordem) || 0 };

      if (editandoId) {
        // PUT = atualizar um registro existente
        await api.put(`/modulos/${editandoId}`, dados);
        setMensagem("Modulo atualizado.");
      } else {
        // POST = criar um registro novo
        await api.post("/modulos", dados);
        setMensagem("Modulo criado.");
      }

      limparFormulario();
      carregar();
    } catch (erroDaApi) {
      setErro(erroDaApi.response?.data?.mensagem || "Erro ao salvar.");
    }
  }

  // Preenche o formulario com os dados do modulo escolhido para edicao.
  function editar(modulo) {
    setEditandoId(modulo.id);
    setTitulo(modulo.titulo);
    setDescricao(modulo.descricao);
    setOrdem(String(modulo.ordem));
  }

  async function excluir(modulo) {
    const aviso =
      `Excluir o modulo "${modulo.titulo}"?\n\n` +
      `Serao removidos tambem ${modulo._count.conteudos} conteudo(s) e ` +
      `${modulo._count.simulacoes} simulacao(oes) vinculados.`;

    if (!window.confirm(aviso)) return;

    try {
      await api.delete(`/modulos/${modulo.id}`);
      carregar();
    } catch (erroDaApi) {
      setErro(erroDaApi.response?.data?.mensagem || "Erro ao excluir.");
    }
  }

  return (
    <div>
      {/* --- Formulario --- */}
      <div className="card" style={{ marginBottom: "1rem" }}>
        <h2>{editandoId ? "Editar modulo" : "Novo modulo"}</h2>

        {mensagem && <div className="mensagem-sucesso">{mensagem}</div>}
        {erro && <div className="mensagem-erro">{erro}</div>}

        <form onSubmit={salvar}>
          <div className="campo">
            <label>Titulo</label>
            <input value={titulo} onChange={(e) => setTitulo(e.target.value)} required />
          </div>

          <div className="campo">
            <label>Descricao</label>
            <input
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              required
            />
          </div>

          <div className="campo">
            <label>Ordem</label>
            <input
              type="number"
              value={ordem}
              onChange={(e) => setOrdem(e.target.value)}
            />
          </div>

          <div style={{ display: "flex", gap: "0.6rem" }}>
            <Botao submit>{editandoId ? "Salvar" : "Cadastrar"}</Botao>
            {editandoId && (
              <Botao tipo="secundario" onClick={limparFormulario}>
                Cancelar
              </Botao>
            )}
          </div>
        </form>
      </div>

      {/* --- Lista --- */}
      <div className="card">
        <h2>Modulos ({modulos.length})</h2>

        <div className="tabela-rolavel">
          <table className="tabela">
            <thead>
              <tr>
                <th>Ordem</th>
                <th>Titulo</th>
                <th>Conteudos</th>
                <th>Simulacoes</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {modulos.map((modulo) => (
                <tr key={modulo.id}>
                  <td>{modulo.ordem}</td>
                  <td>{modulo.titulo}</td>
                  <td>{modulo._count.conteudos}</td>
                  <td>{modulo._count.simulacoes}</td>
                  <td style={{ display: "flex", gap: "0.4rem" }}>
                    <Botao tipo="secundario" onClick={() => editar(modulo)}>
                      Editar
                    </Botao>
                    <Botao tipo="secundario" onClick={() => excluir(modulo)}>
                      Excluir
                    </Botao>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// ABA 3 - CONTEUDOS (RF15)
// =============================================================================
function AbaConteudos() {
  const [modulos, setModulos] = useState([]);
  const [moduloId, setModuloId] = useState("");
  const [conteudos, setConteudos] = useState([]);

  const [titulo, setTitulo] = useState("");
  const [texto, setTexto] = useState("");
  const [ordem, setOrdem] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  // Carrega a lista de modulos para o seletor.
  useEffect(() => {
    api
      .get("/modulos/admin/todos")
      .then((resposta) => setModulos(resposta.data))
      .catch(() => setErro("Erro ao carregar modulos."));
  }, []);

  // Sempre que o modulo escolhido mudar, recarrega os conteudos dele.
  useEffect(() => {
    if (!moduloId) {
      setConteudos([]);
      return;
    }

    carregarConteudos();
  }, [moduloId]);

  async function carregarConteudos() {
    try {
      const resposta = await api.get(`/conteudos/modulo/${moduloId}`);
      setConteudos(resposta.data);
    } catch {
      setErro("Erro ao carregar conteudos.");
    }
  }

  async function salvar(evento) {
    evento.preventDefault();
    setMensagem("");
    setErro("");

    try {
      await api.post("/conteudos", {
        moduloId: Number(moduloId),
        titulo,
        texto,
        ordem: Number(ordem) || 0,
      });

      setMensagem("Conteudo cadastrado.");
      setTitulo("");
      setTexto("");
      setOrdem("");
      carregarConteudos();
    } catch (erroDaApi) {
      setErro(erroDaApi.response?.data?.mensagem || "Erro ao salvar.");
    }
  }

  async function excluir(conteudo) {
    if (!window.confirm(`Excluir o conteudo "${conteudo.titulo}"?`)) return;

    try {
      await api.delete(`/conteudos/${conteudo.id}`);
      carregarConteudos();
    } catch (erroDaApi) {
      setErro(erroDaApi.response?.data?.mensagem || "Erro ao excluir.");
    }
  }

  return (
    <div>
      <div className="card" style={{ marginBottom: "1rem" }}>
        <h2>Novo conteudo</h2>

        {mensagem && <div className="mensagem-sucesso">{mensagem}</div>}
        {erro && <div className="mensagem-erro">{erro}</div>}

        <form onSubmit={salvar}>
          <div className="campo">
            <label>Modulo</label>
            <select
              value={moduloId}
              onChange={(e) => setModuloId(e.target.value)}
              required
            >
              <option value="">Selecione...</option>
              {modulos.map((modulo) => (
                <option key={modulo.id} value={modulo.id}>
                  {modulo.titulo}
                </option>
              ))}
            </select>
          </div>

          <div className="campo">
            <label>Titulo</label>
            <input value={titulo} onChange={(e) => setTitulo(e.target.value)} required />
          </div>

          <div className="campo">
            <label>Texto</label>
            <textarea
              rows={6}
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              required
            />
          </div>

          <div className="campo">
            <label>Ordem</label>
            <input
              type="number"
              value={ordem}
              onChange={(e) => setOrdem(e.target.value)}
            />
          </div>

          <Botao submit desabilitado={!moduloId}>
            Cadastrar
          </Botao>
        </form>
      </div>

      {moduloId && (
        <div className="card">
          <h2>Conteudos deste modulo ({conteudos.length})</h2>

          <div className="tabela-rolavel">
            <table className="tabela">
              <thead>
                <tr>
                  <th>Ordem</th>
                  <th>Titulo</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {conteudos.map((conteudo) => (
                  <tr key={conteudo.id}>
                    <td>{conteudo.ordem}</td>
                    <td>{conteudo.titulo}</td>
                    <td>
                      <Botao tipo="secundario" onClick={() => excluir(conteudo)}>
                        Excluir
                      </Botao>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// ABA 4 - SIMULACOES, ETAPAS E ALTERNATIVAS (RF16)
// =============================================================================
function AbaSimulacoes() {
  const [modulos, setModulos] = useState([]);
  const [simulacoes, setSimulacoes] = useState([]);
  const [simulacaoId, setSimulacaoId] = useState("");
  const [detalhe, setDetalhe] = useState(null); // simulacao completa com etapas
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  // Formulario de nova simulacao
  const [novoModuloId, setNovoModuloId] = useState("");
  const [novoTitulo, setNovoTitulo] = useState("");
  const [novaDescricao, setNovaDescricao] = useState("");

  // Formulario de nova etapa
  const [etapaTitulo, setEtapaTitulo] = useState("");
  const [etapaTexto, setEtapaTexto] = useState("");
  const [etapaInicial, setEtapaInicial] = useState(false);
  const [etapaFinal, setEtapaFinal] = useState(false);

  // Formulario de nova alternativa
  const [altEtapaId, setAltEtapaId] = useState("");
  const [altTexto, setAltTexto] = useState("");
  const [altFeedback, setAltFeedback] = useState("");
  const [altCorreta, setAltCorreta] = useState(false);
  const [altProxima, setAltProxima] = useState("");
  const [altOrdem, setAltOrdem] = useState("");

  useEffect(() => {
    api.get("/modulos/admin/todos").then((r) => setModulos(r.data)).catch(() => {});
    carregarSimulacoes();
  }, []);

  async function carregarSimulacoes() {
    try {
      const resposta = await api.get("/simulacoes");
      setSimulacoes(resposta.data);
    } catch {
      setErro("Erro ao carregar simulacoes.");
    }
  }

  // Carrega a simulacao completa (com etapas e alternativas) para edicao.
  async function carregarDetalhe(id) {
    if (!id) {
      setDetalhe(null);
      return;
    }

    try {
      const resposta = await api.get(`/simulacoes/${id}/completa`);
      setDetalhe(resposta.data);
    } catch (erroDaApi) {
      setErro(erroDaApi.response?.data?.mensagem || "Erro ao carregar.");
    }
  }

  async function criarSimulacao(evento) {
    evento.preventDefault();
    setMensagem("");
    setErro("");

    try {
      await api.post("/simulacoes", {
        moduloId: Number(novoModuloId),
        titulo: novoTitulo,
        descricao: novaDescricao,
      });

      setMensagem("Simulacao criada.");
      setNovoTitulo("");
      setNovaDescricao("");
      carregarSimulacoes();
    } catch (erroDaApi) {
      setErro(erroDaApi.response?.data?.mensagem || "Erro ao criar.");
    }
  }

  async function criarEtapa(evento) {
    evento.preventDefault();
    setMensagem("");
    setErro("");

    try {
      await api.post("/simulacoes/etapas", {
        simulacaoId: Number(simulacaoId),
        titulo: etapaTitulo,
        texto: etapaTexto,
        ehInicial: etapaInicial,
        ehFinal: etapaFinal,
      });

      setMensagem("Etapa criada.");
      setEtapaTitulo("");
      setEtapaTexto("");
      setEtapaInicial(false);
      setEtapaFinal(false);
      carregarDetalhe(simulacaoId);
    } catch (erroDaApi) {
      setErro(erroDaApi.response?.data?.mensagem || "Erro ao criar etapa.");
    }
  }

  async function criarAlternativa(evento) {
    evento.preventDefault();
    setMensagem("");
    setErro("");

    try {
      await api.post("/simulacoes/alternativas", {
        etapaId: Number(altEtapaId),
        texto: altTexto,
        feedback: altFeedback,
        correta: altCorreta,
        // Vazio significa "a simulacao termina aqui".
        proximaEtapaId: altProxima ? Number(altProxima) : null,
        ordem: Number(altOrdem) || 0,
      });

      setMensagem("Alternativa criada.");
      setAltTexto("");
      setAltFeedback("");
      setAltCorreta(false);
      setAltProxima("");
      setAltOrdem("");
      carregarDetalhe(simulacaoId);
    } catch (erroDaApi) {
      setErro(erroDaApi.response?.data?.mensagem || "Erro ao criar alternativa.");
    }
  }

  return (
    <div>
      {mensagem && <div className="mensagem-sucesso">{mensagem}</div>}
      {erro && <div className="mensagem-erro">{erro}</div>}

      {/* --- Criar simulacao --- */}
      <div className="card" style={{ marginBottom: "1rem" }}>
        <h2>Nova simulacao</h2>

        <form onSubmit={criarSimulacao}>
          <div className="campo">
            <label>Modulo</label>
            <select
              value={novoModuloId}
              onChange={(e) => setNovoModuloId(e.target.value)}
              required
            >
              <option value="">Selecione...</option>
              {modulos.map((modulo) => (
                <option key={modulo.id} value={modulo.id}>
                  {modulo.titulo}
                </option>
              ))}
            </select>
          </div>

          <div className="campo">
            <label>Titulo</label>
            <input
              value={novoTitulo}
              onChange={(e) => setNovoTitulo(e.target.value)}
              required
            />
          </div>

          <div className="campo">
            <label>Descricao</label>
            <input
              value={novaDescricao}
              onChange={(e) => setNovaDescricao(e.target.value)}
              required
            />
          </div>

          <Botao submit>Cadastrar simulacao</Botao>
        </form>
      </div>

      {/* --- Selecionar simulacao para editar --- */}
      <div className="card" style={{ marginBottom: "1rem" }}>
        <h2>Gerenciar etapas e alternativas</h2>

        <div className="campo">
          <label>Simulacao</label>
          <select
            value={simulacaoId}
            onChange={(e) => {
              setSimulacaoId(e.target.value);
              carregarDetalhe(e.target.value);
            }}
          >
            <option value="">Selecione...</option>
            {simulacoes.map((simulacao) => (
              <option key={simulacao.id} value={simulacao.id}>
                {simulacao.titulo}
              </option>
            ))}
          </select>
        </div>

        {/* Mostra as etapas ja cadastradas, com as suas alternativas. */}
        {detalhe && (
          <div>
            <h3 style={{ fontSize: "1rem", marginTop: "1rem" }}>
              Etapas cadastradas ({detalhe.etapas.length})
            </h3>

            {detalhe.etapas.map((etapa) => (
              <div
                key={etapa.id}
                style={{
                  border: "1px solid var(--borda)",
                  borderRadius: "var(--raio)",
                  padding: "0.8rem",
                  marginTop: "0.6rem",
                }}
              >
                <div style={{ display: "flex", gap: "0.4rem", alignItems: "center", flexWrap: "wrap" }}>
                  <strong>#{etapa.id}</strong>
                  <span>{etapa.titulo || "(sem titulo)"}</span>
                  {etapa.ehInicial && (
                    <span className="etiqueta etiqueta-concluido">inicial</span>
                  )}
                  {etapa.ehFinal && (
                    <span className="etiqueta etiqueta-pendente">final</span>
                  )}
                </div>

                <p style={{ fontSize: "0.85rem", color: "var(--texto-suave)", margin: "0.4rem 0" }}>
                  {etapa.texto}
                </p>

                {etapa.alternativas.map((alternativa) => (
                  <div
                    key={alternativa.id}
                    style={{ fontSize: "0.82rem", paddingLeft: "0.8rem", borderLeft: "2px solid var(--borda)", marginTop: "0.3rem" }}
                  >
                    {alternativa.correta ? "✔ " : "• "}
                    {alternativa.texto}
                    <span style={{ color: "var(--texto-suave)" }}>
                      {alternativa.proximaEtapaId
                        ? ` → etapa #${alternativa.proximaEtapaId}`
                        : " → fim"}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- Nova etapa --- */}
      {simulacaoId && (
        <div className="card" style={{ marginBottom: "1rem" }}>
          <h2>Nova etapa</h2>

          <form onSubmit={criarEtapa}>
            <div className="campo">
              <label>Titulo</label>
              <input value={etapaTitulo} onChange={(e) => setEtapaTitulo(e.target.value)} />
            </div>

            <div className="campo">
              <label>Texto da situacao</label>
              <textarea
                rows={4}
                value={etapaTexto}
                onChange={(e) => setEtapaTexto(e.target.value)}
                required
              />
            </div>

            <div className="campo">
              <label>
                <input
                  type="checkbox"
                  checked={etapaInicial}
                  onChange={(e) => setEtapaInicial(e.target.checked)}
                  style={{ width: "auto", marginRight: "0.4rem" }}
                />
                E a etapa inicial (por onde a simulacao comeca)
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={etapaFinal}
                  onChange={(e) => setEtapaFinal(e.target.checked)}
                  style={{ width: "auto", marginRight: "0.4rem" }}
                />
                E a etapa final (encerra a simulacao)
              </label>
            </div>

            <Botao submit>Cadastrar etapa</Botao>
          </form>
        </div>
      )}

      {/* --- Nova alternativa --- */}
      {detalhe && detalhe.etapas.length > 0 && (
        <div className="card">
          <h2>Nova alternativa</h2>

          <form onSubmit={criarAlternativa}>
            <div className="campo">
              <label>Etapa a que pertence</label>
              <select
                value={altEtapaId}
                onChange={(e) => setAltEtapaId(e.target.value)}
                required
              >
                <option value="">Selecione...</option>
                {detalhe.etapas.map((etapa) => (
                  <option key={etapa.id} value={etapa.id}>
                    #{etapa.id} {etapa.titulo || etapa.texto.slice(0, 40)}
                  </option>
                ))}
              </select>
            </div>

            <div className="campo">
              <label>Texto da alternativa</label>
              <textarea
                rows={2}
                value={altTexto}
                onChange={(e) => setAltTexto(e.target.value)}
                required
              />
            </div>

            <div className="campo">
              <label>Feedback (explicacao apos a escolha)</label>
              <textarea
                rows={3}
                value={altFeedback}
                onChange={(e) => setAltFeedback(e.target.value)}
                required
              />
            </div>

            <div className="campo">
              <label>Leva para a etapa</label>
              <select value={altProxima} onChange={(e) => setAltProxima(e.target.value)}>
                <option value="">(nenhuma - encerra a simulacao)</option>
                {detalhe.etapas.map((etapa) => (
                  <option key={etapa.id} value={etapa.id}>
                    #{etapa.id} {etapa.titulo || etapa.texto.slice(0, 40)}
                  </option>
                ))}
              </select>
            </div>

            <div className="campo">
              <label>Ordem</label>
              <input
                type="number"
                value={altOrdem}
                onChange={(e) => setAltOrdem(e.target.value)}
              />
            </div>

            <div className="campo">
              <label>
                <input
                  type="checkbox"
                  checked={altCorreta}
                  onChange={(e) => setAltCorreta(e.target.checked)}
                  style={{ width: "auto", marginRight: "0.4rem" }}
                />
                Esta e a alternativa correta
              </label>
            </div>

            <Botao submit>Cadastrar alternativa</Botao>
          </form>
        </div>
      )}
    </div>
  );
}
