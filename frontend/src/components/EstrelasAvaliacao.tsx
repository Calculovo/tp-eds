type EstrelasAvaliacaoProps = {
  nota: number
  onSelecionar: (nota: number) => void
}

function EstrelasAvaliacao({ nota, onSelecionar }: EstrelasAvaliacaoProps) {
  return (
    <div>
      <p className="mb-1 text-sm font-semibold text-brand-brown">Nota</p>
      <div
        aria-label={`Nota: ${nota} de 5 estrelas`}
        className="flex items-center gap-1"
      >
        {[1, 2, 3, 4, 5].map((estrela) => (
          <button
            key={estrela}
            type="button"
            onClick={() => onSelecionar(estrela)}
            aria-label={`${estrela} estrela${estrela === 1 ? '' : 's'}`}
            aria-pressed={nota === estrela}
            className={`text-3xl leading-none transition hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-tomato ${
              estrela <= nota ? 'text-amber-500' : 'text-zinc-300'
            }`}
          >
            ★
          </button>
        ))}
        <span className="ml-2 text-sm text-zinc-600">{nota} de 5</span>
      </div>
    </div>
  )
}

export default EstrelasAvaliacao
