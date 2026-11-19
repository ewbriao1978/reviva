// =============================================================================
// src/components/Botao.jsx - Botao reutilizavel
// =============================================================================
// Um COMPONENTE e uma peca de tela que pode ser usada em varios lugares.
// Criamos este para nao repetir as mesmas classes de CSS em cada botao.
//
// As PROPS sao os valores recebidos de quem usa o componente:
//     <Botao tipo="secundario" onClick={salvar}>Salvar</Botao>
// =============================================================================

export default function Botao({
  children, // o texto (ou conteudo) que aparece dentro do botao
  tipo = "primario", // "primario" (vermelho) ou "secundario" (contornado)
  onClick, // funcao chamada no clique
  desabilitado = false,
  submit = false, // true quando o botao envia um formulario
}) {
  return (
    <button
      // Junta as duas classes de CSS: a base e a da variacao escolhida.
      className={`botao botao-${tipo}`}
      onClick={onClick}
      disabled={desabilitado}
      type={submit ? "submit" : "button"}
    >
      {children}
    </button>
  );
}
