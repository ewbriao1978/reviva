// =============================================================================
// src/pages/Modulos.jsx - Lista dos cinco modulos (RF04)
// =============================================================================

import { useEffect, useState } from "react";
import api from "../services/api.js";
import CardModulo from "../components/CardModulo.jsx";

export default function Modulos() {
  const [modulos, setModulos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function buscar() {
      try {
        // Usamos /progresso em vez de /modulos porque esta rota ja devolve os
        // modulos COM o percentual de cada um, evitando duas requisicoes.
        const resposta = await api.get("/progresso");
        setModulos(resposta.data.modulos);
      } catch (erroDaApi) {
        setErro(
          erroDaApi.response?.data?.mensagem || "Erro ao carregar os modulos."
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
      <h1>Modulos</h1>
      <p style={{ color: "var(--texto-suave)", marginBottom: "1.5rem" }}>
        Escolha um tema para estudar os conteudos e realizar a simulacao.
      </p>

      <div className="grade-cards">
        {modulos.map((modulo) => (
          <CardModulo key={modulo.id} modulo={modulo} />
        ))}
      </div>
    </div>
  );
}
