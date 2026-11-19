// =============================================================================
// src/pages/Perfil.jsx - Visualizar e alterar os proprios dados (RF03)
// =============================================================================

import { useEffect, useState } from "react";
import api from "../services/api.js";
import { useAuth } from "../contexts/AuthContext.jsx";
import Botao from "../components/Botao.jsx";

export default function Perfil() {
  const { usuario, atualizarUsuario } = useAuth();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  // Busca os dados atualizados do servidor ao abrir a tela.
  useEffect(() => {
    async function buscar() {
      try {
        const resposta = await api.get("/usuarios/perfil");
        setNome(resposta.data.nome);
        setEmail(resposta.data.email);
      } catch (erroDaApi) {
        setErro(
          erroDaApi.response?.data?.mensagem || "Erro ao carregar o perfil."
        );
      }
    }

    buscar();
  }, []);

  async function aoEnviar(evento) {
    evento.preventDefault();
    setMensagem("");
    setErro("");
    setSalvando(true);

    try {
      // Monta apenas os campos preenchidos. A senha so e enviada se o usuario
      // realmente digitou uma nova.
      const dados = { nome, email };
      if (senha) dados.senha = senha;

      const resposta = await api.put("/usuarios/perfil", dados);

      // Atualiza o nome exibido no restante da aplicacao.
      atualizarUsuario(resposta.data.usuario);

      setMensagem("Perfil atualizado com sucesso.");
      setSenha(""); // limpa o campo de senha
    } catch (erroDaApi) {
      setErro(
        erroDaApi.response?.data?.mensagem || "Erro ao atualizar o perfil."
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div>
      <h1>Meu Perfil</h1>
      <p style={{ color: "var(--texto-suave)", marginBottom: "1.5rem" }}>
        Visualize e altere as informacoes da sua conta.
      </p>

      <div className="card" style={{ maxWidth: "480px" }}>
        {mensagem && <div className="mensagem-sucesso">{mensagem}</div>}
        {erro && <div className="mensagem-erro">{erro}</div>}

        <form onSubmit={aoEnviar}>
          <div className="campo">
            <label htmlFor="nome">Nome</label>
            <input
              id="nome"
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
          </div>

          <div className="campo">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="campo">
            <label htmlFor="senha">Nova senha</label>
            <input
              id="senha"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Deixe em branco para manter a atual"
            />
          </div>

          <div className="campo">
            <label>Tipo de conta</label>
            <span className="etiqueta etiqueta-pendente">
              {usuario.tipo === "ADMIN" ? "Administrador" : "Usuario"}
            </span>
          </div>

          <Botao submit desabilitado={salvando}>
            {salvando ? "Salvando..." : "Salvar alteracoes"}
          </Botao>
        </form>
      </div>
    </div>
  );
}
