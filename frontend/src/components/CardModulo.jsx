// =============================================================================
// src/components/CardModulo.jsx - Cartao de um modulo
// =============================================================================
// Usado no painel e na pagina de modulos. Mostra titulo, descricao e o
// progresso do usuario naquele modulo.
// =============================================================================

import { useNavigate } from "react-router-dom";
import BarraProgresso from "./BarraProgresso.jsx";

export default function CardModulo({ modulo }) {
  // useNavigate devolve uma funcao que troca de pagina sem recarregar o site.
  const navegar = useNavigate();

  // O percentual pode nao vir (por exemplo, na listagem simples de modulos).
  const percentual = modulo.percentual ?? 0;
  const concluido = percentual === 100;

  return (
    <div className="card card-modulo" onClick={() => navegar(`/modulos/${modulo.id}`)}>
      <h3>{modulo.titulo}</h3>
      <p>{modulo.descricao}</p>

      <BarraProgresso
        percentual={percentual}
        texto={
          concluido
            ? "Concluido"
            : `${percentual}% completo${
                modulo.totalItens
                  ? ` - ${modulo.itensConcluidos} de ${modulo.totalItens} atividades`
                  : ""
              }`
        }
      />
    </div>
  );
}
