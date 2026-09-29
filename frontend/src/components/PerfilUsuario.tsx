import { useEffect, useState } from 'react'
import ListaRelacoes from './ListaRelacoes'
import BrandLogo from './BrandLogo'
import BotoesVotoReview from './BotoesVotoReview'

type Review = {
  id: number
  restaurant_name: string
  restaurant_image_url: string | null
  rating: number
  comment: string | null
  helpful_votes: number
  unhelpful_votes: number
  viewer_vote: boolean | null
}

type Perfil = {
  id: number
  username: string
  followers_count: number
  following_count: number
  is_following: boolean
  reviews: Review[]
}

type PerfilUsuarioProps = {
  userId: number
  viewerId: number | null
  email: string
  onVoltar: () => void
  onSelecionarUsuario: (userId: number) => void
}

function PerfilUsuario({
  userId,
  viewerId,
  email,
  onVoltar,
  onSelecionarUsuario,
}: PerfilUsuarioProps) {
  const [perfil, setPerfil] = useState<Perfil | null>(null)
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [listaSelecionada, setListaSelecionada] =
    useState<'followers' | 'following' | null>(null)
  const podeSeguir = viewerId !== null && viewerId !== userId

  useEffect(() => {
    let ativa = true
    const viewer = viewerId === null ? '' : `&viewer_id=${viewerId}`
    setCarregando(true)
    setErro('')
    fetch(`/api/users/${userId}?${viewer}`)
      .then((resposta) => {
        if (!resposta.ok) throw new Error('perfil')
        return resposta.json() as Promise<Perfil>
      })
      .then((dados) => { if (ativa) setPerfil(dados) })
      .catch(() => { if (ativa) setErro('Não foi possível carregar o perfil.') })
      .finally(() => { if (ativa) setCarregando(false) })
    return () => { ativa = false }
  }, [userId, viewerId])

  async function alternarSeguir() {
    if (perfil === null || viewerId === null) return
    const metodo = perfil.is_following ? 'DELETE' : 'POST'
    const resposta = await fetch(
      `/api/users/${userId}/follow?follower_id=${viewerId}`,
      { method: metodo },
    )
    if (!resposta.ok) return
    const delta = perfil.is_following ? -1 : 1
    setPerfil({ ...perfil, is_following: !perfil.is_following, followers_count: perfil.followers_count + delta })
  }

  function atualizarVoto(reviewId: number, isHelpful: boolean) {
    setPerfil((atual) => {
      if (atual === null) return atual
      return {
        ...atual,
        reviews: atual.reviews.map((review) => {
          if (review.id !== reviewId) return review
          const votoAnterior = review.viewer_vote
          return {
            ...review,
            helpful_votes:
              review.helpful_votes +
              Number(isHelpful) -
              Number(votoAnterior === true),
            unhelpful_votes:
              review.unhelpful_votes +
              Number(!isHelpful) -
              Number(votoAnterior === false),
            viewer_vote: isHelpful,
          }
        }),
      }
    })
  }

  return (
    <main className="min-h-screen bg-brand-cream p-8">
      <header className="mb-8 flex items-start justify-between gap-4">
        <BrandLogo />
        <button type="button" onClick={onVoltar} className="rounded px-3 py-2 text-sm font-medium text-brand-tomato hover:bg-brand-tomato/10">Voltar</button>
      </header>
      {carregando && <p className="text-sm text-zinc-600">Carregando perfil...</p>}
      {erro && <p role="alert" className="text-sm text-brand-tomato">{erro}</p>}
      {perfil && (
        <>
          <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div className="flex items-center gap-6">
              {/* Espaço para a foto de perfil (avatar genérico por enquanto) */}
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-brand-tomato text-4xl font-bold text-white">
                {perfil.username.charAt(0).toUpperCase()}
              </div>
              
              <div>
                <h1 className="text-3xl font-bold text-brand-brown">{perfil.username}</h1>
                <div className="mt-2 flex gap-4 text-sm">
                  <button
                    type="button"
                    onClick={() => setListaSelecionada('followers')}
                    aria-expanded={listaSelecionada === 'followers'}
                    className="text-zinc-600 hover:text-brand-tomato hover:underline"
                  >
                    {perfil.followers_count} seguidores
                  </button>
                  <button
                    type="button"
                    onClick={() => setListaSelecionada('following')}
                    aria-expanded={listaSelecionada === 'following'}
                    className="text-zinc-600 hover:text-brand-tomato hover:underline"
                  >
                    {perfil.following_count} seguindo
                  </button>
                </div>
                
                {/* Botões de Edição: Só aparecem se for o dono do perfil */}
                {viewerId === userId && (
                  <div className="mt-4 flex gap-2">
                    <button type="button" className="rounded border border-brand-tomato px-3 py-1 text-xs font-medium text-brand-tomato hover:bg-brand-tomato/10">
                      Editar Foto
                    </button>
                    <button type="button" className="rounded border border-brand-tomato px-3 py-1 text-xs font-medium text-brand-tomato hover:bg-brand-tomato/10">
                      Editar Nome
                    </button>
                  </div>
                )}
              </div>
            </div>

            {podeSeguir && (
              <button
                type="button"
                onClick={alternarSeguir}
                className={`rounded px-4 py-2 text-sm font-medium text-white ${
                  perfil.is_following
                    ? 'bg-brand-brown hover:bg-brand-tomato'
                    : 'bg-brand-tomato hover:bg-brand-brown'
                }`}
              >
                {perfil.is_following ? 'Deixar de seguir' : 'Seguir'}
              </button>
            )}
          </header>
          {listaSelecionada && (
            <ListaRelacoes
              userId={userId}
              tipo={listaSelecionada}
              aoFechar={() => setListaSelecionada(null)}
              aoSelecionarUsuario={onSelecionarUsuario}
            />
          )}
          <h2 className="mb-4 text-xl font-semibold text-brand-brown">Histórico de reviews</h2>
          {perfil.reviews.length === 0 && <p className="text-sm text-zinc-600">Este usuário ainda não fez reviews.</p>}
          <ul className="space-y-4">
            {perfil.reviews.map((review) => (
              <li key={review.id} className="flex gap-4 rounded-lg border border-zinc-200 bg-white p-4">
                {review.restaurant_image_url && <img src={review.restaurant_image_url} alt="" className="h-20 w-20 rounded object-cover" />}
                <div>
                  <p className="font-semibold text-brand-brown">{review.restaurant_name}</p>
                  <p className="text-sm font-semibold text-amber-600">★ {review.rating.toFixed(1)}</p>
                  {review.comment && <p className="mt-2 text-sm text-zinc-700">{review.comment}</p>}
                  <BotoesVotoReview
                    reviewId={review.id}
                    email={email}
                    helpfulVotes={review.helpful_votes}
                    unhelpfulVotes={review.unhelpful_votes}
                    viewerVote={review.viewer_vote}
                    onVotoRegistrado={atualizarVoto}
                  />
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  )
}

export default PerfilUsuario
