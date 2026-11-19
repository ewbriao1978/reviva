// =============================================================================
// src/pages/Cadastro.jsx - Criacao de conta (RF01)
// =============================================================================

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import Botao from "../components/Botao.jsx";

export default function Cadastro() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const { cadastrar } = useAuth();
  const navegar = useNavigate();

  async function aoEnviar(evento) {
    evento.preventDefault();
    setErro("");

    // Validacoes feitas aqui, antes de incomodar o servidor.
    // O backend repete essas checagens - validar nos dois lados e o correto,
    // porque o frontend pode ser burlado.
    if (senha !== confirmarSenha) {
      setErro("As senhas nao conferem.");
      return;
    }

    if (senha.length < 6) {
      setErro("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setCarregando(true);

    try {
      await cadastrar(nome, email, senha);
      navegar("/"); // ja entra logado
    } catch (erroDaApi) {
      setErro(
        erroDaApi.response?.data?.mensagem ||
          "Nao foi possivel conectar ao servidor. Verifique se o backend esta rodando."
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="pagina-acesso">
      <div className="caixa-acesso">
        <h1>REVIVA</h1>
        <p className="subtitulo">Crie a sua conta</p>

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
            <label htmlFor="senha">Senha</label>
            <input
              id="senha"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </div>

          <div className="campo">
            <label htmlFor="confirmar">Confirmar senha</label>
            <input
              id="confirmar"
              type="password"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              required
            />
          </div>

          <Botao submit desabilitado={carregando}>
            {carregando ? "Cadastrando..." : "Cadastrar"}
          </Botao>
        </form>

        <p style={{ marginTop: "1rem", fontSize: "0.9rem", textAlign: "center" }}>
          Ja tem conta?{" "}
          <Link to="/login" style={{ color: "var(--vermelho)", fontWeight: 600 }}>
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
