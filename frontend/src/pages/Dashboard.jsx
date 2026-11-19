// =============================================================================
// src/pages/Dashboard.jsx - Painel inicial (RF07, RF08, RF13)
// =============================================================================
// Reproduz o prototipo da Figura 3 do TCC: saudacao, progresso geral, o card
// "Continue de onde parou" e a grade com os cinco modulos.
//
// TODOS os numeros vem da API (GET /api/progresso), calculados a partir dos
// registros do PostgreSQL. Nenhum valor e fixo no codigo.
// =============================================================================

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api.js";
import { useAuth } from "../contexts/AuthContext.jsx";
import BarraProgresso from "../components/BarraProgresso.jsx";
import CardModulo from "../components/CardModulo.jsx";
import Botao from "../components/Botao.jsx";

export default function Dashboard() {
  const [progresso, setProgresso] = useState(null);
  const [erro, setErro] = useState("");

  const { usuario } = useAuth();
  const navegar = useNavigate();

  // useEffect executa um codigo DEPOIS que a tela aparece.
  // O array vazio [] no final significa "rode apenas uma vez, na abertura".
  // Sem ele, a busca seria refeita a cada redesenho, em um laco infinito.
  useEffect(() => {
    async function buscarProgresso() {
      try {
        const resposta = await api.get("/progresso");
        setProgresso(resposta.data);
      } catch (erroDaApi) {
        setErro(
          erroDaApi.response?.data?.mensagem ||
            "Nao foi possivel carregar o progresso."
        );
      }
    }

    buscarProgresso();
  }, []);

  // Enquanto os dados nao chegam, mostramos um aviso.
  if (erro) {
    return <div className="mensagem-erro">{erro}</div>;
  }

  if (!progresso) {
    return <div className="carregando">Carregando...</div>;
  }

  // Monta o destino do botao "Continuar" conforme o que o backend indicou.
  function continuarEstudos() {
    const destino = progresso.continuarDe;

    if (!destino) {
      navegar("/modulos");
    } else if (destino.tipo === "conteudo") {
      navegar(`/conteudos/${destino.conteudoId}`);
    } else {
      navegar(`/modulos/${destino.modulo.id}`);
    }
  }

  return (
    <div>
      <h1>Ola, {usuario.nome}!</h1>
      <p style={{ color: "var(--texto-suave)" }}>
        Continue aprendendo primeiros socorros.
      </p>

      <div className="linha-cards">
        {/* --- Card do progresso geral --- */}
        <div className="card">
          <div className="rotulo-card">Seu progresso geral</div>

          <div style={{ display: "flex", alignItems: "baseline", gap: "0.6rem" }}>
            <span className="destaque-percentual">
              {progresso.geral.percentual}%
            </span>
            <span style={{ fontSize: "0.85rem", color: "var(--texto-suave)" }}>
              {progresso.geral.itensConcluidos} de {progresso.geral.totalItens}{" "}
              atividades concluidas
            </span>
          </div>

          <div style={{ margin: "0.8rem 0" }}>
            <BarraProgresso percentual={progresso.geral.percentual} />
          </div>

          <Botao tipo="secundario" onClick={() => navegar("/progresso")}>
            Ver meu progresso
          </Botao>
        </div>

        {/* --- Card "Continue de onde parou" (RF08) --- */}
        <div className="card">
          <div className="rotulo-card">Continue de onde parou</div>

          {progresso.continuarDe ? (
            <>
              <h2 style={{ marginBottom: "0.2rem" }}>
                {progresso.continuarDe.tipo === "conteudo"
                  ? progresso.continuarDe.modulo.titulo
                  : progresso.continuarDe.modulo.titulo}
              </h2>

              <p style={{ fontSize: "0.85rem", color: "var(--texto-suave)", marginBottom: "0.8rem" }}>
                {progresso.continuarDe.tipo === "conteudo"
                  ? progresso.continuarDe.titulo
                  : "Comece este modulo"}
              </p>

              <Botao onClick={continuarEstudos}>Continuar</Botao>
            </>
          ) : (
            <>
              <p style={{ fontSize: "0.9rem", marginBottom: "0.8rem" }}>
                Voce concluiu todas as atividades disponiveis. Parabens!
              </p>
              <Botao tipo="secundario" onClick={() => navegar("/modulos")}>
                Revisar modulos
              </Botao>
            </>
          )}
        </div>
      </div>

      {/* --- Grade dos modulos --- */}
      <h2>Modulos disponiveis</h2>

      <div className="grade-cards">
        {/* .map percorre a lista e devolve um card para cada modulo.
            A prop "key" e obrigatoria: ela ajuda o React a saber qual item
            mudou quando a lista e atualizada. */}
        {progresso.modulos.map((modulo) => (
          <CardModulo key={modulo.id} modulo={modulo} />
        ))}
      </div>

      <div className="aviso-educativo">
        A REVIVA e uma ferramenta educativa. Nao substitui treinamento pratico
        presencial nem atendimento profissional. Em emergencias, ligue 192
        (SAMU) ou 193 (Bombeiros).
      </div>
    </div>
  );
}
