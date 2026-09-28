import { useEffect, useState, type FormEvent } from 'react'
import BuscaUsuarios from './BuscaUsuarios'
import BrandLogo from './BrandLogo'

type ListaRestaurantesProps = {
  email: string
  viewerId: number | null
  onSelecionarRestaurante: (restaurante: Restaurante) => void
  onSelecionarUsuario: (userId: number) => void
  onLogout: () => void
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
  onSelecionarRestaurante,
  onSelecionarUsuario,
  onLogout,
}: ListaRestaurantesProps) {
  const [nomeBusca, setNomeBusca] = useState('')
  const [consulta, setConsulta] = useState('')
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

  async function buscarRestaurantes(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setConsulta(nomeBusca.trim())
  }

  return (
    <main className="min-h-screen bg-brand-cream p-8">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <BrandLogo compact />
          <p className="text-sm text-zinc-600">Olá, {email}</p>
        </div>
        <nav className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => viewerId !== null && onSelecionarUsuario(viewerId)}
            disabled={viewerId === null}
            className="rounded border border-brand-tomato px-3 py-1 text-sm font-medium text-brand-tomato hover:bg-brand-tomato/10 disabled:opacity-60"
          >
            Meu perfil
          </button>
          <button
            type="button"
            onClick={onLogout}
            className="rounded bg-brand-brown px-3 py-1 text-sm text-white hover:bg-brand-tomato"
          >
            Sair
          </button>
        </nav>
      </header>

      <BuscaUsuarios onSelecionarUsuario={onSelecionarUsuario} />

      <form onSubmit={buscarRestaurantes} className="mb-8 flex gap-2">
        <input
          type="search"
          value={nomeBusca}
          onChange={(event) => {
            const valor = event.target.value
            setNomeBusca(valor)
            if (!valor.trim()) setConsulta('')
          }}
          placeholder="Buscar restaurante por nome"
          aria-label="Nome do restaurante"
          className="min-w-0 flex-1 rounded border border-zinc-300 bg-white px-3 py-2"
        />
        <button
          type="submit"
          disabled={carregando}
          className="rounded bg-brand-tomato px-4 py-2 font-medium text-white hover:bg-brand-brown disabled:opacity-60"
        >
          {carregando ? 'Buscando...' : 'Buscar'}
        </button>
      </form>

      {erro && <p role="alert" className="mb-4 text-sm text-brand-tomato">{erro}</p>}
      {!erro && !carregando && restaurantes.length === 0 && (
        <p className="mb-4 text-sm text-zinc-600">Nenhum restaurante encontrado.</p>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
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
            <h2 className="text-xl font-semibold text-brand-brown">
              {restaurante.nome}
            </h2>
            <p className="text-sm text-zinc-500">{restaurante.categoria}</p>
            <p className="mt-3 font-bold text-amber-600">
              {restaurante.mediaAvaliacoes === null
                ? 'Sem avaliações'
                : `★ ${restaurante.mediaAvaliacoes.toFixed(1)} / 5 (${restaurante.quantidadeAvaliacoes} ${restaurante.quantidadeAvaliacoes === 1 ? 'avaliação' : 'avaliações'})`}
            </p>
          </button>
        ))}
      </div>
    </main>
  )
}

export default ListaRestaurantes
