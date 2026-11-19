// =============================================================================
// src/pages/Modulo.jsx - Detalhe de um modulo (RF05)
// =============================================================================
// Mostra a lista de conteudos do modulo com a situacao de cada um (concluido
// ou pendente) e as simulacoes disponiveis.
// =============================================================================

import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../services/api.js";
import Botao from "../components/Botao.jsx";

export default function Modulo() {
  // useParams le a parte variavel da URL. Em /modulos/3, id vale "3".
  const { id } = useParams();
  const navegar = useNavigate();

  const [modulo, setModulo] = useState(null);
  const [conteudos, setConteudos] = useState([]);
  const [simulacoes, setSimulacoes] = useState([]);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function buscar() {
      try {
        // Promise.all dispara as tres requisicoes AO MESMO TEMPO e espera
        // todas terminarem. E mais rapido do que uma depois da outra.
        const [respModulo, respConteudos, respSimulacoes] = await Promise.all([
          api.get(`/modulos/${id}`),
          api.get(`/conteudos/modulo/${id}`),
          api.get(`/simulacoes/modulo/${id}`),
        ]);

        setModulo(respModulo.data);
        setConteudos(respConteudos.data);
        setSimulacoes(respSimulacoes.data);
      } catch (erroDaApi) {
        setErro(
          erroDaApi.response?.data?.mensagem || "Erro ao carregar o modulo."
        );
      }
    }

    buscar();
    // O id entra na lista de dependencias: se o usuario navegar para outro
    // modulo, o useEffect roda de novo e busca os dados corretos.
  }, [id]);

  if (erro) return <div className="mensagem-erro">{erro}</div>;
  if (!modulo) return <div className="carregando">Carregando...</div>;

  return (
    <div>
      <Link to="/modulos" style={{ fontSize: "0.85rem", color: "var(--texto-suave)" }}>
        &larr; Voltar aos modulos
      </Link>

      <h1 style={{ marginTop: "0.5rem" }}>{modulo.titulo}</h1>
      <p style={{ color: "var(--texto-suave)", marginBottom: "1.5rem" }}>
        {modulo.descricao}
      </p>

      {/* --- Lista de conteudos --- */}
      <h2>Conteudo do modulo</h2>

      <div className="card" style={{ marginBottom: "1.5rem" }}>
        {conteudos.length === 0 && (
          <p style={{ color: "var(--texto-suave)" }}>
            Este modulo ainda nao possui conteudos cadastrados.
          </p>
        )}

        {conteudos.map((conteudo, indice) => (
          <div
            key={conteudo.id}
            onClick={() => navegar(`/conteudos/${conteudo.id}`)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0.7rem 0",
              borderBottom:
                indice < conteudos.length - 1 ? "1px solid var(--borda)" : "none",
              cursor: "pointer",
            }}
          >
            <span>
              <strong style={{ color: "var(--texto-suave)", marginRight: "0.6rem" }}>
                {indice + 1}
              </strong>
              {conteudo.titulo}
            </span>

            <span
              className={`etiqueta ${
                conteudo.concluido ? "etiqueta-concluido" : "etiqueta-pendente"
              }`}
            >
              {conteudo.concluido ? "Concluido" : "Pendente"}
            </span>
          </div>
        ))}
      </div>

      {/* --- Simulacoes --- */}
      <h2>Simulacao</h2>

      {simulacoes.length === 0 ? (
        <div className="card">
          <p style={{ color: "var(--texto-suave)" }}>
            A simulacao deste modulo ainda sera disponibilizada.
          </p>
        </div>
      ) : (
        simulacoes.map((simulacao) => (
          <div key={simulacao.id} className="card" style={{ marginBottom: "0.8rem" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "1rem",
                flexWrap: "wrap",
              }}
            >
              <div>
                <h3 style={{ fontSize: "1rem" }}>{simulacao.titulo}</h3>
                <p style={{ fontSize: "0.85rem", color: "var(--texto-suave)" }}>
                  {simulacao.descricao}
                </p>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                {simulacao.concluida && (
                  <span className="etiqueta etiqueta-concluido">Concluida</span>
                )}
                <Botao onClick={() => navegar(`/simulacoes/${simulacao.id}`)}>
                  {simulacao.concluida ? "Refazer" : "Iniciar"}
                </Botao>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
