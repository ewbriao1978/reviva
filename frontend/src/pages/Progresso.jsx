// =============================================================================
// src/pages/Progresso.jsx - Acompanhamento detalhado (RF07, RF13)
// =============================================================================
// Item "Meu Progresso" do menu dos prototipos. Mostra o percentual geral e o
// detalhamento modulo a modulo, sempre com dados vindos do banco.
// =============================================================================

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api.js";
import BarraProgresso from "../components/BarraProgresso.jsx";
import Botao from "../components/Botao.jsx";

export default function Progresso() {
  const [progresso, setProgresso] = useState(null);
  const [erro, setErro] = useState("");

  const navegar = useNavigate();

  useEffect(() => {
    async function buscar() {
      try {
        const resposta = await api.get("/progresso");
        setProgresso(resposta.data);
      } catch (erroDaApi) {
        setErro(
          erroDaApi.response?.data?.mensagem || "Erro ao carregar o progresso."
        );
      }
    }

    buscar();
  }, []);

  if (erro) return <div className="mensagem-erro">{erro}</div>;
  if (!progresso) return <div className="carregando">Carregando...</div>;

  return (
    <div>
      <h1>Meu Progresso</h1>
      <p style={{ color: "var(--texto-suave)", marginBottom: "1.5rem" }}>
        Acompanhe o seu avanco em cada modulo da plataforma.
      </p>

      {/* --- Resumo geral --- */}
      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <div className="rotulo-card">Progresso geral</div>

        <div style={{ display: "flex", alignItems: "baseline", gap: "0.6rem" }}>
          <span className="destaque-percentual">
            {progresso.geral.percentual}%
          </span>
          <span style={{ fontSize: "0.9rem", color: "var(--texto-suave)" }}>
            {progresso.geral.itensConcluidos} de {progresso.geral.totalItens}{" "}
            atividades concluidas
          </span>
        </div>

        <div style={{ marginTop: "0.8rem" }}>
          <BarraProgresso percentual={progresso.geral.percentual} />
        </div>
      </div>

      {/* --- Detalhe por modulo --- */}
      <h2>Por modulo</h2>

      {progresso.modulos.map((modulo) => (
        <div key={modulo.id} className="card" style={{ marginBottom: "0.8rem" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "0.6rem",
              gap: "1rem",
              flexWrap: "wrap",
            }}
          >
            <h3 style={{ fontSize: "1rem" }}>{modulo.titulo}</h3>

            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <span style={{ fontSize: "0.85rem", color: "var(--texto-suave)" }}>
                {modulo.itensConcluidos} de {modulo.totalItens}
              </span>
              <Botao
                tipo="secundario"
                onClick={() => navegar(`/modulos/${modulo.id}`)}
              >
                Acessar
              </Botao>
            </div>
          </div>

          <BarraProgresso
            percentual={modulo.percentual}
            texto={`${modulo.percentual}% concluido`}
          />
        </div>
      ))}
    </div>
  );
}
