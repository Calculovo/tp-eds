type CabecalhoAvaliacaoProps = {
  onFechar: () => void
}

function CabecalhoAvaliacao({ onFechar }: CabecalhoAvaliacaoProps) {
  return (
    <header className="flex items-center justify-between border-b border-brand-brown/10 px-5 py-4 sm:px-7">
      <h2 id="avaliar-titulo" className="text-lg font-bold text-brand-brown">
        Escreva sua avaliação
      </h2>
      <button
        type="button"
        onClick={onFechar}
        aria-label="Fechar avaliação"
        className="rounded-full px-3 py-1 text-2xl leading-none text-zinc-500 transition hover:bg-brand-tomato/10 hover:text-brand-tomato"
      >
        ×
      </button>
    </header>
  )
}

export default CabecalhoAvaliacao
