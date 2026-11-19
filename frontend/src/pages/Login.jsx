// =============================================================================
// src/pages/Login.jsx - Tela de entrada (RF02)
// =============================================================================

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import Botao from "../components/Botao.jsx";

export default function Login() {
  // useState cria uma "memoria" do componente. Cada variavel vem com a sua
  // funcao de alterar: [valor, funcaoQueAltera].
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const { entrar } = useAuth();
  const navegar = useNavigate();

  // async porque a chamada a API demora e precisamos esperar a resposta.
  async function aoEnviar(evento) {
    // Impede o comportamento padrao do formulario, que recarregaria a pagina.
    evento.preventDefault();

    setErro("");
    setCarregando(true);

    try {
      await entrar(email, senha);
      navegar("/"); // sucesso: vai para o painel
    } catch (erroDaApi) {
      // O "?." evita erro caso a resposta nao exista (servidor fora do ar).
      setErro(
        erroDaApi.response?.data?.mensagem ||
          "Nao foi possivel conectar ao servidor. Verifique se o backend esta rodando."
      );
    } finally {
      // finally roda sempre, dando certo ou errado.
      setCarregando(false);
    }
  }

  return (
    <div className="pagina-acesso">
      <div className="caixa-acesso">
        <h1>REVIVA</h1>
        <p className="subtitulo">Aprenda primeiros socorros</p>

        {/* Mostra a mensagem de erro apenas quando ela existe. */}
        {erro && <div className="mensagem-erro">{erro}</div>}

        <form onSubmit={aoEnviar}>
          <div className="campo">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              // A cada tecla digitada, guardamos o novo valor no estado.
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

          <Botao submit desabilitado={carregando}>
            {carregando ? "Entrando..." : "Entrar"}
          </Botao>
        </form>

        <p style={{ marginTop: "1rem", fontSize: "0.9rem", textAlign: "center" }}>
          Nao tem conta? <Link to="/cadastro" style={{ color: "var(--vermelho)", fontWeight: 600 }}>Cadastre-se</Link>
        </p>
      </div>
    </div>
  );
}
