// =============================================================================
// src/pages/Conteudo.jsx - Leitura de um conteudo (RF05, RF06)
// =============================================================================
// Reproduz o prototipo da Figura 4 do TCC: sumario do modulo a esquerda, texto
// a direita e um botao para marcar como concluido.
// =============================================================================

import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../services/api.js";
import Botao from "../components/Botao.jsx";
import BarraProgresso from "../components/BarraProgresso.jsx";

export default function Conteudo() {
  const { id } = useParams();
  const navegar = useNavigate();

  const [conteudo, setConteudo] = useState(null);
  const [irmaos, setIrmaos] = useState([]); // os demais conteudos do mesmo modulo
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  // Busca o conteudo e, em seguida, a lista de conteudos do modulo dele.
  useEffect(() => {
    async function buscar() {
      try {
        // Esta chamada tambem registra no banco que o usuario abriu o conteudo
        // agora (campo ultimoAcesso), alimentando o "Continue de onde parou".
        const resposta = await api.get(`/conteudos/${id}`);
        setConteudo(resposta.data);

        const lista = await api.get(`/conteudos/modulo/${resposta.data.modulo.id}`);
        setIrmaos(lista.data);
      } catch (erroDaApi) {
        setErro(
          erroDaApi.response?.data?.mensagem || "Erro ao carregar o conteudo."
        );
      }
    }

    buscar();
  }, [id]);

  // Marca ou desmarca o conteudo como concluido (RF06).
  async function alternarConclusao() {
    setSalvando(true);

    try {
      if (conteudo.concluido) {
        await api.delete(`/progresso/conteudo/${conteudo.id}`);
      } else {
        await api.post(`/progresso/conteudo/${conteudo.id}`);
      }

      // Atualiza a tela sem precisar recarregar tudo.
      // O "..." copia o objeto antigo e trocamos so o campo concluido.
      const novoEstado = !conteudo.concluido;
      setConteudo({ ...conteudo, concluido: novoEstado });

      // Atualiza tambem o sumario lateral.
      setIrmaos(
        irmaos.map((item) =>
          item.id === conteudo.id ? { ...item, concluido: novoEstado } : item
        )
      );
    } catch (erroDaApi) {
      setErro(
        erroDaApi.response?.data?.mensagem || "Erro ao registrar a conclusao."
      );
    } finally {
      setSalvando(false);
    }
  }

  if (erro) return <div className="mensagem-erro">{erro}</div>;
  if (!conteudo) return <div className="carregando">Carregando...</div>;

  // Calcula o progresso do modulo apenas para exibir na barra do topo.
  const concluidos = irmaos.filter((item) => item.concluido).length;
  const percentual =
    irmaos.length > 0 ? Math.round((concluidos / irmaos.length) * 100) : 0;

  return (
    <div>
      <Link
        to={`/modulos/${conteudo.modulo.id}`}
        style={{ fontSize: "0.85rem", color: "var(--texto-suave)" }}
      >
        &larr; Voltar ao modulo
      </Link>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          gap: "1rem",
          flexWrap: "wrap",
          margin: "0.5rem 0 1.5rem",
        }}
      >
        <h1>{conteudo.modulo.titulo}</h1>

        <div style={{ minWidth: "180px" }}>
          <BarraProgresso
            percentual={percentual}
            texto={`${percentual}% concluido`}
          />
        </div>
      </div>

      {/* Layout de duas colunas: sumario + texto (como na Figura 4) */}
      <div className="layout-conteudo">
        {/* --- Sumario --- */}
        <div className="card">
          <div className="rotulo-card">Conteudo do modulo</div>

          {irmaos.map((item, indice) => (
            <div
              key={item.id}
              className={`sumario-item ${item.id === conteudo.id ? "atual" : ""}`}
              onClick={() => navegar(`/conteudos/${item.id}`)}
            >
              {indice + 1}. {item.titulo} {item.concluido && "✓"}
            </div>
          ))}
        </div>

        {/* --- Texto do conteudo --- */}
        <div className="card">
          <h2>{conteudo.titulo}</h2>

          {/* A classe texto-conteudo usa white-space: pre-line, que preserva
              as quebras de linha gravadas no banco de dados. */}
          <div className="texto-conteudo">{conteudo.texto}</div>

          <div style={{ marginTop: "1.5rem", display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
            <Botao
              tipo={conteudo.concluido ? "secundario" : "primario"}
              onClick={alternarConclusao}
              desabilitado={salvando}
            >
              {conteudo.concluido
                ? "Desmarcar conclusao"
                : "Marcar como concluido"}
            </Botao>

            <Botao
              tipo="secundario"
              onClick={() => navegar(`/modulos/${conteudo.modulo.id}`)}
            >
              Voltar ao modulo
            </Botao>
          </div>

          <div className="aviso-educativo">
            Conteudo com finalidade educativa. Nao substitui treinamento pratico
            nem atendimento profissional.
          </div>
        </div>
      </div>
    </div>
  );
}
