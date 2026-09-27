import { useState } from 'react'

type ListaRestaurantesProps = {
  email: string
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

function ListaRestaurantes({ email, onLogout }: ListaRestaurantesProps) {
  const [busca, setBusca] = useState('')

  // Filtra os restaurantes pelo nome ou pela categoria em tempo real
  const restaurantesFiltrados = restaurantesIniciais.filter((r) =>
    r.nome.toLowerCase().includes(busca.toLowerCase()) ||
    r.categoria.toLowerCase().includes(busca.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Navbar Superior */}
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-3">
            <span className="rounded-lg bg-orange-500 p-2 text-xl font-bold text-white shadow-sm">
              🍽️
            </span>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">RestauranK</h1>
              <p className="text-xs font-medium text-slate-500">Logado como: {email}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 active:scale-95"
          >
            Sair
          </button>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="mx-auto max-w-6xl px-6 py-8">
        {/* Seção de Pesquisa e Título */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Restaurantes em Destaque</h2>
            <p className="text-sm text-slate-500">Explore e avalie os melhores estabelecimentos da sua região.</p>
          </div>

          {/* Barra de Busca Profissional */}
          <div className="relative w-full md:w-80">
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por nome ou categoria..."
              className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm font-medium shadow-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
            />
            {/* Ícone de Lupa em SVG */}
            <svg
              className="absolute left-3 top-3 h-4 w-4 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Grid de Cards dos Restaurantes */}
        {restaurantesFiltrados.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <p className="text-slate-500">Nenhum restaurante encontrado com o termo "{busca}".</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {restaurantesFiltrados.map((restaurante) => (
              <article
                key={restaurante.id}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                  <img
                    src={restaurante.imagem}
                    alt={restaurante.nome}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                  <span className="absolute top-3 right-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-bold text-slate-800 shadow backdrop-blur-sm">
                    ★ {restaurante.nota.toFixed(1)}
                  </span>
                </div>

                <div className="p-5">
                  <span className="inline-block rounded-md bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-600">
                    {restaurante.categoria}
                  </span>
                  <h3 className="mt-2 text-lg font-bold text-slate-900 group-hover:text-orange-600 transition">
                    {restaurante.nome}
                  </h3>
                  
                  <button
                    type="button"
                    className="mt-4 w-full rounded-lg bg-slate-900 py-2 text-xs font-semibold text-white transition hover:bg-orange-500"
                  >
                    Ver Avaliações
                  </button>
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