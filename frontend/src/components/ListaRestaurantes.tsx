import { useEffect, useState, type FormEvent } from 'react'

type ListaRestaurantesProps = {
  email: string
  onSelecionarRestaurante: (nome: string) => void
  onLogout: () => void
}

type Restaurante = {
  id: number
  nome: string
  categoria: string
  imagem: string | null
  mediaAvaliacoes: number | null
  quantidadeAvaliacoes: number
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
  }[]
  return resultados.map((restaurante) => ({
    id: restaurante.id,
    nome: restaurante.name,
    categoria: restaurante.category,
    imagem: restaurante.image_url,
    mediaAvaliacoes: restaurante.average_rating,
    quantidadeAvaliacoes: restaurante.review_count,
  }))
}

function ListaRestaurantes({
  email,
  onSelecionarRestaurante,
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
    <main className="min-h-screen bg-zinc-100 p-8">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">RestauranK</h1>
          <p className="text-sm text-zinc-600">Olá, {email}</p>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="rounded bg-red-500 px-3 py-1 text-sm text-white hover:bg-red-600"
        >
          Sair
        </button>
      </header>

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
          className="rounded bg-emerald-700 px-4 py-2 font-medium text-white hover:bg-emerald-800 disabled:opacity-60"
        >
          {carregando ? 'Buscando...' : 'Buscar'}
        </button>
      </form>

      {erro && <p role="alert" className="mb-4 text-sm text-red-700">{erro}</p>}
      {!erro && !carregando && restaurantes.length === 0 && (
        <p className="mb-4 text-sm text-zinc-600">Nenhum restaurante encontrado.</p>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {restaurantes.map((restaurante) => (
          <button
            key={restaurante.id}
            type="button"
            onClick={() => onSelecionarRestaurante(restaurante.nome)}
            className="rounded-lg border border-zinc-200 bg-white p-4 text-left shadow-md transition hover:border-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
          >
            {restaurante.imagem && (
              <img
                src={restaurante.imagem}
                alt={restaurante.nome}
                className="mb-3 h-40 w-full rounded-md object-cover"
              />
            )}
            <h2 className="text-xl font-semibold text-zinc-800">
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
