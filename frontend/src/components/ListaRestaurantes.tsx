<<<<<<< HEAD
import { useEffect, useState, type FormEvent } from 'react'
import BuscaUsuarios from './BuscaUsuarios'

type ListaRestaurantesProps = {
  email: string
  onSelecionarRestaurante: (restaurante: Restaurante) => void
  onSelecionarUsuario: (userId: number) => void
=======
import { useState } from 'react'

type ListaRestaurantesProps = {
  email: string
  nome: string // Recebe o nome do usuário
>>>>>>> ddd1aa4732d6a66e6eeadd439eeabbed9d5f297d
  onLogout: () => void
}

type Restaurante = {
  id: number
  nome: string
  categoria: string
  nota: number
  imagem: string
}

const restaurantesIniciais: Restaurante[] = [
  {
    id: 1,
    nome: 'Pizzaria Bella Italia',
    categoria: 'Italiana',
    nota: 4.8,
    imagem: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400',
  },
  {
    id: 2,
    nome: 'Burguer House',
    categoria: 'Hambúrguer',
    nota: 4.2,
    imagem: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
  },
  {
    id: 3,
    nome: 'Sushi Garden',
    categoria: 'Japonesa',
    nota: 4.6,
    imagem: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66d?w=400',
  },
]

function ListaRestaurantes({ email, nome, onLogout }: ListaRestaurantesProps) {
  const [busca, setBusca] = useState('')
  const [menuAberto, setMenuAberto] = useState(false) // Controla a abertura do menu do bonequinho

  const restaurantesFiltrados = restaurantesIniciais.filter((r) =>
    r.nome.toLowerCase().includes(busca.toLowerCase()) ||
    r.categoria.toLowerCase().includes(busca.toLowerCase())
  )
<<<<<<< HEAD
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
=======
>>>>>>> ddd1aa4732d6a66e6eeadd439eeabbed9d5f297d

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Navbar Superior Escura */}
      <header className="sticky top-0 z-20 border-b border-zinc-800 bg-zinc-900/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-3">
            <span className="rounded-xl bg-orange-500 p-2.5 text-xl font-bold text-white shadow-lg shadow-orange-500/20">
              🍽️
            </span>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">RestauranK</h1>
              <p className="text-xs font-medium text-zinc-400">Bem-vindo(a), {nome || email}</p>
            </div>
          </div>

          {/* Menu do Bonequinho (Dropdown de Perfil) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuAberto(!menuAberto)}
              className="flex items-center space-x-2 rounded-xl border border-zinc-700 bg-zinc-800/80 px-3.5 py-2 text-sm font-semibold text-zinc-200 transition hover:bg-zinc-700 hover:text-white active:scale-95"
            >
              {/* Ícone de Bonequinho (SVG) */}
              <svg className="h-5 w-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>{nome ? nome.split(' ')[0] : 'Conta'}</span>
            </button>

            {/* Caixa de Opções do Menu */}
            {menuAberto && (
              <div className="absolute right-0 mt-2 w-48 rounded-xl border border-zinc-700 bg-zinc-900 py-2 shadow-2xl backdrop-blur-xl">
                <div className="border-b border-zinc-800 px-4 py-2">
                  <p className="text-xs font-semibold text-white">{nome}</p>
                  <p className="text-[10px] text-zinc-400 truncate">{email}</p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setMenuAberto(false)
                    alert('Abrir tela de Editar Perfil')
                  }}
                  className="flex w-full items-center px-4 py-2.5 text-xs font-medium text-zinc-300 transition hover:bg-zinc-800 hover:text-orange-400"
                >
                  ⚙️ Editar Perfil
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMenuAberto(false)
                    onLogout()
                  }}
                  className="flex w-full items-center px-4 py-2.5 text-xs font-medium text-red-400 transition hover:bg-red-500/10"
                >
                  🚪 Sair da conta
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

<<<<<<< HEAD
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
          className="rounded bg-emerald-700 px-4 py-2 font-medium text-white hover:bg-emerald-800 disabled:opacity-60"
        >
          {carregando ? 'Buscando...' : 'Buscar'}
        </button>
      </form>
=======
      {/* Conteúdo Principal */}
      <main className="mx-auto max-w-6xl px-6 py-8">
        {/* Seção de Pesquisa e Título */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white">Restaurantes em Destaque</h2>
            <p className="text-sm text-zinc-400">Explore e avalie os melhores estabelecimentos da sua região.</p>
          </div>
>>>>>>> ddd1aa4732d6a66e6eeadd439eeabbed9d5f297d

          <div className="relative w-full md:w-80">
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por nome ou categoria..."
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 py-2.5 pl-10 pr-4 text-sm font-medium text-white placeholder-zinc-500 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
            />
            <svg className="absolute left-3 top-3 h-4 w-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Grid de Cards dos Restaurantes */}
        {restaurantesFiltrados.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/50 p-12 text-center">
            <p className="text-zinc-400">Nenhum restaurante encontrado com o termo "{busca}".</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {restaurantesFiltrados.map((restaurante) => (
              <article
                key={restaurante.id}
                className="group overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/80 shadow-xl transition hover:-translate-y-1 hover:border-zinc-700"
              >
                <div className="relative h-48 w-full overflow-hidden bg-zinc-950">
                  <img
                    src={restaurante.imagem}
                    alt={restaurante.nome}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                  />
                  <span className="absolute top-3 right-3 rounded-full bg-zinc-950/80 px-3 py-1 text-xs font-bold text-orange-400 border border-zinc-800 shadow backdrop-blur-md">
                    ★ {restaurante.nota.toFixed(1)}
                  </span>
                </div>

                <div className="p-5">
                  <span className="inline-block rounded-lg bg-orange-500/10 border border-orange-500/20 px-2.5 py-1 text-xs font-semibold text-orange-400">
                    {restaurante.categoria}
                  </span>
                  <h3 className="mt-2 text-lg font-bold text-white group-hover:text-orange-400 transition">
                    {restaurante.nome}
                  </h3>
                  
                  <div className="mt-5 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => alert(`Ver avaliações de: ${restaurante.nome}`)}
                      className="rounded-xl border border-zinc-700 bg-zinc-800 py-2.5 text-xs font-semibold text-zinc-200 transition hover:bg-zinc-700 hover:text-white"
                    >
                      Ver Avaliações
                    </button>
                    <button
                      type="button"
                      onClick={() => alert(`Avaliar o restaurante: ${restaurante.nome}`)}
                      className="rounded-xl bg-orange-500 py-2.5 text-xs font-semibold text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-600 active:scale-95"
                    >
                      Avaliar ✍️
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default ListaRestaurantes