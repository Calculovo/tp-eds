import { useEffect, useState } from 'react'
import TopReviews from './TopReviews'

type ListaRestaurantesProps = {
  email: string
  viewerId: number | null
  consulta: string
  onSelecionarRestaurante: (restaurante: Restaurante) => void
  onSelecionarRestaurantePorId: (restaurantId: number) => void
  onSelecionarUsuario: (userId: number) => void
  erroCarregamentoRestaurante: string
}

export type Restaurante = {
  id: number
  nome: string
  categoria: string
  imagem: string | null
  mediaAvaliacoes: number | null
  quantidadeAvaliacoes: number
  contagemAvaliacoes: number[]
}

async function carregarRestaurantes(nome: string): Promise<Restaurante[]> {
  const resposta = await fetch(
    `/api/restaurants?name=${encodeURIComponent(nome)}`,
  )
  if (!resposta.ok) {
    throw new Error('Não foi possível buscar restaurantes.')
  }

  const resultados = (await resposta.json()) as {
    id: number
    name: string
    category: string
    image_url: string | null
    average_rating: number | null
    review_count: number
    rating_counts: number[]
  }[]
  return resultados.map((restaurante) => ({
    id: restaurante.id,
    nome: restaurante.name,
    categoria: restaurante.category,
    imagem: restaurante.image_url,
    mediaAvaliacoes: restaurante.average_rating,
    quantidadeAvaliacoes: restaurante.review_count,
    contagemAvaliacoes: restaurante.rating_counts,
  }))
}

function ListaRestaurantes({
  email,
  viewerId,
  consulta,
  onSelecionarRestaurante,
  onSelecionarRestaurantePorId,
  onSelecionarUsuario,
  erroCarregamentoRestaurante,
}: ListaRestaurantesProps) {
  const [restaurantes, setRestaurantes] = useState<Restaurante[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  useEffect(() => {
    let ativa = true
    setCarregando(true)
    setErro('')

    carregarRestaurantes(consulta)
      .then((resultados) => {
        if (ativa) setRestaurantes(resultados)
      })
      .catch(() => {
        if (ativa) {
          setRestaurantes([])
          setErro('Não foi possível buscar restaurantes. Tente novamente.')
        }
      })
      .finally(() => {
        if (ativa) setCarregando(false)
      })

    return () => {
      ativa = false
    }
  }, [consulta])

  return (
    <main className="min-h-screen bg-brand-cream p-5 sm:p-8">
      {erroCarregamentoRestaurante && (
        <p role="alert" className="mb-4 text-sm text-brand-tomato">
          {erroCarregamentoRestaurante}
        </p>
      )}

      <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,1.6fr)_minmax(20rem,1fr)]">
        <section aria-labelledby="restaurantes-titulo">
          <h2 id="restaurantes-titulo" className="mb-4 text-2xl font-bold text-brand-brown">
            Restaurantes
          </h2>
          {erro && <p role="alert" className="mb-4 text-sm text-brand-tomato">{erro}</p>}
          {carregando && <p className="mb-4 text-sm text-zinc-600">Carregando restaurantes...</p>}
          {consulta && !carregando && !erro && restaurantes.length === 0 && (
            <p className="mb-4 text-sm text-zinc-600">Nenhum restaurante encontrado.</p>
          )}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {restaurantes.map((restaurante) => (
              <button
                key={restaurante.id}
                type="button"
                onClick={() => onSelecionarRestaurante(restaurante)}
                className="rounded-lg border border-zinc-200 bg-white p-4 text-left shadow-md transition hover:border-brand-tomato focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-tomato"
              >
                {restaurante.imagem && (
                  <img
                    src={restaurante.imagem}
                    alt={restaurante.nome}
                    className="mb-3 h-40 w-full rounded-md object-cover"
                  />
                )}
                <h3 className="text-xl font-semibold text-brand-brown">
                  {restaurante.nome}
                </h3>
                <p className="text-sm text-zinc-500">{restaurante.categoria}</p>
                <p className="mt-3 font-bold text-amber-600">
                  {restaurante.mediaAvaliacoes === null
                    ? 'Sem avaliações'
                    : `★ ${restaurante.mediaAvaliacoes.toFixed(1)} / 5 (${restaurante.quantidadeAvaliacoes} ${restaurante.quantidadeAvaliacoes === 1 ? 'avaliação' : 'avaliações'})`}
                </p>
              </button>
            ))}
          </div>
        </section>
        <TopReviews
          email={email}
          viewerId={viewerId}
          onSelecionarUsuario={onSelecionarUsuario}
          onSelecionarRestaurante={onSelecionarRestaurantePorId}
        />
      </div>
    </main>
  )
}

export default ListaRestaurantes
