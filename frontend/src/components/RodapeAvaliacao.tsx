type RodapeAvaliacaoProps = {
  salvando: boolean
  onFechar: () => void
}

function RodapeAvaliacao({ salvando, onFechar }: RodapeAvaliacaoProps) {
  return (
    <footer className="flex flex-wrap justify-end gap-3 border-t border-brand-brown/10 bg-white/60 px-5 py-4 sm:px-7">
      <button
        type="button"
        onClick={onFechar}
        disabled={salvando}
        className="rounded-lg px-4 py-2 text-sm font-semibold text-brand-brown transition hover:bg-brand-brown/5 disabled:opacity-50"
      >
        Cancelar
      </button>
      <button
        type="submit"
        disabled={salvando}
        className="rounded-lg bg-brand-tomato px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-brown disabled:cursor-wait disabled:opacity-60"
      >
        {salvando ? 'Salvando...' : 'Salvar avaliação'}
      </button>
    </footer>
  )
}

export default RodapeAvaliacao
