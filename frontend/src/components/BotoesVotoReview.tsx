import { useState } from 'react'

type BotoesVotoReviewProps = {
  reviewId: number
  email: string
  helpfulVotes: number
  unhelpfulVotes: number
  viewerVote: boolean | null
  onVotoRegistrado: (reviewId: number, isHelpful: boolean) => void
  onEditarAvaliacao?: () => void
}

function BotoesVotoReview({
  reviewId,
  email,
  helpfulVotes,
  unhelpfulVotes,
  viewerVote,
  onVotoRegistrado,
  onEditarAvaliacao,
}: BotoesVotoReviewProps) {
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')

  async function votar(isHelpful: boolean) {
    setEnviando(true)
    setErro('')
    try {
      const resposta = await fetch(`/api/reviews/${reviewId}/votes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, is_helpful: isHelpful }),
      })
      if (!resposta.ok) throw new Error('vote')
      onVotoRegistrado(reviewId, isHelpful)
    } catch {
      setErro('Não foi possível registrar seu voto. Tente novamente.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => votar(true)}
          disabled={enviando}
          aria-label="Marcar avaliação como útil"
          aria-pressed={viewerVote === true}
          className={`rounded border px-3 py-1 text-sm transition disabled:opacity-60 ${
            viewerVote === true
              ? 'border-brand-tomato bg-brand-tomato text-white'
              : 'border-zinc-300 text-zinc-700 hover:border-brand-tomato hover:text-brand-tomato'
          }`}
        >
          ▲ Útil ({helpfulVotes})
        </button>
        <button
          type="button"
          onClick={() => votar(false)}
          disabled={enviando}
          aria-label="Marcar avaliação como não útil"
          aria-pressed={viewerVote === false}
          className={`rounded border px-3 py-1 text-sm transition disabled:opacity-60 ${
            viewerVote === false
              ? 'border-brand-brown bg-brand-brown text-white'
              : 'border-zinc-300 text-zinc-700 hover:border-brand-brown hover:text-brand-brown'
          }`}
        >
          ▼ Não útil ({unhelpfulVotes})
        </button>
        {onEditarAvaliacao && (
          <button
            type="button"
            onClick={onEditarAvaliacao}
            className="rounded border border-brand-tomato px-3 py-1 text-sm font-medium text-brand-tomato transition hover:bg-brand-tomato hover:text-white"
          >
            Editar avaliação
          </button>
        )}
      </div>
      {erro && <p role="alert" className="mt-2 text-sm text-brand-tomato">{erro}</p>}
    </>
  )
}

export default BotoesVotoReview
