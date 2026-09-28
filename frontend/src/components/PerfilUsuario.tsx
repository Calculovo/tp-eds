import { useEffect, useState } from 'react'
import ListaRelacoes from './ListaRelacoes'

type Review = {
  id: number
  restaurant_name: string
  restaurant_image_url: string | null
  rating: number
  comment: string | null
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
  onVoltar: () => void
  onSelecionarUsuario: (userId: number) => void
}

function PerfilUsuario({
  userId,
  viewerId,
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

  return (
    <main className="min-h-screen bg-zinc-100 p-8">
      <button type="button" onClick={onVoltar} className="mb-8 rounded px-3 py-2 text-sm font-medium text-emerald-800 hover:bg-emerald-50">Voltar</button>
      {carregando && <p className="text-sm text-zinc-600">Carregando perfil...</p>}
      {erro && <p role="alert" className="text-sm text-red-700">{erro}</p>}
      {perfil && (
        <>
          <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-zinc-900">{perfil.username}</h1>
              <div className="mt-2 flex gap-4 text-sm">
                <button
                  type="button"
                  onClick={() => setListaSelecionada('followers')}
                  aria-expanded={listaSelecionada === 'followers'}
                  className="text-zinc-600 hover:text-emerald-800 hover:underline"
                >
                  {perfil.followers_count} seguidores
                </button>
                <button
                  type="button"
                  onClick={() => setListaSelecionada('following')}
                  aria-expanded={listaSelecionada === 'following'}
                  className="text-zinc-600 hover:text-emerald-800 hover:underline"
                >
                  {perfil.following_count} seguindo
                </button>
              </div>
            </div>
            {podeSeguir && (
              <button
                type="button"
                onClick={alternarSeguir}
                className={`rounded px-4 py-2 text-sm font-medium text-white ${
                  perfil.is_following
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-emerald-700 hover:bg-emerald-800'
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
          <h2 className="mb-4 text-xl font-semibold text-zinc-900">Histórico de reviews</h2>
          {perfil.reviews.length === 0 && <p className="text-sm text-zinc-600">Este usuário ainda não fez reviews.</p>}
          <ul className="space-y-4">
            {perfil.reviews.map((review) => (
              <li key={review.id} className="flex gap-4 rounded-lg border border-zinc-200 bg-white p-4">
                {review.restaurant_image_url && <img src={review.restaurant_image_url} alt="" className="h-20 w-20 rounded object-cover" />}
                <div>
                  <p className="font-semibold text-zinc-900">{review.restaurant_name}</p>
                  <p className="text-sm font-semibold text-amber-600">★ {review.rating.toFixed(1)}</p>
                  {review.comment && <p className="mt-2 text-sm text-zinc-700">{review.comment}</p>}
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
