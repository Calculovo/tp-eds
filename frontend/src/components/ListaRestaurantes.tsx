import { useEffect, useState, type FormEvent } from 'react'
import BuscaUsuarios from './BuscaUsuarios'
import BrandLogo from './BrandLogo'
import TopReviews from './TopReviews'

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
      <header className="mb-8 flex flex-wrap items-center justify-between gap-5">
        <div>
          <BrandLogo />
          {/* Extrai o nome antes do @ para a saudação */}
          <p className="text-sm text-zinc-600">Olá, {email.split('@')[0]}</p>
        </div>
        <nav className="ml-auto flex flex-wrap items-center justify-end gap-2 sm:gap-3">
          <BuscaUsuarios onSelecionarUsuario={onSelecionarUsuario} />
          <form
            onSubmit={buscarRestaurantes}
            role="search"
            className="relative w-full sm:w-52"
          >
            <input
              type="search"
              value={nomeBusca}
              onChange={(event) => {
                const valor = event.target.value
                setNomeBusca(valor)
                if (!valor.trim()) setConsulta('')
              }}
              placeholder="Busque um restaurante"
              aria-label="Busque um restaurante"
              className="w-full rounded-full border border-zinc-300 bg-white py-2 pl-4 pr-11 text-sm shadow-sm outline-none transition placeholder:text-zinc-500 focus:border-brand-tomato focus:ring-2 focus:ring-brand-tomato/20"
            />
            <button
              type="submit"
              disabled={carregando}
              aria-label="Buscar restaurante"
              className="absolute right-1 top-1 flex h-8 w-8 items-center justify-center rounded-full text-brand-tomato transition hover:bg-brand-tomato/10 disabled:opacity-60"
            >
              {carregando ? (
                <span className="text-xs" aria-hidden="true">…</span>
              ) : (
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-4 w-4 stroke-current" strokeWidth="2">
                  <circle cx="10.8" cy="10.8" r="6.3" />
                  <path d="m16 16 4 4" strokeLinecap="round" />
                </svg>
              )}
            </button>
          </form>
          {/* Botão de avatar redondo vermelho */}
          <button
            type="button"
            onClick={() => viewerId !== null && onSelecionarUsuario(viewerId)}
            disabled={viewerId === null}
            aria-label="Meu perfil"
            title="Meu perfil"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-tomato text-lg font-bold text-white transition hover:bg-brand-brown disabled:opacity-60"
          >
            {email.charAt(0).toUpperCase()}
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
        <TopReviews onSelecionarUsuario={onSelecionarUsuario} />
      </div>
    </main>
  )
}

export default ListaRestaurantes
