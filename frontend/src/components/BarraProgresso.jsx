// =============================================================================
// src/components/BarraProgresso.jsx - Barra visual de progresso
// =============================================================================
// Mostra graficamente um percentual. Usada no painel, nos cards de modulo e no
// topo da pagina de conteudo.
//
// O percentual vem SEMPRE calculado pelo backend a partir dos registros do
// banco - este componente apenas desenha o valor recebido.
// =============================================================================

export default function BarraProgresso({ percentual, texto }) {
  // Trava de seguranca: garante que o valor fique entre 0 e 100, para a barra
  // nunca estourar a largura da caixa.
  const valor = Math.min(100, Math.max(0, percentual || 0));

  return (
    <div>
      <div className="barra-progresso">
        {/* A largura do preenchimento e definida pelo proprio percentual.
            No React, estilos inline sao escritos como um objeto. */}
        <div
          className={`barra-progresso-preenchimento ${valor === 100 ? "completo" : ""}`}
          style={{ width: `${valor}%` }}
        />
      </div>

      {/* O && mostra o texto somente se ele tiver sido informado. */}
      {texto && <div className="texto-progresso">{texto}</div>}
    </div>
  );
}
