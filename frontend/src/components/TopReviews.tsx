import { useEffect, useState } from 'react'

type ReviewDestaque = {
  id: number
  user_id: number
  username: string
  restaurant_name: string
  rating: number
  comment: string
  helpful_votes: number
  unhelpful_votes: number
}

type TopReviewsProps = {
  onSelecionarUsuario: (userId: number) => void
}

function TopReviews({ onSelecionarUsuario }: TopReviewsProps) {
  const [reviews, setReviews] = useState<ReviewDestaque[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  useEffect(() => {
    let ativa = true
    fetch('/api/reviews/top')
      .then((resposta) => {
        if (!resposta.ok) throw new Error('Não foi possível carregar o top 5.')
        return resposta.json() as Promise<ReviewDestaque[]>
      })
      .then((resultados) => {
        if (ativa) setReviews(resultados)
      })
      .catch(() => {
        if (ativa) setErro('Não foi possível carregar as reviews em destaque.')
      })
      .finally(() => {
        if (ativa) setCarregando(false)
      })

    return () => {
      ativa = false
    }
  }, [])

  return (
    <section aria-labelledby="top-reviews-titulo">
      <header className="mb-4">
        <h2 id="top-reviews-titulo" className="text-2xl font-bold text-brand-brown">
          Top 5 reviews
        </h2>
        <p className="mt-1 text-sm text-zinc-600">
          Ordenadas por votos úteis menos votos não úteis.
        </p>
      </header>
      {carregando && <p className="text-sm text-zinc-600">Carregando reviews...</p>}
      {erro && <p role="alert" className="text-sm text-brand-tomato">{erro}</p>}
      {!carregando && !erro && reviews.length === 0 && (
        <p className="text-sm text-zinc-600">Ainda não há reviews para exibir.</p>
      )}
      <ol className="space-y-4">
        {reviews.map((review, indice) => (
          <li key={review.id}>
            <article className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-brand-brown">
                    {indice + 1}. {review.restaurant_name}
                  </p>
                  <button
                    type="button"
                    onClick={() => onSelecionarUsuario(review.user_id)}
                    className="mt-1 text-sm text-brand-tomato hover:underline"
                  >
                    {review.username}
                  </button>
                </div>
              </div>
              <div className="mt-2 flex items-center gap-2 text-sm">
                <span className="font-semibold text-amber-600">
                  ★ {review.rating.toFixed(1)}
                </span>
                <span className="text-xs text-zinc-500">
                  ▲ {review.helpful_votes} · ▼ {review.unhelpful_votes}
                </span>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-zinc-700">
                {review.comment}
              </p>
            </article>
          </li>
        ))}
      </ol>
    </section>
  )
}

export default TopReviews
