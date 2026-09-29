import { useState, type FormEvent } from 'react'
import type { Restaurante } from './ListaRestaurantes'
import CartaoRestauranteAvaliacao from './CartaoRestauranteAvaliacao'
import CabecalhoAvaliacao from './CabecalhoAvaliacao'
import EstrelasAvaliacao from './EstrelasAvaliacao'
import RodapeAvaliacao from './RodapeAvaliacao'
import { salvarAvaliacao } from './salvarAvaliacao'
import useEscapeKey from './useEscapeKey'

type AvaliarRestauranteProps = {
  restaurante: Restaurante
  email: string
  onFechar: () => void
  onSalvo: () => void
}

function AvaliarRestaurante({
  restaurante,
  email,
  onFechar,
  onSalvo,
}: AvaliarRestauranteProps) {
  const [nota, setNota] = useState(0)
  const [comentario, setComentario] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  useEscapeKey(onFechar, !salvando)

  async function enviarAvaliacao(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (nota === 0) {
      setErro('Selecione uma nota de 1 a 5 estrelas.')
      return
    }

    setSalvando(true)
    setErro('')
    try {
      await salvarAvaliacao(restaurante.id, email, nota, comentario)
      onSalvo()
    } catch {
      setErro('Não foi possível salvar sua avaliação. Tente novamente.')
      setSalvando(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-brand-brown/70 p-3 backdrop-blur-sm sm:p-8">
      <section
        aria-labelledby="avaliar-titulo"
        aria-modal="true"
        className="mx-auto flex min-h-full w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-brand-cream shadow-2xl sm:min-h-0 sm:mt-8"
        role="dialog"
      >
        <CabecalhoAvaliacao onFechar={onFechar} />

        <form onSubmit={enviarAvaliacao} className="flex flex-1 flex-col">
          <div className="grid flex-1 gap-6 p-5 sm:grid-cols-[minmax(9rem,0.35fr)_minmax(0,1fr)] sm:gap-8 sm:p-7">
            <CartaoRestauranteAvaliacao restaurante={restaurante} />

            <div className="flex min-w-0 flex-col">
              <label
                htmlFor="comentario-avaliacao"
                className="mb-2 text-sm font-semibold text-brand-brown"
              >
                Sua avaliação
              </label>
              <textarea
                id="comentario-avaliacao"
                value={comentario}
                onChange={(event) => setComentario(event.target.value)}
                placeholder="Conte como foi sua experiência..."
                rows={8}
                maxLength={5000}
                className="min-h-48 w-full flex-1 resize-y rounded-xl border border-zinc-300 bg-white p-4 text-sm leading-6 text-brand-brown outline-none transition placeholder:text-zinc-400 focus:border-brand-tomato focus:ring-2 focus:ring-brand-tomato/20"
              />
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                <EstrelasAvaliacao nota={nota} onSelecionar={setNota} />
                <p className="text-xs text-zinc-500">
                  {comentario.length}/5000 caracteres
                </p>
              </div>
              {erro && (
                <p role="alert" className="mt-4 text-sm text-brand-tomato">
                  {erro}
                </p>
              )}
            </div>
          </div>

          <RodapeAvaliacao salvando={salvando} onFechar={onFechar} />
        </form>
      </section>
    </div>
  )
}

export default AvaliarRestaurante
