// =============================================================================
// src/pages/Simulacoes.jsx - Lista de todas as simulacoes (RF09)
// =============================================================================
// Item "Simulacoes" do menu lateral dos prototipos do TCC.
// =============================================================================

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api.js";
import Botao from "../components/Botao.jsx";

export default function Simulacoes() {
  const [simulacoes, setSimulacoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const navegar = useNavigate();

  useEffect(() => {
    async function buscar() {
      try {
        const resposta = await api.get("/simulacoes");
        setSimulacoes(resposta.data);
      } catch (erroDaApi) {
        setErro(
          erroDaApi.response?.data?.mensagem || "Erro ao carregar as simulacoes."
        );
      } finally {
        setCarregando(false);
      }
    }

    buscar();
  }, []);

  if (carregando) return <div className="carregando">Carregando...</div>;
  if (erro) return <div className="mensagem-erro">{erro}</div>;

  return (
    <div>
      <h1>Simulacoes</h1>
      <p style={{ color: "var(--texto-suave)", marginBottom: "1.5rem" }}>
        Pratique a tomada de decisao em situacoes simuladas de emergencia.
      </p>

      {simulacoes.length === 0 && (
        <div className="card">
          <p style={{ color: "var(--texto-suave)" }}>
            Nenhuma simulacao disponivel no momento.
          </p>
        </div>
      )}

      {simulacoes.map((simulacao) => (
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
              <div className="rotulo-card">{simulacao.modulo.titulo}</div>
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
      ))}

      <div className="aviso-educativo">
        As simulacoes possuem finalidade educativa e nao substituem treinamento
        pratico nem atendimento profissional.
      </div>
    </div>
  );
}
