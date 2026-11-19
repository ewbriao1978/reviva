// =============================================================================
// src/pages/Simulacao.jsx - A simulacao de tomada de decisao
// =============================================================================
// Reproduz o prototipo da Figura 5 do TCC e atende aos RF09 a RF12.
//
// COMO A TELA FUNCIONA
// --------------------
// 1. Ao abrir, chama GET /api/simulacoes/:id, que devolve a primeira etapa
//    (ou a etapa em que o usuario parou).
// 2. O usuario seleciona uma alternativa e confirma.
// 3. A tela chama POST /api/simulacoes/responder enviando o id da alternativa.
// 4. O backend devolve o feedback, se a escolha estava correta e a proxima
//    etapa.
// 5. O usuario avanca, e o ciclo recomeca ate a etapa final.
//
// IMPORTANTE: nada do texto das situacoes ou das alternativas esta escrito
// neste arquivo. Tudo vem do banco de dados, como exige o TCC.
// =============================================================================

import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../services/api.js";
import Botao from "../components/Botao.jsx";

// Converte 0, 1, 2... em A, B, C... para exibir junto das alternativas.
// charCodeAt(0) devolve o codigo da letra "A" (65); somamos o indice e
// convertemos de volta em letra.
function letraDaAlternativa(indice) {
  return String.fromCharCode("A".charCodeAt(0) + indice);
}

export default function Simulacao() {
  const { id } = useParams();
  const navegar = useNavigate();

  const [simulacao, setSimulacao] = useState(null);
  const [etapa, setEtapa] = useState(null);
  const [selecionada, setSelecionada] = useState(null); // id da alternativa marcada
  const [resultado, setResultado] = useState(null); // feedback recebido
  const [concluida, setConcluida] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");

  // Carrega a simulacao ao abrir a pagina.
  useEffect(() => {
    async function buscar() {
      try {
        const resposta = await api.get(`/simulacoes/${id}`);
        setSimulacao(resposta.data);
        setEtapa(resposta.data.etapa);
      } catch (erroDaApi) {
        setErro(
          erroDaApi.response?.data?.mensagem || "Erro ao abrir a simulacao."
        );
      }
    }

    buscar();
  }, [id]);

  // --- Confirmar a decisao ---
  async function confirmarDecisao() {
    if (!selecionada) return;

    setEnviando(true);

    try {
      const resposta = await api.post("/simulacoes/responder", {
        alternativaId: selecionada,
      });

      // Guarda o feedback para exibir na tela.
      setResultado(resposta.data);
      setConcluida(resposta.data.concluida);
    } catch (erroDaApi) {
      setErro(
        erroDaApi.response?.data?.mensagem || "Erro ao registrar a resposta."
      );
    } finally {
      setEnviando(false);
    }
  }

  // --- Avancar para a proxima etapa ---
  function avancar() {
    if (resultado.proximaEtapa) {
      setEtapa(resultado.proximaEtapa);
    }

    // Limpa a selecao e o feedback para a proxima rodada.
    setSelecionada(null);
    setResultado(null);
  }

  // --- Refazer a simulacao (caso de uso "Repetir simulacao") ---
  async function refazer() {
    try {
      await api.post(`/simulacoes/${id}/reiniciar`);

      // Busca de novo, agora a partir da etapa inicial.
      const resposta = await api.get(`/simulacoes/${id}`);
      setSimulacao(resposta.data);
      setEtapa(resposta.data.etapa);
      setSelecionada(null);
      setResultado(null);
      setConcluida(false);
    } catch (erroDaApi) {
      setErro(
        erroDaApi.response?.data?.mensagem || "Erro ao reiniciar a simulacao."
      );
    }
  }

  if (erro) return <div className="mensagem-erro">{erro}</div>;
  if (!simulacao || !etapa) return <div className="carregando">Carregando...</div>;

  // A simulacao terminou quando a etapa atual e final e ja vimos o feedback.
  const chegouAoFim = concluida && (!resultado || !resultado.proximaEtapa);
  const etapaFinal = etapa.ehFinal;

  return (
    <div>
      <Link
        to={`/modulos/${simulacao.modulo.id}`}
        style={{ fontSize: "0.85rem", color: "var(--texto-suave)" }}
      >
        &larr; Voltar para o modulo
      </Link>

      <h1 style={{ marginTop: "0.5rem" }}>{simulacao.titulo}</h1>
      <p style={{ color: "var(--texto-suave)", marginBottom: "1.5rem" }}>
        Analise a situacao apresentada e escolha a alternativa que considerar
        mais adequada.
      </p>

      {/* --- A situacao (vem do banco) --- */}
      <div className="situacao">
        <div className="rotulo-card">Situacao</div>
        {etapa.titulo && <h2>{etapa.titulo}</h2>}
        <p>{etapa.texto}</p>
      </div>

      {/* --- As alternativas --- */}
      {/* So aparecem se a etapa tiver alternativas e o feedback ainda nao
          tiver sido mostrado. */}
      {!resultado && etapa.alternativas.length > 0 && (
        <>
          <h2>O que voce faria nesta situacao?</h2>

          {etapa.alternativas.map((alternativa, indice) => (
            <button
              key={alternativa.id}
              className={`alternativa ${
                selecionada === alternativa.id ? "selecionada" : ""
              }`}
              onClick={() => setSelecionada(alternativa.id)}
            >
              <span className="alternativa-letra">
                {letraDaAlternativa(indice)}.
              </span>
              {alternativa.texto}
            </button>
          ))}

          <div style={{ marginTop: "1rem" }}>
            <Botao
              onClick={confirmarDecisao}
              desabilitado={!selecionada || enviando}
            >
              {enviando ? "Enviando..." : "Confirmar decisao"}
            </Botao>
          </div>
        </>
      )}

      {/* --- O feedback da escolha (RF11) --- */}
      {resultado && (
        <div
          className={`feedback ${resultado.correta ? "correta" : "incorreta"}`}
        >
          <h3>
            {resultado.correta
              ? "Decisao adequada"
              : "Havia uma opcao mais adequada"}
          </h3>
          <p>{resultado.feedback}</p>

          <div style={{ marginTop: "1rem" }}>
            {resultado.proximaEtapa ? (
              <Botao onClick={avancar}>Continuar</Botao>
            ) : (
              <Botao onClick={() => navegar(`/modulos/${simulacao.modulo.id}`)}>
                Voltar ao modulo
              </Botao>
            )}
          </div>
        </div>
      )}

      {/* --- Encerramento: etapa final, sem alternativas --- */}
      {etapaFinal && !resultado && (
        <div className="card">
          <h2>Simulacao concluida</h2>
          <p style={{ marginBottom: "1rem" }}>
            O seu resultado foi registrado no seu progresso.
          </p>

          <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
            <Botao onClick={refazer}>Refazer simulacao</Botao>
            <Botao
              tipo="secundario"
              onClick={() => navegar(`/modulos/${simulacao.modulo.id}`)}
            >
              Voltar ao modulo
            </Botao>
          </div>
        </div>
      )}

      <div className="aviso-educativo">
        As simulacoes possuem finalidade educativa e nao substituem treinamento
        pratico nem atendimento profissional. Em emergencias, ligue 192 (SAMU)
        ou 193 (Bombeiros).
      </div>
    </div>
  );
}
